<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  role: 'user' | 'ai';
  text: string;
  html?: string | null;
  isTyping?: boolean;
}>();

const formatHtml = computed(() => {
  if (props.isTyping) {
    return `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  }
  return props.html || props.text;
});
</script>

<template>
  <div :class="['message-row', role]">
    <template v-if="role === 'ai'">
      <div class="avatar ai-avatar">AI</div>
      <div class="bubble ai-bubble" v-html="formatHtml"></div>
    </template>
    
    <template v-else>
      <div class="bubble user-bubble" v-html="formatHtml"></div>
      <div class="avatar user-avatar">Me</div>
    </template>
  </div>
</template>
