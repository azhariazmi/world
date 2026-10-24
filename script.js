class TheaterAudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCurtainRustle() {
    if (!this.ctx) return;

    const duration = 3.5;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 1.5);
    filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playChimeChords() {
    if (!this.ctx) return;

    const frequencies = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25];

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.12));

      gain.gain.setValueAtTime(0, this.ctx.currentTime + (idx * 0.12));
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + (idx * 0.12) + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + (idx * 0.12));
      osc.stop(this.ctx.currentTime + 5);
    });
  }
}

class DustParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles(60);
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.4 + 0.1
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y > this.canvas.height) p.y = 0;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.x < 0) p.x = this.canvas.width;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 225, 180, ${p.alpha})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const audioEngine = new TheaterAudioEngine();
  const dustSystem = new DustParticleSystem('dustCanvas');

  const entranceOverlay = document.getElementById('entranceOverlay');
  const startBtn = document.getElementById('startBtn');
  const curtainView = document.getElementById('curtainView');
  const spotlightCone = document.getElementById('spotlightCone');
  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  const portraitWrapper = document.getElementById('portraitWrapper');
  const ctaContainer = document.getElementById('ctaContainer');
  const enterBtn = document.getElementById('enterBtn');
  const appViewport = document.getElementById('appViewport');
  const appFrame = document.getElementById('appFrame');

  const targetUrl = "https://1tools.edgeone.dev/";

  // Pre-set frame src early
  appFrame.src = targetUrl;

  function typeWriter(element, text, speed, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        element.style.opacity = '1';
        let i = 0;
        function type() {
          if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
          } else {
            resolve();
          }
        }
        type();
      }, delay);
    });
  }

  startBtn.addEventListener('click', () => {
    audioEngine.init();
    entranceOverlay.classList.add('hidden');

    audioEngine.playCurtainRustle();
    audioEngine.playChimeChords();

    setTimeout(() => {
      curtainView.classList.add('open');
      spotlightCone.classList.add('lit');
    }, 400);

    typeWriter(line1, "Welcome To My World", 120, 1800).then(() => {
      typeWriter(line2, "By Azhari Azmi", 90, 400).then(() => {
        setTimeout(() => {
          portraitWrapper.classList.add('visible');
        }, 400);

        setTimeout(() => {
          ctaContainer.classList.add('visible');
        }, 1200);
      });
    });
  });

  enterBtn.addEventListener('click', () => {
    audioEngine.playCurtainRustle();
    curtainView.classList.remove('open');

    setTimeout(() => {
      appViewport.classList.add('active');

      // Fallback: If target site blocks iframe embedding via headers, redirect directly
      let hasLoaded = false;
      appFrame.onload = () => {
        hasLoaded = true;
        appViewport.classList.add('loaded');
      };

      setTimeout(() => {
        if (!hasLoaded) {
          window.location.href = targetUrl;
        }
      }, 3500);
    }, 1200);
  });
});
              
