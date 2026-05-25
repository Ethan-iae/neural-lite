<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Header from './components/Header.vue';
import ChatBox from './components/ChatBox.vue';
import InputArea from './components/InputArea.vue';
import Modal from './components/Modal.vue';
import { useBrain } from './composables/useBrain';
import { useAudio } from './composables/useAudio';

const { messages, loadMemory, loadChatHistory, saveChatLog, processInput, resetSystem } = useBrain();
const { playSound, aggressiveWakeUp } = useAudio();

const showModal = ref(false);
const frameRef = ref<HTMLElement | null>(null);

onMounted(() => {
  loadMemory();
  loadChatHistory();
  setTimeout(() => {
    document.body.classList.remove('preload');
    const antiFlashStyle = document.getElementById('anti-flash');
    if (antiFlashStyle) antiFlashStyle.remove();
  }, 100);

  if (window.innerWidth > 768 && frameRef.value) {
    const savedWidth = localStorage.getItem('neural_lite_width');
    const savedHeight = localStorage.getItem('neural_lite_height');
    const savedLeft = localStorage.getItem('neural_lite_left');
    const savedTop = localStorage.getItem('neural_lite_top');
    
    if (savedWidth && savedHeight) {
      frameRef.value.style.maxWidth = 'none';
      frameRef.value.style.maxHeight = 'none';
      frameRef.value.style.width = savedWidth;
      frameRef.value.style.height = savedHeight;
    }
    if (savedLeft && savedTop) {
      frameRef.value.style.margin = '0';
      frameRef.value.style.position = 'absolute';
      frameRef.value.style.left = savedLeft;
      frameRef.value.style.top = savedTop;
    }
  }
  
  let isDragging = false;
  let startX = 0, startY = 0;
  
  const header = document.querySelector('.header') as HTMLElement;
  if (header) {
    header.addEventListener('mousedown', (e) => {
      if (window.innerWidth <= 768) return;
      if ((e.target as Element).closest('.win-btn') || (e.target as Element).closest('h1 span')) return;
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      if (frameRef.value) {
        const rect = frameRef.value.getBoundingClientRect();
        frameRef.value.style.margin = '0';
        frameRef.value.style.position = 'absolute';
        frameRef.value.style.left = rect.left + 'px';
        frameRef.value.style.top = rect.top + 'px';
      }
    });
  }

  const doDrag = (e: MouseEvent) => {
    if (isDragging && e.buttons === 0) {
      stopDrag();
      return;
    }
    if (!isDragging || !frameRef.value) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    frameRef.value.style.left = `${parseFloat(frameRef.value.style.left || '0') + dx}px`;
    frameRef.value.style.top = `${parseFloat(frameRef.value.style.top || '0') + dy}px`;
    startX = e.clientX;
    startY = e.clientY;
  };

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    if (frameRef.value) {
      localStorage.setItem('neural_lite_left', frameRef.value.style.left);
      localStorage.setItem('neural_lite_top', frameRef.value.style.top);
    }
  };

  let isResizing = false;
  let startWidth = 0, startHeight = 0;
  let resizeStartX = 0, resizeStartY = 0;
  
  const handle = document.querySelector('.resize-handle') as HTMLElement;
  if (handle) {
    handle.addEventListener('mousedown', (e) => {
      if (window.innerWidth <= 768 || !frameRef.value) return;
      isResizing = true;
      const rect = frameRef.value.getBoundingClientRect();
      frameRef.value.style.width = rect.width + 'px';
      frameRef.value.style.height = rect.height + 'px';
      frameRef.value.style.margin = '0';
      frameRef.value.style.position = 'absolute';
      frameRef.value.style.left = rect.left + 'px';
      frameRef.value.style.top = rect.top + 'px';
      startWidth = rect.width;
      startHeight = rect.height;
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      frameRef.value.style.maxWidth = 'none';
      frameRef.value.style.maxHeight = 'none';
      e.preventDefault();
    });
  }
  
  const doResize = (e: MouseEvent) => {
    if (!isResizing || !frameRef.value) return;
    const newWidth = startWidth + (e.clientX - resizeStartX);
    const newHeight = startHeight + (e.clientY - resizeStartY);
    if (newWidth > 320) frameRef.value.style.width = newWidth + 'px';
    if (newHeight > 300) frameRef.value.style.height = newHeight + 'px';
  };
  
  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;
    if (frameRef.value) {
      localStorage.setItem('neural_lite_width', frameRef.value.style.width);
      localStorage.setItem('neural_lite_height', frameRef.value.style.height);
    }
  };

  document.addEventListener('mousemove', (e) => {
    if (isDragging) doDrag(e);
    if (isResizing) doResize(e);
  });
  document.addEventListener('mouseup', () => {
    stopDrag();
    stopResize();
  });
  document.addEventListener('mouseleave', () => {
    stopDrag();
  });
  window.addEventListener('blur', stopDrag);
});

const handleSend = async (text: string) => {
  playSound('sent');
  const userMsgId = 'user-' + Date.now();
  messages.value.push({
    id: userMsgId,
    role: 'user',
    text: text,
    timestamp: Date.now()
  });
  saveChatLog();

  setTimeout(async () => {
    playSound('recv');
    const typingId = 'typing-' + Date.now();
    messages.value.push({
      id: typingId,
      role: 'ai',
      text: '', // Empty text shows typing dots initially
      isTyping: true,
      timestamp: Date.now()
    });

    const thinkingTimeout = setTimeout(() => {
      const idx = messages.value.findIndex(m => m.id === typingId);
      if (idx !== -1 && messages.value[idx].isTyping) {
        messages.value[idx].text = '正在思考中...';
      }
    }, 5000);

    const replyObj = await processInput(text);
    clearTimeout(thinkingTimeout);
    
    const idx = messages.value.findIndex(m => m.id === typingId);
    if (idx !== -1) {
      messages.value[idx] = {
        id: typingId,
        role: 'ai',
        text: replyObj?.text || '',
        html: replyObj?.html || '',
        timestamp: Date.now()
      };
    }
    saveChatLog();
  }, 670);
};

const handleResetClick = () => {
  showModal.value = true;
  playSound('recv');
};

const handleConfirmReset = () => {
  resetSystem();
  playSound('sent');
  if (window.innerWidth > 768 && frameRef.value) {
    frameRef.value.style.width = '';
    frameRef.value.style.height = '';
    frameRef.value.style.maxWidth = '';
    frameRef.value.style.maxHeight = '';
    frameRef.value.style.margin = '';
    frameRef.value.style.position = '';
    frameRef.value.style.left = '';
    frameRef.value.style.top = '';
  }
};
</script>

<template>
  <div class="window-frame" ref="frameRef">
    <Header @reset="handleResetClick" />
    <Modal v-model="showModal" @confirm="handleConfirmReset" />
    <ChatBox :messages="messages" />
    <InputArea @send="handleSend" @focus="aggressiveWakeUp" />
  </div>
</template>
