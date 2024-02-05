<template>
  <div
    class="ft-playlist-selector grid"
    :class="{ selected: selected }"
    @click="toggleSelection"
    @keydown.enter.prevent="toggleSelection"
    @keydown.space.prevent="toggleSelection"
  >
    <div class="info">
      <span
        class="title"
      >
        {{ titleForDisplay }}
      </span>
      <font-awesome-icon
        v-if="selected"
        class="selectedIcon"
        :icon="['fas', 'check']"
      />
      <div>{{ videoCount }}</div>
    </div>
  </div>
</template>

<script src="./ft-playlist-selector.js" />
<style scoped lang="scss" src="./ft-playlist-selector.scss" />
