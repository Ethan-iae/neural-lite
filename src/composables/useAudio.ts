import { onMounted, onUnmounted } from 'vue';

const SOUND_URLS = {
  sent: '/assets/sounds/sent.mp3',
  recv: '/assets/sounds/recv.mp3',
  switch: '/assets/sounds/switch.wav'
};

const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
const audioCtx = new AudioContextClass();
const soundBuffers: Record<string, AudioBuffer | null> = {
  sent: null,
  recv: null
};

let hasUserInteracted = false;

async function loadSound(key: string, url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioCtx.decodeAudioData(
      arrayBuffer,
      (decoded) => {
        soundBuffers[key] = decoded;
        try {
          const source = audioCtx.createBufferSource();
          source.buffer = decoded;
          const silentGain = audioCtx.createGain();
          silentGain.gain.value = 0;
          source.connect(silentGain);
          silentGain.connect(audioCtx.destination);
          source.start(0);
        } catch (e) {}
        if (window.console && console.log) console.log(`✅ [音效] ${key} 预热完成`);
      },
      (err) => {
        console.error(`❌ [音效] ${key} 解码失败`, err);
      }
    );
  } catch (e) {
    console.error(`❌ [音效] ${key} 加载失败`, e);
  }
}

function initAudioSystem() {
  loadSound('sent', SOUND_URLS.sent);
  setTimeout(() => {
    loadSound('recv', SOUND_URLS.recv);
    loadSound('switch', SOUND_URLS.switch);
  }, 200);

  setInterval(() => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      osc.start(now);
      osc.stop(now + 0.001);
    } catch (e) {}
  }, 8000);
}

function checkAndResumeAudio() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function initialUnlock() {
  if (hasUserInteracted) return;
  hasUserInteracted = true;
  if (audioCtx.state !== 'running') {
    audioCtx.resume();
  }
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() - 0.5) * 0.00001;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(audioCtx.destination);
  source.start(0);
}

function playSound(type: 'sent' | 'recv' | 'switch') {
  try {
    checkAndResumeAudio();
    const buffer = soundBuffers[type];
    if (!buffer) return;
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = type === 'sent' ? 0.6 : 0.8;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
  } catch (e) {
    console.error('播放失败:', e);
  }
}

function aggressiveWakeUp() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (!hasUserInteracted) {
    initialUnlock();
  }
}

export function useAudio() {
  onMounted(() => {
    initAudioSystem();
    window.addEventListener('mousedown', aggressiveWakeUp, { passive: true });
    window.addEventListener('mousemove', aggressiveWakeUp, { passive: true });
    window.addEventListener('touchstart', aggressiveWakeUp, { passive: true });
    window.addEventListener('keydown', aggressiveWakeUp, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('mousedown', aggressiveWakeUp);
    window.removeEventListener('mousemove', aggressiveWakeUp);
    window.removeEventListener('touchstart', aggressiveWakeUp);
    window.removeEventListener('keydown', aggressiveWakeUp);
  });

  return {
    playSound,
    aggressiveWakeUp
  };
}
