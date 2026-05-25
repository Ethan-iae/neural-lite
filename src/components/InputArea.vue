<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  (e: 'send', text: string): void;
  (e: 'focus'): void;
}>();

const inputText = ref('');
const showEmojiPanel = ref(false);

const commonEmojis = [
  '1f600', '1f601', '1f602', '1f603', '1f604', '1f605',
  '1f606', '1f609', '1f60a', '1f60b', '1f60c', '1f60d',
  '1f60f', '1f612', '1f613', '1f614', '1f622', '1f62d'
];

const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value;
};

const insertEmojiText = (code: string) => {
  inputText.value += `[emoji:${code}]`;
  showEmojiPanel.value = false;
};

const handleSend = () => {
  const text = inputText.value.trim();
  if (text) {
    emit('send', text);
    inputText.value = '';
    showEmojiPanel.value = false;
  }
};

const handleFocus = () => {
  emit('focus');
  showEmojiPanel.value = false;
};

// Close panel when clicking outside
const closePanel = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.input-wrapper')) {
    showEmojiPanel.value = false;
  }
};

onMounted(() => document.addEventListener('click', closePanel));
onUnmounted(() => document.removeEventListener('click', closePanel));
</script>

<template>
  <div class="input-wrapper">
    <div class="input-box">
      <div style="position: relative; flex: 1; display: flex; align-items: center;">
        <input 
          type="search" 
          v-model="inputText"
          maxlength="200" 
          placeholder="在此输入消息..." 
          autocomplete="off"
          @keypress.enter="handleSend"
          @focus="handleFocus"
        >
        
        <div 
          class="emoji-btn" 
          @click="toggleEmojiPanel"
          style="position: absolute; right: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; opacity: 0.5; transition: opacity 0.2s;"
          @mouseover="$event.currentTarget.style.opacity='0.8'" 
          @mouseout="$event.currentTarget.style.opacity='0.5'"
        >
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L0.535898 0.75L7.4641 0.75L4 6Z" fill="#333" />
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>

        <div 
          v-show="showEmojiPanel"
          class="emoji-panel"
          style="position: absolute; bottom: 40px; right: 0; width: 220px; background: #ececec; border: 1px solid #999; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 1000; padding: 10px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;"
        >
          <img 
            v-for="code in commonEmojis" 
            :key="code" 
            :src="`/assets/emojis/${code}.png`" 
            @click="insertEmojiText(code)"
            style="width: 24px; height: 24px; cursor: pointer;"
            :title="code"
          />
        </div>
      </div>
      <button class="primary" @click="handleSend">发送</button>
    </div>
    <div class="resize-handle" title="拖拽调整大小"></div>
  </div>
</template>
