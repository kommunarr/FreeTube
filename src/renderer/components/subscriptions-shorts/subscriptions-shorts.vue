<template>
  <subscriptions-tab-ui
    :is-loading="isLoading"
    :video-list="videoList"
    :error-channels="errorChannels"
    :attempted-fetch="attemptedFetch"
    :last-refresh-timestamp="lastShortRefreshTimestamp"
    :updated-channels-count="updatedChannelsCount"
    :total-channels-count="activeSubscriptionList.length"
    :title="$t('Global.Shorts')"
    @refresh="loadVideosForSubscriptionsFromRemote"
  />
</template>

<script src="./subscriptions-shorts.js" />
