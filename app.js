(() => {
  'use strict';

  const uploadForm = document.getElementById('upload-form');
  const audioInput = document.getElementById('audio-input');
  const dropzone = document.getElementById('dropzone');
  const dropzoneText = dropzone.querySelector('.dropzone__text');
  const modeSelect = document.getElementById('score-mode');
  const statusLabel = document.getElementById('status-label');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progress-bar');
  const previewPanel = document.getElementById('preview-panel');
  const downloadPanel = document.getElementById('download-panel');
  const downloadTrigger = document.getElementById('download-trigger');
  const downloadLinks = document.getElementById('download-links');

  const adModal = document.getElementById('ad-modal');
  const closeModalButton = document.getElementById('close-modal');
  const startAdButton = document.getElementById('start-ad');
  const countdown = document.getElementById('countdown');
  const countdownNumber = document.getElementById('countdown-number');
  const adInstruction = document.getElementById('ad-instruction');
  const adComplete = document.getElementById('ad-complete');
  const unlockDownloadsButton = document.getElementById('unlock-downloads');

  const API_ENDPOINT = window.__AUTOSCORE_API__ || '/api/process-audio';

  const SAMPLE_PIANO_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
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

  const SAMPLE_GUITAR_XML = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>ギターTABサンプル</work-title>
  </work>
  <identification>
    <creator type="composer">AutoScore Demo</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef number="1"><sign>TAB</sign><line>5</line></clef>
        <staff-details number-of-lines="6">
          <staff-lines>6</staff-lines>
          <staff-tuning line="1"><tuning-step>E</tuning-step><tuning-octave>4</tuning-octave></staff-tuning>
          <staff-tuning line="2"><tuning-step>B</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
          <staff-tuning line="3"><tuning-step>G</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
          <staff-tuning line="4"><tuning-step>D</tuning-step><tuning-octave>3</tuning-octave></staff-tuning>
          <staff-tuning line="5"><tuning-step>A</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
          <staff-tuning line="6"><tuning-step>E</tuning-step><tuning-octave>2</tuning-octave></staff-tuning>
        </staff-details>
      </attributes>
      <note>
        <pitch><step>E</step><octave>3</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>6</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>G</step><octave>3</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>6</string><fret>3</fret></technical></notations>
      </note>
      <note>
        <pitch><step>A</step><octave>3</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>5</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>B</step><octave>3</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>5</string><fret>2</fret></technical></notations>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>5</string><fret>3</fret></technical></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>4</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>4</string><fret>2</fret></technical></notations>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
        <notations><technical><string>4</string><fret>3</fret></technical></notations>
      </note>
    </measure>
    <measure number="3">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>half</type>
        <notations><technical><string>3</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>half</type>
        <notations><technical><string>4</string><fret>2</fret></technical></notations>
      </note>
    </measure>
    <measure number="4">
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>half</type>
        <notations><technical><string>4</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>half</type>
        <notations><technical><string>5</string><fret>3</fret></technical></notations>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

  const SAMPLE_PIANO_MIDI_BYTES = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x60, 0x4d, 0x54,
    0x72, 0x6b, 0x00, 0x00, 0x00, 0x1b, 0x00, 0xff,
    0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0xff, 0x58,
    0x04, 0x04, 0x02, 0x18, 0x08, 0x00, 0xc0, 0x00,
    0x00, 0x90, 0x3c, 0x40, 0x81, 0x40, 0x80, 0x3c,
    0x40, 0x00, 0xff, 0x2f, 0x00
  ]);

  const SAMPLE_GUITAR_MIDI_BYTES = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x60, 0x4d, 0x54,
    0x72, 0x6b, 0x00, 0x00, 0x00, 0x21, 0x00, 0xff,
    0x51, 0x03, 0x07, 0xa1, 0x20, 0x00, 0xff, 0x58,
    0x04, 0x04, 0x02, 0x18, 0x08, 0x00, 0xc0, 0x19,
    0x00, 0x90, 0x28, 0x40, 0x40, 0x90, 0x2b, 0x40,
    0x40, 0x90, 0x30, 0x40, 0x40, 0x90, 0x33, 0x40,
    0x40, 0x90, 0x35, 0x40, 0x40, 0x90, 0x37, 0x40,
    0x81, 0x40, 0x80, 0x28, 0x40, 0x80, 0x2b, 0x40,
    0x80, 0x30, 0x40, 0x80, 0x33, 0x40, 0x80, 0x35,
    0x40, 0x80, 0x37, 0x40, 0x00, 0xff, 0x2f, 0x00
  ]);

  const SCORE_SAMPLES = {
    piano: {
      mode: 'piano',
      label: 'ピアノ譜',
      musicXml: SAMPLE_PIANO_XML,
      midiBytes: SAMPLE_PIANO_MIDI_BYTES,
      pdfTitle: 'Piano Demo Score',
      pdfSummary: 'このPDFはデモ用に生成されたピアノ譜のサマリーです。実際の解析結果で置き換えられます。'
    },
    guitar: {
      mode: 'guitar',
      label: 'ギターTAB譜',
      musicXml: SAMPLE_GUITAR_XML,
      midiBytes: SAMPLE_GUITAR_MIDI_BYTES,
      pdfTitle: 'Guitar TAB Demo',
      pdfSummary: 'このPDFはデモ用に生成されたギターTAB譜のサマリーです。実際の解析結果で置き換えられます。'
    }
  };

  const state = {
    mode: modeSelect.value,
    osmd: null,
    progressTimer: null,
    countdownTimer: null,
    createdObjectUrls: [],
    currentResult: null
  };

  const setStatus = (message, emphasize = false) => {
    statusLabel.textContent = message;
    statusLabel.style.color = emphasize ? '#3b5bdb' : 'var(--text-light)';
  };

  const getSampleForMode = (mode) => {
    if (mode && SCORE_SAMPLES[mode]) {
      return SCORE_SAMPLES[mode];
    }
    return SCORE_SAMPLES.piano;
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

  const isHttpUrl = (value = '') => /^https?:/i.test(value);

  const configureDownloadAnchor = (anchor, { url, type }) => {
    anchor.href = url;
    if (type) {
      anchor.dataset.type = type;
    } else {
      delete anchor.dataset.type;
    }

    if (isHttpUrl(url)) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
    }
  };

  const triggerPrimaryDownload = () => {
    window.requestAnimationFrame(() => {
      const links = downloadLinks.querySelectorAll('a.download-link');
      if (!links.length) {
        return;
      }
      const candidate = downloadLinks.querySelector("a[data-type='pdf']") || links[0];
      candidate.click();
    });
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
    formData.append('scoreMode', state.mode);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
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
      downloads,
      mode: payload.mode || state.mode
    };
  };

  const createSampleResult = (mode = state.mode) => ({
    source: 'sample',
    jobId: null,
    musicXml: getSampleForMode(mode).musicXml,
    downloads: [],
    mode
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

  const renderSampleDownloads = (mode) => {
    const sample = getSampleForMode(mode);
    const { jsPDF } = window.jspdf;

    const pdfDoc = new jsPDF();
    pdfDoc.setFontSize(18);
    pdfDoc.text(sample.pdfTitle, 20, 24);
    pdfDoc.setFontSize(12);
    pdfDoc.text(sample.pdfSummary, 20, 36, { maxWidth: 170 });
    pdfDoc.text('アップロードされた音源から自動採譜された結果がここに表示されます。', 20, 50, { maxWidth: 170 });
    const pdfBlob = pdfDoc.output('blob');

    const pdfUrl = URL.createObjectURL(pdfBlob);
    state.createdObjectUrls.push(pdfUrl);
    const pdfLink = document.createElement('a');
    configureDownloadAnchor(pdfLink, { url: pdfUrl, type: 'pdf' });
    pdfLink.download = `autoscore-demo-${sample.mode}.pdf`;
    pdfLink.className = 'download-link';
    pdfLink.textContent = 'PDF をダウンロード';
    downloadLinks.appendChild(pdfLink);

    const xmlBlob = new Blob([sample.musicXml], {
      type: 'application/vnd.recordare.musicxml+xml'
    });
    const xmlUrl = URL.createObjectURL(xmlBlob);
    state.createdObjectUrls.push(xmlUrl);
    const xmlLink = document.createElement('a');
    configureDownloadAnchor(xmlLink, { url: xmlUrl, type: 'musicxml' });
    xmlLink.download = `autoscore-demo-${sample.mode}.musicxml`;
    xmlLink.className = 'download-link';
    xmlLink.textContent = 'MusicXML をダウンロード';
    downloadLinks.appendChild(xmlLink);

    const midiBlob = new Blob([sample.midiBytes], { type: 'audio/midi' });
    const midiUrl = URL.createObjectURL(midiBlob);
    state.createdObjectUrls.push(midiUrl);
    const midiLink = document.createElement('a');
    configureDownloadAnchor(midiLink, { url: midiUrl, type: 'midi' });
    midiLink.download = `autoscore-demo-${sample.mode}.mid`;
    midiLink.className = 'download-link';
    midiLink.textContent = 'MIDI をダウンロード';
    downloadLinks.appendChild(midiLink);

    triggerPrimaryDownload();
  };

  const renderDownloadLinks = (result) => {
    clearDownloadLinks();

    if (result.source === 'api' && result.downloads && result.downloads.length > 0) {
      result.downloads.forEach((item) => {
        const anchor = document.createElement('a');
        configureDownloadAnchor(anchor, item);
        anchor.download = item.filename || '';
        anchor.className = 'download-link';
        anchor.textContent = item.label || labelFromType(item.type);
        downloadLinks.appendChild(anchor);
      });
      triggerPrimaryDownload();
      return;
    }

    renderSampleDownloads(result.mode || state.mode);
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

  modeSelect.addEventListener('change', async () => {
    state.mode = modeSelect.value;
    setStatus(`生成対象: ${getSampleForMode(state.mode).label}`, true);

    if (state.currentResult?.source === 'sample') {
      const sample = createSampleResult(state.mode);
      try {
        await renderScore(sample.musicXml);
        state.currentResult = sample;
        previewPanel.hidden = false;
      } catch (error) {
        console.error(error);
        setStatus('サンプル譜面の切り替えに失敗しました。', false);
      }
    }
  });

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
      const sampleResult = createSampleResult(state.mode);
      try {
        await renderScore(sampleResult.musicXml);
      } catch (renderError) {
        console.error(renderError);
        setStatus('楽譜プレビューの生成に失敗しました。', false);
        resetProgress();
        return;
      }
      state.currentResult = sampleResult;
      setStatus(`API応答が得られなかったため ${getSampleForMode(state.mode).label} のサンプルを表示しています。`, false);
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
