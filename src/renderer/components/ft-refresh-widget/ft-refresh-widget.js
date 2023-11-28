import { defineComponent } from 'vue'

import FtIconButton from '../ft-icon-button/ft-icon-button.vue'

export default defineComponent({
  name: 'FtRefreshWidget',
  components: {
    'ft-icon-button': FtIconButton,
  },
  props: {
    disableRefresh: {
      type: Boolean,
      default: false
    },
    lastRefreshTimestamp: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    updatedChannelsCount: {
      type: Number,
      default: 0
    },
    totalChannelsCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    isSideNavOpen: function () {
      return this.$store.getters.getIsSideNavOpen
    },
    lastRefreshTimestampLabel: function () {
      return this.updatedChannelsCount === this.totalChannelsCount
        ? this.$t('Feed.Feed Last Updated', { feedName: this.title, date: this.lastRefreshTimestamp })
        : this.$t('Feed.Feed Last Updated For Channels', {
          feedName: this.title,
          date: this.lastRefreshTimestamp,
          someChannelsCount: this.updatedChannelsCount,
          allChannelsCount: this.totalChannelsCount
        })
    }
  }
})
