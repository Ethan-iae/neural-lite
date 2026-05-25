<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

const isClosing = ref(false);

const close = () => {
  isClosing.value = true;
  setTimeout(() => {
    isClosing.value = false;
    emit('update:modelValue', false);
  }, 250);
};

const confirm = () => {
  emit('confirm');
  close();
};

watch(() => props.modelValue, (val) => {
  if (val) {
    isClosing.value = false;
  }
});
</script>

<template>
  <div v-show="modelValue || isClosing" :class="['modal-overlay', { 'modal-closing': isClosing }]">
    <div class="modal-window">
      <div class="modal-header"></div>
      <div class="modal-body">
        <div class="modal-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="alert-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffe138" />
                    <stop offset="100%" stop-color="#f5a623" />
                </linearGradient>
                <filter id="alert-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />
                </filter>
            </defs>
            <path d="M32 4 L4 56 L60 56 Z" fill="url(#alert-grad)" filter="url(#alert-shadow)"
                stroke="#d68f00" stroke-width="1" />
            <path d="M32 22 L32 40" stroke="#fff" stroke-width="5" stroke-linecap="round"
                filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))" />
            <circle cx="32" cy="48" r="3" fill="#fff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.2))" />
          </svg>
        </div>
        <div class="modal-text">
            <h2>确定要清除系统记忆吗？</h2>
            <p>如果执行此操作，所有聊天记录和 AI 记忆将被永久删除，此操作无法撤销。</p>
        </div>
      </div>
      <div class="modal-buttons">
        <button class="secondary" @click="close">取消</button>
        <button class="primary" @click="confirm">清除</button>
      </div>
    </div>
  </div>
</template>
