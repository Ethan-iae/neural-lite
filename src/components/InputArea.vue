<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'send', text: string): void;
  (e: 'focus'): void;
}>();

const text = ref('');

const handleSend = () => {
  const trimmed = text.value.trim();
  if (trimmed) {
    emit('send', trimmed);
    text.value = '';
  }
};
</script>

<template>
  <div class="input-wrapper">
    <div class="input-box">
      <div style="position: relative; flex: 1; display: flex; align-items: center;">
        <input 
          type="search" 
          v-model="text"
          id="user-input" 
          maxlength="200" 
          placeholder="在此输入消息..." 
          autocomplete="off"
          @keypress.enter="handleSend"
          @focus="emit('focus')"
        >
      </div>
      <button id="send-btn" class="primary" @click="handleSend">发送</button>
    </div>
    <div class="resize-handle" title="拖拽调整大小"></div>
  </div>
</template>
