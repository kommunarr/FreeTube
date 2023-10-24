import { defineComponent } from 'vue'
import FtChannelBubble from '../ft-channel-bubble/ft-channel-bubble.vue'
import FtFlexBox from '../ft-flex-box/ft-flex-box.vue'
import SideNavMoreOptions from '../side-nav-more-options/side-nav-more-options.vue'
import { youtubeImageUrlToInvidious } from '../../helpers/api/invidious'
import { deepCopy, sortListUsingMethod } from '../../helpers/utils'

export default defineComponent({
  name: 'SideNav',
  components: {
    'ft-channel-bubble': FtChannelBubble,
    'ft-flex-box': FtFlexBox,
    'side-nav-more-options': SideNavMoreOptions
  },
  computed: {
    isOpen: function () {
      return this.$store.getters.getIsSideNavOpen
    },
    backendFallback: function () {
      return this.$store.getters.getBackendFallback
    },
    backendPreference: function () {
      return this.$store.getters.getBackendPreference
    },
    currentInvidiousInstance: function () {
      return this.$store.getters.getCurrentInvidiousInstance
    },
    profileList: function () {
      return this.$store.getters.getProfileList
    },
    activeProfile: function () {
      return this.$store.getters.getActiveProfile
    },
    locale: function () {
      return this.$i18n.locale.replace('_', '-')
    },
    activeSubscriptions: function () {
      const subscriptions = deepCopy(this.activeProfile.subscriptions)

      sortListUsingMethod(subscriptions, 'name', this.subscriptionListOptions.sort)

      if (this.backendPreference === 'invidious') {
        subscriptions.forEach((channel) => {
          channel.thumbnail = youtubeImageUrlToInvidious(channel.thumbnail, this.currentInvidiousInstance)
        })
      }

      return subscriptions
    },
    hidePopularVideos: function () {
      return this.$store.getters.getHidePopularVideos
    },
    hidePlaylists: function () {
      return this.$store.getters.getHidePlaylists
    },
    hideTrendingVideos: function () {
      return this.$store.getters.getHideTrendingVideos
    },
    hideActiveSubscriptions: function () {
      return this.$store.getters.getHideActiveSubscriptions
    },
    hideLabelsSideBar: function () {
      return this.$store.getters.getHideLabelsSideBar
    },
    hideText: function () {
      return !this.isOpen && this.hideLabelsSideBar
    },
    subscriptionListOptions: function () {
      return this.$store.getters.getSubscriptionListOptions
    },
    applyNavIconExpand: function() {
      return {
        navIconExpand: this.hideText
      }
    },
    applyHiddenLabels: function() {
      return {
        hiddenLabels: this.hideText
      }
    },
  },
  methods: {
    navigate: function (route) {
      this.$router.push('/' + route)
    },
  }
})
