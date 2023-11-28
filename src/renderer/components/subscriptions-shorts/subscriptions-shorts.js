import { defineComponent } from 'vue'
import { mapActions, mapMutations } from 'vuex'
import SubscriptionsTabUI from '../subscriptions-tab-ui/subscriptions-tab-ui.vue'

import { parseYouTubeRSSFeed, updateVideoListAfterProcessing, loadSubscriptionVideosFromCacheOrServer } from '../../helpers/subscriptions'
import { copyToClipboard, getRelativeTimeFromDate, showToast } from '../../helpers/utils'

export default defineComponent({
  name: 'SubscriptionsShorts',
  components: {
    'subscriptions-tab-ui': SubscriptionsTabUI
  },
  data: function () {
    return {
      isLoading: false,
      videoList: [],
      errorChannels: [],
      attemptedFetch: false,
      updatedChannelsCount: 0
    }
  },
  computed: {
    backendPreference: function () {
      return this.$store.getters.getBackendPreference
    },

    backendFallback: function () {
      return this.$store.getters.getBackendFallback
    },

    currentInvidiousInstance: function () {
      return this.$store.getters.getCurrentInvidiousInstance
    },

    lastShortRefreshTimestamp: function () {
      return getRelativeTimeFromDate(this.$store.getters.getLastShortRefreshTimestampByProfile(this.activeProfileId), true)
    },

    activeProfile: function () {
      return this.$store.getters.getActiveProfile
    },
    activeProfileId: function () {
      return this.activeProfile._id
    },

    cacheEntriesForAllActiveProfileChannels() {
      const entries = []
      this.activeSubscriptionList.forEach((channel) => {
        const cacheEntry = this.$store.getters.getShortsCacheByChannel(channel.id)
        if (cacheEntry == null) { return }

        entries.push(cacheEntry)
      })
      return entries
    },
    videoCacheForAllActiveProfileChannelsPresent() {
      if (this.cacheEntriesForAllActiveProfileChannels.length === 0) { return false }
      if (this.cacheEntriesForAllActiveProfileChannels.length < this.activeSubscriptionList.length) { return false }

      return this.nonNullCacheEntriesCount < this.cacheEntriesForAllActiveProfileChannels.length
    },
    nonNullCacheEntriesCount() {
      return this.cacheEntriesForAllActiveProfileChannels
        .filter((cacheEntry) => cacheEntry.videos != null).length
    },

    activeSubscriptionList: function () {
      return this.activeProfile.subscriptions
    },

    fetchSubscriptionsAutomatically: function() {
      return this.$store.getters.getFetchSubscriptionsAutomatically
    },
  },
  watch: {
    activeProfile: async function (_) {
      loadSubscriptionVideosFromCacheOrServer(this)
    },
  },
  mounted: async function () {
    loadSubscriptionVideosFromCacheOrServer(this)
  },
  methods: {
    updateTimestampByProfile(payload) {
      this.updateLastShortRefreshTimestampByProfile(payload)
    },
    loadVideosForSubscriptionsFromRemote: async function () {
      this.updatedChannelsCount = this.activeSubscriptionList.length

      if (this.activeSubscriptionList.length === 0) {
        this.isLoading = false
        this.videoList = []
        return
      }

      const channelsToLoadFromRemote = this.activeSubscriptionList
      const videoList = []
      let channelCount = 0
      this.isLoading = true
      this.updateShowProgressBar(true)
      this.setProgressBarPercentage(0)
      this.attemptedFetch = true

      this.errorChannels = []
      const videoListFromRemote = (await Promise.all(channelsToLoadFromRemote.map(async (channel) => {
        let videos = []
        if (!process.env.IS_ELECTRON || this.backendPreference === 'invidious') {
          videos = await this.getChannelShortsInvidious(channel)
        } else {
          videos = await this.getChannelShortsLocal(channel)
        }

        channelCount++
        const percentageComplete = (channelCount / channelsToLoadFromRemote.length) * 100
        this.setProgressBarPercentage(percentageComplete)
        this.updateSubscriptionShortsCacheByChannel({
          channelId: channel.id,
          videos: videos,
          timestamp: new Date()
        })
        return videos
      }))).flatMap((o) => o)
      videoList.push(...videoListFromRemote)
      this.updateLastShortRefreshTimestampByProfile({ profileId: this.activeProfileId, timestamp: new Date() })

      this.videoList = updateVideoListAfterProcessing(videoList)
      this.isLoading = false
      this.updateShowProgressBar(false)
    },

    getChannelShortsLocal: async function (channel, failedAttempts = 0) {
      const playlistId = channel.id.replace('UC', 'UUSH')
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`

      try {
        const response = await fetch(feedUrl)

        if (response.status === 404) {
          // playlists don't exist if the channel was terminated but also if it doesn't have the tab,
          // so we need to check the channel feed too before deciding it errored, as that only 404s if the channel was terminated

          const response2 = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`, {
            method: 'HEAD'
          })

          if (response2.status === 404) {
            this.errorChannels.push(channel)
          }

          return []
        }

        return await parseYouTubeRSSFeed(await response.text(), channel.id)
      } catch (error) {
        console.error(error)
        const errorMessage = this.$t('Local API Error (Click to copy)')
        showToast(`${errorMessage}: ${error}`, 10000, () => {
          copyToClipboard(error)
        })
        switch (failedAttempts) {
          case 0:
            if (this.backendFallback) {
              showToast(this.$t('Falling back to Invidious API'))
              return this.getChannelShortsInvidious(channel, failedAttempts + 1)
            } else {
              return []
            }
          default:
            return []
        }
      }
    },

    getChannelShortsInvidious: async function (channel, failedAttempts = 0) {
      const playlistId = channel.id.replace('UC', 'UUSH')
      const feedUrl = `${this.currentInvidiousInstance}/feed/playlist/${playlistId}`

      try {
        const response = await fetch(feedUrl)

        if (response.status === 500) {
          return []
        }

        return await parseYouTubeRSSFeed(await response.text(), channel.id)
      } catch (error) {
        console.error(error)
        const errorMessage = this.$t('Invidious API Error (Click to copy)')
        showToast(`${errorMessage}: ${error}`, 10000, () => {
          copyToClipboard(error)
        })
        switch (failedAttempts) {
          case 0:
            if (process.env.IS_ELECTRON && this.backendFallback) {
              showToast(this.$t('Falling back to the local API'))
              return this.getChannelShortsLocal(channel, failedAttempts + 1)
            } else {
              return []
            }
          default:
            return []
        }
      }
    },

    ...mapActions([
      'updateShowProgressBar',
      'updateSubscriptionShortsCacheByChannel',
      'updateLastShortRefreshTimestampByProfile'
    ]),

    ...mapMutations([
      'setProgressBarPercentage'
    ])
  }
})
