(() => {
  'use strict';

  const players = [];
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  document.querySelectorAll('[data-comparison]').forEach(section => {
    const videos = [...section.querySelectorAll('video')];
    const primary = videos.find(video => video.dataset.method === 'amodalbox');
    const playButton = section.querySelector('[data-play]');
    const playLabel = section.querySelector('[data-play-label]');
    const playIcon = section.querySelector('[data-play-icon]');
    const progress = section.querySelector('[data-progress]');
    const time = section.querySelector('[data-time]');
    const status = section.querySelector('[data-status]');
    const inspectButton = section.querySelector('[data-inspect]');
    const toggle = section.querySelector('[data-highlight-toggle]');
    const overlays = [...section.querySelectorAll('.video-highlight')];
    const inspectTime = Number(section.dataset.inspectTime);
    let duration = Number(section.dataset.duration);
    let playing = false;
    let previewing = true;
    let operation = 0;
    let animationFrame = 0;

    const updateHighlights = () => {
      const position = previewing ? inspectTime : primary.currentTime;
      overlays.forEach(overlay => {
        const start = Number(overlay.dataset.start);
        const end = overlay.dataset.end === '' ? Infinity : Number(overlay.dataset.end);
        overlay.hidden = !toggle.checked || position < start || position >= end;
      });
    };
    const updateTime = () => {
      const current = previewing ? inspectTime : primary.currentTime || 0;
      progress.value = current;
      progress.setAttribute('aria-valuetext', `${current.toFixed(1)} of ${duration.toFixed(1)} seconds`);
      time.value = `${formatTime(current)} / ${formatTime(duration)}`;
      updateHighlights();
    };
    const updateButton = () => {
      playLabel.textContent = playing ? 'Pause comparison' : 'Play comparison';
      playIcon.textContent = playing ? 'Ⅱ' : '▶';
      playButton.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} all three videos in ${section.id.replace('-', ' ')}`);
    };
    const pause = () => {
      operation += 1;
      playing = false;
      videos.forEach(video => video.pause());
      window.cancelAnimationFrame(animationFrame);
      playButton.disabled = false;
      inspectButton.disabled = false;
      updateButton();
    };
    const seek = seconds => {
      previewing = false;
      videos.forEach(video => {
        if (video.readyState > 0) video.currentTime = Math.min(seconds, video.duration || duration);
      });
      updateTime();
    };
    const animateHighlights = () => {
      if (!playing) return;
      updateHighlights();
      animationFrame = window.requestAnimationFrame(animateHighlights);
    };
    const loadMetadata = video => {
      if (video.readyState > 0) return Promise.resolve();
      return new Promise((resolve, reject) => {
        let timer;
        const cleanup = () => {
          window.clearTimeout(timer);
          video.removeEventListener('loadedmetadata', ready);
          video.removeEventListener('error', failed);
        };
        const ready = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error('Video could not be loaded')); };
        video.addEventListener('loadedmetadata', ready);
        video.addEventListener('error', failed);
        timer = window.setTimeout(failed, 15000);
        video.preload = 'metadata';
        video.load();
      });
    };
    const play = async () => {
      players.forEach(player => { if (player.section !== section) player.pause(); });
      const currentOperation = ++operation;
      playButton.disabled = true;
      inspectButton.disabled = true;
      status.textContent = '';
      if (previewing || primary.ended || primary.currentTime >= duration - 0.05) seek(0);
      const outcomes = await Promise.allSettled(videos.map(video => video.play()));
      if (currentOperation !== operation) return;
      playButton.disabled = false;
      inspectButton.disabled = false;
      if (outcomes.some(outcome => outcome.status === 'rejected')) {
        pause();
        videos.forEach(video => { video.controls = true; });
        status.textContent = 'Synchronized playback is unavailable. Use each video’s controls to play it individually.';
        return;
      }
      videos.forEach(video => { video.controls = false; });
      seek(primary.currentTime);
      playing = true;
      updateButton();
      animateHighlights();
    };
    const inspect = async () => {
      players.forEach(player => player.pause());
      const currentOperation = ++operation;
      playButton.disabled = true;
      inspectButton.disabled = true;
      status.textContent = '';
      try {
        await Promise.all(videos.map(loadMetadata));
        if (currentOperation !== operation) return;
        seek(inspectTime);
        status.textContent = `Paused at ${inspectTime.toFixed(1)} seconds to inspect the highlighted differences.`;
      } catch {
        if (currentOperation === operation) status.textContent = 'Could not load the highlighted frame. Please try playing the videos.';
      } finally {
        if (currentOperation === operation) {
          playButton.disabled = false;
          inspectButton.disabled = false;
        }
      }
    };

    players.push({section, pause});
    videos.forEach(video => { video.controls = false; });
    section.querySelector('.playback-controls').hidden = false;
    section.querySelector('.highlight-controls').hidden = false;
    playButton.addEventListener('click', () => playing ? pause() : play());
    section.querySelector('[data-restart]').addEventListener('click', () => {
      pause();
      seek(0);
      play();
    });
    inspectButton.addEventListener('click', inspect);
    toggle.addEventListener('change', updateHighlights);
    progress.addEventListener('input', () => seek(Number(progress.value)));
    videos.forEach(video => video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(primary.duration)) {
        duration = primary.duration;
        progress.max = duration;
      }
      progress.disabled = !videos.every(item => item.readyState > 0);
      updateTime();
    }));
    primary.addEventListener('timeupdate', () => {
      updateTime();
      if (!playing) return;
      videos.forEach(video => {
        if (video !== primary && video.readyState >= 2 && Math.abs(video.currentTime - primary.currentTime) > 0.16) {
          video.currentTime = primary.currentTime;
        }
      });
    });
    primary.addEventListener('seeked', updateHighlights);
    primary.addEventListener('ended', () => { pause(); updateTime(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) pause();
      }, { threshold: 0 }).observe(section);
    }
    updateTime();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) players.forEach(player => player.pause());
  });

  const copyButton = document.querySelector('#copy-citation');
  const copyStatus = document.querySelector('#copy-status');
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    const citation = document.querySelector('#bibtex');
    try {
      await navigator.clipboard.writeText(citation.textContent);
      copyStatus.textContent = 'Citation copied.';
      copyButton.textContent = 'Copied!';
      window.setTimeout(() => { copyButton.textContent = 'Copy citation'; }, 2200);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
})();
