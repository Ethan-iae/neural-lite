import { reactive, ref } from 'vue';

export interface ChatMemory {
  name: string;
  topic: string | null;
  mood: number;
  [key: string]: any;
}

export interface ChatHistoryItem {
  q: string;
  a: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'ai';
  text: string;
  html?: string | null;
  timestamp: number;
  isTyping?: boolean;
}

export function escapeHTML(str: string) {
  return str.replace(/[&<>'"]/g, (tag) => {
    const chars: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return chars[tag] || tag;
  });
}

// Global state
const memory = reactive<ChatMemory>({
  name: '朋友',
  topic: null,
  mood: 0
});

const history = ref<ChatHistoryItem[]>([]);
const messages = ref<ChatMessageItem[]>([]);

export function useBrain() {
  const loadMemory = () => {
    const saved = localStorage.getItem('neural_lite_memory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.assign(memory, parsed);
        }
      } catch (e) {
        console.error('记忆文件损坏，重置为默认');
      }
    }
  };

  const saveMemory = () => {
    try {
      localStorage.setItem('neural_lite_memory', JSON.stringify(memory));
    } catch (e) {
      console.error('保存记忆失败:', e);
    }
  };

  const saveContext = (userInput: string, aiResponse: string) => {
    if (history.value.length >= 8) {
      history.value.shift();
    }
    history.value.push({ q: userInput, a: aiResponse });
  };

  const loadChatHistory = () => {
    const logs = JSON.parse(localStorage.getItem('chat_logs') || '[]');
    if (logs.length === 0) {
      // First session
      const now = Date.now();
      messages.value.push({
        id: 'welcome-' + now,
        role: 'ai',
        text: '你好！ 我是连接云端大模型的 AI ，很高兴协助你。 <br><br>试试问我：<ul><li>“人类存在的意义是什么?”</li><li>“北京今天的天气怎么样?”</li></ul><div class="similarity-score">系统消息</div>',
        html: '你好！ 我是连接云端大模型的 AI ，很高兴协助你。 <br><br>试试问我：<ul><li>“人类存在的意义是什么?”</li><li>“北京今天的天气怎么样?”</li></ul><div class="similarity-score">系统消息</div>',
        timestamp: now
      });
    } else {
      messages.value = logs.map((log: any, index: number) => ({
        id: 'history-' + index + '-' + (log.timestamp || Date.now()),
        role: log.role,
        text: log.text,
        html: log.html,
        timestamp: log.timestamp || Date.now()
      }));
    }
  };

  const saveChatLog = () => {
    // Only save non-typing messages
    const logsToSave = messages.value
      .filter((m) => !m.isTyping)
      .map((m) => ({
        text: m.text,
        role: m.role,
        timestamp: m.timestamp,
        html: m.html
      }));
    localStorage.setItem('chat_logs', JSON.stringify(logsToSave));
  };

  const processInput = async (input: string) => {
    if (!input) return null;
    const text = input.trim();
    let finalResponse = '';
    let finalHtml = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.value,
          memory: memory
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('服务器返回了非JSON数据，状态码: ' + response.status);
      }

      if (data.memory) {
        Object.assign(memory, data.memory);
        saveMemory();
      }

      if (data.reply) {
        finalResponse = data.reply.trim();
        finalHtml = data.html || escapeHTML(finalResponse).replace(/\n/g, '<br>');
        saveContext(text, finalResponse);
      } else if (data.error) {
        finalResponse = '【系统错误】' + data.error + (data.details ? ': ' + data.details : '');
        finalHtml = escapeHTML(finalResponse);
        saveContext(text, finalResponse);
      } else {
        throw new Error('模型返回异常，缺少回复内容');
      }
    } catch (e: any) {
      console.error('请求失败:', e);
      finalResponse = '我的云端神经元似乎断线了... (' + e.message + ')';
      finalHtml = escapeHTML(finalResponse);
      saveContext(text, finalResponse);
    }

    return { text: finalResponse, html: finalHtml };
  };

  const resetSystem = () => {
    localStorage.removeItem('chat_logs');
    localStorage.removeItem('neural_lite_memory');
    
    // Clear styles saved in localstorage
    localStorage.removeItem('neural_lite_width');
    localStorage.removeItem('neural_lite_height');
    localStorage.removeItem('neural_lite_left');
    localStorage.removeItem('neural_lite_top');

    Object.assign(memory, { name: '朋友', topic: null, mood: 0 });
    history.value = [];
    messages.value = [];
    
    // re-init
    loadChatHistory();
  };

  return {
    memory,
    history,
    messages,
    loadMemory,
    saveMemory,
    loadChatHistory,
    saveChatLog,
    processInput,
    resetSystem
  };
}
