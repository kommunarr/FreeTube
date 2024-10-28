<template>
  <FtPrompt
    :label="title"
    @click="hide"
  >
    <h2 class="heading">
      {{ title }}
    </h2>
    <div
      class="pageBookmarkDetails"
    >
      <FtInput
        ref="pageBookmarkNameInput"
        class="pageBookmarkNameInput"
        :placeholder="$t('Name')"
        :value="name"
        :show-clear-text-button="true"
        :show-action-button="false"
        @input="e => name = e"
        @clear="e => name = ''"
        @keydown.enter.native="save"
      />
      <FtFlexBox v-if="duplicateNameCount > 0">
        <p>{{ duplicateNameMessage }}</p>
      </FtFlexBox>
    </div>
    <div class="actions-container">
      <FtFlexBox>
        <FtButton
          v-if="!isBookmarkBeingCreated"
          :label="$t('Page Bookmark.Remove Bookmark')"
          :icon="['fas', 'trash']"
          text-color="var(--destructive-text-color)"
          background-color="var(--destructive-color)"
          @click="removeBookmark"
        />
        <FtButton
          :label="$t('Save')"
          :disabled="name === ''"
          text-color="var(--text-with-accent-color)"
          background-color="var(--accent-color)"
          @click="save"
        />
        <FtButton
          :label="$t('Cancel')"
          :text-color="null"
          :background-color="null"
          @click="hide"
        />
      </FtFlexBox>
    </div>
  </FtPrompt>
</template>

<script setup>

import { computed, nextTick, onMounted, ref } from 'vue'
import FtFlexBox from '../ft-flex-box/ft-flex-box.vue'
import FtPrompt from '../ft-prompt/ft-prompt.vue'
import FtButton from '../ft-button/ft-button.vue'
import FtInput from '../../components/ft-input/ft-input.vue'
import { showToast } from '../../helpers/utils'
import { defaultBookmarkNameForRoute } from '../../helpers/strings'
import store from '../../store/index'
import i18n from '../../i18n/index'
import router from '../../router'

let name = ''
const pageBookmarkNameInput = ref(null)
const duplicateNameMessage = computed(() => i18n.tc('Page Bookmark["There is {count} other bookmark with the same name."]', duplicateNameCount, { count: duplicateNameCount }))
const pageBookmark = computed(() => store.getters.getPageBookmarkWithRoute(router.currentRoute.fullPath))
const isBookmarkBeingCreated = computed(() => !!pageBookmark.value)
const title = computed(() => isBookmarkBeingCreated.value ? i18n.t('Page Bookmark.Create Bookmark') : i18n.t('Page Bookmark.Edit Bookmark'))

const pageBookmarks = computed(() => store.getters.getPageBookmarks)
const duplicateNameCount = computed(() => {
  const currentBookmarkAdjustment = name === pageBookmark.value?.name ? -1 : 0
  return currentBookmarkAdjustment + pageBookmarks.value.filter((pageBookmark) => pageBookmark.name === name).length
})

function hide() {
  store.dispatch('hidePageBookmarkPrompt')
}

function removeBookmark() {
  store.dispatch('removePageBookmark', pageBookmark.value._id)
  showToast(i18n.t('Page Bookmark.Removed page bookmark', { name: pageBookmark.value.name }))
  hide()
}

function save() {
  const savedPageBookmark = {
    route: router.currentRoute.fullPath,
    name: name,
    isBookmark: true
  }

  if (isBookmarkBeingCreated.value) {
    store.dispatch('createPageBookmark', savedPageBookmark)
    showToast(i18n.t('Page Bookmark.Created page bookmark', { name }))
  } else if (savedPageBookmark.name !== pageBookmark.value.name) {
    store.dispatch('updatePageBookmark', savedPageBookmark)
    showToast(i18n.t('Page Bookmark.Updated page bookmark', { name }))
  }

  hide()
}

onMounted(() => {
  nextTick(() => {
    name = pageBookmark.value?.name ?? defaultBookmarkNameForRoute(router.currentRoute)
    pageBookmarkNameInput.value?.focus()
  })
})

</script>

<style scoped src="./PageBookmarkPrompt.css" />
