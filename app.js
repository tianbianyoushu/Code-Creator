(() => {
  'use strict';

  const uploadForm = document.getElementById('upload-form');
  const audioInput = document.getElementById('audio-input');
  const dropzone = document.getElementById('dropzone');
  const statusLabel = document.getElementById('status-label');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progress-bar');
  const previewPanel = document.getElementById('preview-panel');
  const downloadPanel = document.getElementById('download-panel');
  const downloadTrigger = document.getElementById('download-trigger');
  const downloadLinks = document.getElementById('download-links');
  const dropzoneText = dropzone.querySelector('.dropzone__text');

  const adModal = document.getElementById('ad-modal');
  const closeModalButton = document.getElementById('close-modal');
  const startAdButton = document.getElementById('start-ad');
  const countdown = document.getElementById('countdown');
  const countdownNumber = document.getElementById('countdown-number');
  const adInstruction = document.getElementById('ad-instruction');
  const adComplete = document.getElementById('ad-complete');
  const unlockDownloadsButton = document.getElementById('unlock-downloads');

  const API_ENDPOINT = '/api/process-audio';

  const state = {
    osmd: null,
    progressTimer: null,
    countdownTimer: null,
    createdObjectUrls: [],
    currentResult: null
  };

  const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>サンプルメロディ</work-title>
  </work>
  <identification>
    <creator type="composer">AutoScore Demo</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

  const MIDI_BYTES = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x60, 0x4d, 0x54,
    0x72, 0x6b, 0x00, 0x00, 0x00, 0x1b, 0x00, 0xff,
    0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0xff, 0x58,
    0x04, 0x04, 0x02, 0x18, 0x08, 0x00, 0xc0, 0x00,
    0x00, 0x90, 0x3c, 0x40, 0x81, 0x40, 0x80, 0x3c,
    0x40, 0x00, 0xff, 0x2f, 0x00
  ]);

  const setStatus = (message, emphasize = false) => {
    statusLabel.textContent = message;
    statusLabel.style.color = emphasize ? '#3b5bdb' : 'var(--text-light)';
  };

  const clearDownloadLinks = () => {
    state.createdObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    state.createdObjectUrls.length = 0;
    downloadLinks.innerHTML = '';
  };

  const resetProgress = () => {
    progressBar.style.width = '0%';
    progress.hidden = true;
    if (state.progressTimer) {
      window.clearInterval(state.progressTimer);
      state.progressTimer = null;
    }
  };

  const startProgress = () => {
    resetProgress();
    let progressValue = 0;
    progress.hidden = false;
    progressBar.style.width = '0%';
    state.progressTimer = window.setInterval(() => {
      progressValue = Math.min(progressValue + Math.random() * 15 + 5, 95);
      progressBar.style.width = `${progressValue}%`;
    }, 450);
  };

  const stopProgress = () => {
    if (state.progressTimer) {
      window.clearInterval(state.progressTimer);
      state.progressTimer = null;
    }
    progressBar.style.width = '100%';
    window.setTimeout(() => {
      progress.hidden = true;
    }, 500);
  };

  const resetUiBeforeProcessing = () => {
    previewPanel.hidden = true;
    downloadPanel.hidden = true;
    downloadTrigger.disabled = true;
    downloadTrigger.textContent = 'ダウンロード';
    clearDownloadLinks();
    state.currentResult = null;
    resetProgress();
  };

  const labelFromType = (type) => {
    switch (type) {
      case 'pdf':
        return 'PDF をダウンロード';
      case 'musicxml':
        return 'MusicXML をダウンロード';
      case 'midi':
        return 'MIDI をダウンロード';
      default:
        return 'ファイルをダウンロード';
    }
  };

  const deriveFilename = (source, fallbackExtension) => {
    if (!source) {
      return `autoscore-output.${fallbackExtension}`;
    }
    try {
      const url = new URL(source, window.location.origin);
      const pathname = url.pathname.split('/').pop();
      if (pathname) {
        return pathname;
      }
    } catch (error) {
      // ignore URL parsing errors
    }
    return source;
  };

  const requestTranscription = async (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return payload;
  };

  const normalizeApiResponse = (payload) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('API response is empty');
    }

    const downloads = [];

    if (Array.isArray(payload.downloads)) {
      payload.downloads.forEach((item) => {
        if (!item || !item.url) {
          return;
        }
        downloads.push({
          label: item.label || labelFromType(item.type),
          url: item.url,
          filename: item.filename || deriveFilename(item.url, item.type || 'bin'),
          kind: 'url',
          type: item.type || null
        });
      });
    } else {
      if (payload.pdfUrl) {
        downloads.push({
          label: 'PDF をダウンロード',
          url: payload.pdfUrl,
          filename: payload.pdfFilename || deriveFilename(payload.pdfUrl, 'pdf'),
          kind: 'url',
          type: 'pdf'
        });
      }
      if (payload.musicXmlUrl) {
        downloads.push({
          label: 'MusicXML をダウンロード',
          url: payload.musicXmlUrl,
          filename: payload.musicXmlFilename || deriveFilename(payload.musicXmlUrl, 'musicxml'),
          kind: 'url',
          type: 'musicxml'
        });
      }
      if (payload.midiUrl) {
        downloads.push({
          label: 'MIDI をダウンロード',
          url: payload.midiUrl,
          filename: payload.midiFilename || deriveFilename(payload.midiUrl, 'mid'),
          kind: 'url',
          type: 'midi'
        });
      }
    }

    return {
      source: 'api',
      jobId: payload.jobId || null,
      musicXml: payload.musicXml || null,
      downloads
    };
  };

  const createSampleResult = () => ({
    source: 'sample',
    jobId: null,
    musicXml: SAMPLE_XML,
    downloads: []
  });

  const renderScore = async (musicXml) => {
    if (!window.opensheetmusicdisplay) {
      throw new Error('OpenSheetMusicDisplay が読み込まれていません');
    }

    const target = document.getElementById('osmd-container');
    target.innerHTML = '';

    state.osmd = state.osmd || new window.opensheetmusicdisplay.OpenSheetMusicDisplay(target, {
      drawingParameters: 'compact'
    });

    await state.osmd.load(musicXml);
    state.osmd.render();
  };

  const renderDownloadLinks = (result) => {
    clearDownloadLinks();

    if (result.source === 'api' && result.downloads && result.downloads.length > 0) {
      result.downloads.forEach((item) => {
        const anchor = document.createElement('a');
        anchor.href = item.url;
        anchor.download = item.filename || '';
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = 'download-link';
        anchor.textContent = item.label || labelFromType(item.type);
        downloadLinks.appendChild(anchor);
      });
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(18);
    pdfDoc.text('AutoScore Demo', 20, 24);
    pdfDoc.setFontSize(12);
    pdfDoc.text('このPDFはデモ用に自動生成された楽譜サマリーです。', 20, 36);
    pdfDoc.text('実運用では解析された譜面をここに配置します。', 20, 46);
    const pdfBlob = pdfDoc.output('blob');

    const pdfUrl = URL.createObjectURL(pdfBlob);
    state.createdObjectUrls.push(pdfUrl);
    const pdfLink = document.createElement('a');
    pdfLink.href = pdfUrl;
    pdfLink.download = 'autoscore-demo.pdf';
    pdfLink.className = 'download-link';
    pdfLink.textContent = 'PDF をダウンロード';
    downloadLinks.appendChild(pdfLink);

    const xmlBlob = new Blob([SAMPLE_XML], {
      type: 'application/vnd.recordare.musicxml+xml'
    });
    const xmlUrl = URL.createObjectURL(xmlBlob);
    state.createdObjectUrls.push(xmlUrl);
    const xmlLink = document.createElement('a');
    xmlLink.href = xmlUrl;
    xmlLink.download = 'autoscore-demo.musicxml';
    xmlLink.className = 'download-link';
    xmlLink.textContent = 'MusicXML をダウンロード';
    downloadLinks.appendChild(xmlLink);

    const midiBlob = new Blob([MIDI_BYTES], { type: 'audio/midi' });
    const midiUrl = URL.createObjectURL(midiBlob);
    state.createdObjectUrls.push(midiUrl);
    const midiLink = document.createElement('a');
    midiLink.href = midiUrl;
    midiLink.download = 'autoscore-demo.mid';
    midiLink.className = 'download-link';
    midiLink.textContent = 'MIDI をダウンロード';
    downloadLinks.appendChild(midiLink);
  };

  const openAdModal = () => {
    adModal.hidden = false;
    adInstruction.hidden = false;
    startAdButton.hidden = false;
    countdown.hidden = true;
    adComplete.hidden = true;
    if (state.countdownTimer) {
      window.clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  };

  const closeAdModal = () => {
    adModal.hidden = true;
    if (state.countdownTimer) {
      window.clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  };

  const startAdCountdown = () => {
    startAdButton.hidden = true;
    adInstruction.hidden = true;
    countdown.hidden = false;
    let remaining = 5;
    countdownNumber.textContent = remaining.toString();

    state.countdownTimer = window.setInterval(() => {
      remaining -= 1;
      countdownNumber.textContent = remaining.toString();
      if (remaining <= 0) {
        window.clearInterval(state.countdownTimer);
        state.countdownTimer = null;
        countdown.hidden = true;
        adComplete.hidden = false;
      }
    }, 1000);
  };

  const finalizeSuccessState = () => {
    stopProgress();
    previewPanel.hidden = false;
    downloadPanel.hidden = false;
    downloadTrigger.disabled = false;
    setStatus('プレビューを表示しました。広告視聴後にダウンロードできます。', true);
  };

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!audioInput.files || audioInput.files.length === 0) {
      setStatus('先に音声ファイルを選択してください。');
      return;
    }

    const file = audioInput.files[0];
    resetUiBeforeProcessing();
    setStatus(`${file.name} をアップロード中…`, true);
    startProgress();

    try {
      const payload = await requestTranscription(file);
      const result = normalizeApiResponse(payload);
      if (!result.musicXml) {
        throw new Error('musicXml is missing in API response');
      }
      await renderScore(result.musicXml);
      state.currentResult = result;
      finalizeSuccessState();
    } catch (error) {
      console.warn('Falling back to sample score:', error);
      const fallback = createSampleResult();
      try {
        await renderScore(fallback.musicXml);
      } catch (renderError) {
        console.error(renderError);
        setStatus('楽譜プレビューの生成に失敗しました。', false);
        resetProgress();
        return;
      }
      state.currentResult = fallback;
      setStatus('API応答が得られなかったためサンプル楽譜を表示しています。', false);
      finalizeSuccessState();
    }
  });

  audioInput.addEventListener('change', () => {
    if (audioInput.files && audioInput.files.length > 0) {
      dropzoneText.textContent = `${audioInput.files[0].name} を選択中`;
      setStatus('解析を開始してください。', true);
    } else {
      dropzoneText.textContent = 'MP3 / WAV ファイルをここにドラッグ&ドロップ、またはクリックして選択';
      setStatus('ファイルを選択して解析を開始してください。');
    }
  });

  ['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add('dropzone--active');
    });
  });

  ['dragleave', 'drop'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      if (type === 'drop' && event.dataTransfer?.files?.length) {
        audioInput.files = event.dataTransfer.files;
        audioInput.dispatchEvent(new Event('change'));
      }
      dropzone.classList.remove('dropzone--active');
    });
  });

  downloadTrigger.addEventListener('click', () => {
    openAdModal();
  });

  closeModalButton.addEventListener('click', () => {
    closeAdModal();
  });

  startAdButton.addEventListener('click', () => {
    startAdCountdown();
  });

  unlockDownloadsButton.addEventListener('click', () => {
    closeAdModal();
    renderDownloadLinks(state.currentResult || createSampleResult());
    downloadTrigger.textContent = 'もう一度広告を視聴';
    setStatus('楽譜データをダウンロードできます。', true);
  });

  window.addEventListener('beforeunload', () => {
    clearDownloadLinks();
    resetProgress();
    if (state.countdownTimer) {
      window.clearInterval(state.countdownTimer);
    }
  });
})();
