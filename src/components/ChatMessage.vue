<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  role: 'user' | 'ai';
  text: string;
  html?: string | null;
  isTyping?: boolean;
}>();

const formatHtml = computed(() => {
  if (props.isTyping && !props.text.includes('思考')) {
    return `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  }
  if (props.isTyping && props.text.includes('思考')) {
    return `<i>${props.text}</i>`;
  }
  let out = props.html || props.text;
  // Parse emoji tags: [emoji:1f600]
  out = out.replace(/\[emoji:([a-zA-Z0-9_-]+)\]/g, '<img src="/assets/emojis/$1.webp" style="width: 20px; height: 20px; vertical-align: middle; display: inline-block;">');
  return out;
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
