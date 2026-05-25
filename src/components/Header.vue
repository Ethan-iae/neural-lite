<script setup lang="ts">
const emit = defineEmits<{
  (e: 'reset'): void;
}>();
</script>

<template>
  <div class="header" id="window-header">
    <div class="window-controls">
      <div class="win-btn close" @click="emit('reset')" style="cursor: pointer;" title="重置并清空记忆"></div>
      <div class="win-btn min"></div>
      <div class="win-btn max"></div>
    </div>
    <h1>
      <span></span>
      <span class="responsive-title" @click="emit('reset')">Neural-Lite</span>
      <span class="responsive-title" style="font-weight:normal; opacity:0.6; font-size: 0.9em;"> v1.2</span>
    </h1>
    <div class="status" id="db-status">
      <span>在线</span>
    </div>
  </div>
</template>
