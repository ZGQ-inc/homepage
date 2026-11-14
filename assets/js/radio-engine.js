/**
 * NewRetroWave (NRW) Radio & Synthwave Audio Engine
 * Features:
 *  - Direct live connection to https://backend.nrwmusic.stream/api/songs
 *  - Randomized / Shuffled playlist on every visit
 *  - High-res metadata (Title, Artist, Album, Cover, Year)
 *  - Web Audio AnalyserNode integration for Butterchurn & Neon Sunset Canvas
 *  - Offline fallback to local Synthwave classics
 */

(function (window) {
  'use strict';

  const NRW_API_BASE = 'https://backend.nrwmusic.stream/api/';
  const NRW_AUDIO_BASE = 'https://backend.nrwmusic.stream/uploads/354fg6wGRd5s4J/';
  const NRW_IMAGE_BASE = 'https://backend.nrwmusic.stream/uploads/images/';

  // Local fallback tracks in case network is unreachable
  const LOCAL_FALLBACK_TRACKS = [
    {
      id: 'local-1',
      title: 'Running in the Night',
      artist_name: 'FM-84 & Ollie Wride',
      album_title: 'Atlas',
      urlsong: './old/music/Running_in_the_Night-FM-84&Ollie_Wride.mp3',
      cover: './old/music/Running_in_the_Night-FM-84&Ollie_Wride.jpg',
      duration: '04:30',
      isLocal: true
    },
    {
      id: 'local-2',
      title: 'Los Angeles',
      artist_name: 'The Midnight',
      album_title: 'Days of Thunder',
      urlsong: './old/music/The_Midnight-Los_Angeles.mp3',
      cover: './old/music/The_Midnight-Los_Angeles.png',
      duration: '06:30',
      isLocal: true
    },
    {
      id: 'local-3',
      title: "Please Don't Cry",
      artist_name: 'LeBrock',
      album_title: 'Action & Romance',
      urlsong: "./old/music/LeBrock-Please_Don`t_Cry.mp3",
      cover: "./old/music/LeBrock-Please_Don`t_Cry.png",
      duration: '04:02',
      isLocal: true
    },
    {
      id: 'local-4',
      title: 'When You Grow up, Your Heart Dies',
      artist_name: 'GUNSHIP',
      album_title: 'Dark All Day',
      urlsong: './old/music/GUNSHIP-When_You_Grow_up,_Your_Heart_Dies.mp3',
      cover: './old/music/When_You_Grow_Up,_Your_Heart_Dies-GUNSHIP.jpg',
      duration: '05:48',
      isLocal: true
    },
    {
      id: 'local-5',
      title: 'Dead of Night',
      artist_name: 'Dance With The Dead',
      album_title: 'Loved to Death',
      urlsong: './old/music/Dance_With_The_Dead-Dead_of_Night.mp3',
      cover: './old/music/Dance_With_The_Dead-Dead_of_Night.png',
      duration: '04:03',
      isLocal: true
    },
    {
      id: 'local-6',
      title: 'On the Run',
      artist_name: 'Timecop1983',
      album_title: 'Journeys',
      urlsong: './old/music/Timecop1983-On_the_Run.mp3',
      cover: './old/music/Timecop1983-On_the_Run.png',
      duration: '04:47',
      isLocal: true
    }
  ];

  class RadioEngine {
    constructor() {
      this.playlist = [];
      this.currentIndex = 0;
      this.isPlaying = false;
      this.volume = 0.85;
      this.isOnlineReady = false;

      // Audio Elements & Web Audio
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.volume = this.volume;
      if (window.desktopOS && !window.desktopOS.isSoundEnabled) {
        this.audio.muted = true;
      }
      this.errorTimer = null;

      this.audioContext = null;
      this.analyser = null;
      this.sourceNode = null;
      this.hasAudioContext = false;
      this.audioData = new Uint8Array(128);
      this.timeData = new Uint8Array(1024);

      // Event listeners for audio
      this.setupAudioListeners();
    }

    setupAudioListeners() {
      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.initAudioContext();
        this.emit('playstatechanged', { isPlaying: true });
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        clearTimeout(this.errorTimer);
        this.emit('playstatechanged', { isPlaying: false });
      });

      this.audio.addEventListener('ended', () => {
        if (this.isPlaying) {
          this.next();
        }
      });

      this.audio.addEventListener('timeupdate', () => {
        this.emit('timeupdated', {
          currentTime: this.audio.currentTime,
          duration: this.audio.duration || 0
        });
      });

      this.audio.addEventListener('error', (e) => {
        // Do not auto-next if the audio was intentionally paused or stopped
        if (!this.isPlaying || this.audio.paused) return;
        // Code 1 is MEDIA_ERR_ABORTED: fetching process aborted by user
        if (this.audio.error && this.audio.error.code === 1) return;

        console.warn('RadioEngine audio error, trying next track:', e);
        clearTimeout(this.errorTimer);
        this.errorTimer = setTimeout(() => {
          if (this.isPlaying) {
            this.next();
          }
        }, 1500);
      });
    }

    initAudioContext() {
      if (this.hasAudioContext) return;
      try {
        const AudioCtx = (window.getSharedAudioContext ? window.getSharedAudioContext() : null) || window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.audioContext = typeof AudioCtx === 'function' ? new AudioCtx() : AudioCtx;
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.5;
        this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.fftSize);

        // Attempt MediaElementSource connection
        try {
          this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
          this.gainNode = this.audioContext.createGain();
          const isMuted = window.desktopOS ? !window.desktopOS.isSoundEnabled : true;
          this.gainNode.gain.value = isMuted ? 0 : 1;

          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.gainNode);
          this.gainNode.connect(this.audioContext.destination);
          this.hasAudioContext = true;

          // If Butterchurn is ready, connect to it
          if (window.visualizerManager && window.visualizerManager.visualizer) {
            try {
              window.visualizerManager.visualizer.connectAudio(this.analyser);
            } catch (e) {}
          }
        } catch (corsErr) {
          console.log('Audio element CORS restricted, precision sync rhythm generator active:', corsErr);
          this.hasAudioContext = true;
        }

        // Start beat & frequency pulse loop
        this.startFrequencyLoop();
      } catch (err) {
        console.warn('Could not initialize AudioContext:', err);
      }
    }

    startFrequencyLoop() {
      const update = () => {
        if (this.isPlaying) {
          let energy = 0;
          if (this.analyser && this.sourceNode) {
            try {
              this.analyser.getByteFrequencyData(this.audioData);
              let sum = 0;
              // Bass frequencies (bins 1-12)
              for (let i = 1; i < 14; i++) {
                sum += this.audioData[i];
              }
              energy = sum / (13 * 255);
            } catch (e) {
              energy = 0;
            }
          }

          // If energy is 0 (e.g. cross-origin muted analyzer), provide synthetic rhythmic pulse
          if (energy < 0.05) {
            const t = performance.now() / 1000;
            const bpm = 120;
            const beat = Math.sin(t * (bpm / 60) * Math.PI * 2);
            energy = Math.max(0, Math.pow(Math.max(0, beat), 3) * 0.7 + (Math.sin(t * 8) * 0.1));
          }

          if (window.retroBackground) {
            window.retroBackground.setAudioEnergy(energy);
          }
        }
        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }

    async loadOnlineSongs() {
      try {
        console.log('Connecting to NRW Radio API...');
        const res = await fetch(NRW_API_BASE + 'songs', {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('API response status: ' + res.status);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          // Format tracks
          const formatted = data.map(item => ({
            id: item.id,
            title: item.title || 'Untitled',
            artist_name: item.artist_name || 'NRW Artist',
            album_title: item.album_title || 'NewRetroWave',
            urlsong: item.urlsong.startsWith('http') ? item.urlsong : (NRW_AUDIO_BASE + item.urlsong),
            cover: item.cover ? (item.cover.startsWith('//') ? 'https:' + item.cover : (item.cover.startsWith('http') ? item.cover : NRW_IMAGE_BASE + item.cover)) : './assets/images/avatar.png',
            duration: item.duration || '03:45',
            year: item.year || 2026,
            isLocal: false
          }));

          // Randomize / Shuffle playlist
          this.playlist = this.shuffleArray(formatted);
          this.isOnlineReady = true;
          console.log(`Loaded ${this.playlist.length} tracks from NRW Radio (Randomized).`);
          this.emit('playlistready', { count: this.playlist.length });
          return;
        }
      } catch (err) {
        console.warn('Failed to load NRW online library, falling back to local classics:', err);
      }

      // Fallback
      this.playlist = this.shuffleArray([...LOCAL_FALLBACK_TRACKS]);
      this.emit('playlistready', { count: this.playlist.length });
    }

    shuffleArray(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    getCurrentTrack() {
      if (this.playlist.length === 0) return null;
      return this.playlist[this.currentIndex];
    }

    playTrack(index) {
      if (index >= 0 && index < this.playlist.length) {
        this.currentIndex = index;
      }
      const track = this.getCurrentTrack();
      if (!track) return;

      clearTimeout(this.errorTimer);
      this.isPlaying = true;
      this.audio.src = track.urlsong;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Audio loading or waiting for user gesture:', err.name);
        });
      }

      this.emit('songchanged', { track: track, index: this.currentIndex });
      this.emit('playstatechanged', { isPlaying: true });
    }

    play() {
      clearTimeout(this.errorTimer);
      this.isPlaying = true;
      if (!this.audio.src && this.playlist.length > 0) {
        this.playTrack(this.currentIndex);
      } else {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log('Play paused or blocked:', e.name));
        }
      }
      this.emit('playstatechanged', { isPlaying: true });
    }

    pause() {
      this.isPlaying = false;
      clearTimeout(this.errorTimer);
      this.audio.pause();
      this.emit('playstatechanged', { isPlaying: false });
    }

    toggle() {
      if (this.isPlaying && !this.audio.paused) {
        this.pause();
      } else {
        this.play();
      }
    }

    next() {
      if (this.playlist.length === 0) return;
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
      this.playTrack(this.currentIndex);
    }

    prev() {
      if (this.playlist.length === 0) return;
      this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
      this.playTrack(this.currentIndex);
    }

    seek(percent) {
      if (this.audio.duration) {
        this.audio.currentTime = this.audio.duration * Math.max(0, Math.min(1, percent));
      }
    }

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      this.audio.volume = this.volume;
      if (this.gainNode) {
        const isMuted = window.desktopOS ? !window.desktopOS.isSoundEnabled : true;
        this.gainNode.gain.value = isMuted ? 0 : 1;
      }
      this.emit('volumechanged', { volume: this.volume });
    }

    // Simple Event Emitter
    emit(eventName, detail) {
      window.dispatchEvent(new CustomEvent('radio:' + eventName, { detail }));
    }

    on(eventName, callback) {
      window.addEventListener('radio:' + eventName, (e) => callback(e.detail));
    }
  }

  window.RadioEngine = RadioEngine;

})(window);
