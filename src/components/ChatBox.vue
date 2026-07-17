<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import ChatMessage from './ChatMessage.vue';
import type { ChatMessageItem } from '../composables/useBrain';

const props = defineProps<{
  messages: ChatMessageItem[];
}>();

const chatContainer = ref<HTMLElement | null>(null);

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    const el = chatContainer.value;
    const threshold = 5;
    if (el.scrollHeight > el.clientHeight + threshold) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'auto'
      });
    }
  }
};

watch(() => props.messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const windowFrame = document.querySelector('.window-frame') as HTMLElement;
      if (windowFrame && window.innerWidth <= 768) {
        windowFrame.style.height = window.visualViewport!.height + 'px';
        setTimeout(scrollToBottom, 100);
      } else if (windowFrame) {
        windowFrame.style.height = '';
      }
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) {
        scrollToBottom();
      }
    });
  }
});
</script>

<template>
  <div id="chat-container" ref="chatContainer">
    <template v-for="(msg, index) in messages" :key="msg.id">
      <div 
        v-if="index > 1 && (msg.timestamp - messages[index-1].timestamp > 300000)" 
        class="time-divider"
      >
        {{ formatTime(msg.timestamp) }}
      </div>
      
      <ChatMessage 
        :role="msg.role" 
        :text="msg.text" 
        :html="msg.html"
        :is-typing="msg.isTyping"
      />

      <div 
        v-if="index === 0" 
        class="time-divider"
      >
        {{ formatTime(msg.timestamp) }}
      </div>
    </template>
  </div>
</template>
