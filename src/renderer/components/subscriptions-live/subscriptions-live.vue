<template>
  <subscriptions-tab-ui
    :is-loading="isLoading"
    :video-list="videoList"
    :error-channels="errorChannels"
    :attempted-fetch="attemptedFetch"
    :last-refresh-timestamp="lastLiveRefreshTimestamp"
    :updated-channels-count="updatedChannelsCount"
    :total-channels-count="activeSubscriptionList.length"
    :title="$t('Global.Live')"
    @refresh="loadVideosForSubscriptionsFromRemote"
  />
</template>

<script src="./subscriptions-live.js" />
