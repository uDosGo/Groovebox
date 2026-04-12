const defaultSpec = `---
title: Binder Jam
tempo: 122
bars: 2
arrangement: intro*1, verse*2
---

# Binder Jam

- drums: x...x...x...x...|x.x.x.x.x.x.x.x.
- bass: x.x...x...x...x.|....x...x...x...
- bass.cutoff: 56789ABC56789ABC|89ABCDEF89ABCDEF
- bass.level: BBBBAAAA99998888|88889999AAAABBBB
- drums.level: DDDDDDDDDDDDDDDD|CCCCCCCCCCCCCCCC

\`\`\`songscribe
Tempo: 122
Track: drums sampler 808
Steps: X...X...X...X...|X.X.X.X.X.X.X.X.

Track: bass synth acid
Steps: X.X...X...X...X.|....X...X...X...
\`\`\`

\`\`\`mml
t122 o4 l16 c4 e4 g4 >c4
\`\`\`
`;

const state = {
  roots: [],
  selectedRoot: null,
  currentPath: "",
  selectedFile: null,
  compiledPattern: null,
  parsedSpec: null,
  playbackPreview: null,
  midiExport: null,
  activeSectionLabel: null,
  composerPaint: {
    active: false,
    laneType: null,
    trackIndex: -1,
    laneName: null,
  },
  history: {
    past: [],
    future: [],
  },
  songscribeBrowserUrl: "http://127.0.0.1:3000",
  songscribeDockerCanControl: false,
  songscribeEmbedOpen: false,
  playback: {
    context: null,
    timerId: null,
    lookaheadMs: 25,
    scheduleAheadTime: 0.12,
    nextNoteTime: 0,
    currentStep: 0,
    isPlaying: false,
  },
};

const rootSelect = document.getElementById("root-select");
const currentPath = document.getElementById("current-path");
const tree = document.getElementById("tree");
const editor = document.getElementById("markdown-editor");
const editorPath = document.getElementById("editor-path");
const parseSummary = document.getElementById("parse-summary");
const channels = document.getElementById("channels");
const patternJson = document.getElementById("pattern-json");
const songscribeStatus = document.getElementById("songscribe-status");
const openSongscribeButton = document.getElementById("open-songscribe");
const navSongscribeStatus = document.getElementById("nav-songscribe-status");
const navOpenSongscribeButton = document.getElementById("nav-open-songscribe");
const bootstrapBanner = document.getElementById("bootstrap-banner");
const songscribeDockerStart = document.getElementById("songscribe-docker-start");
const songscribeDockerStop = document.getElementById("songscribe-docker-stop");
const songscribeEmbedToggle = document.getElementById("songscribe-embed-toggle");
const songscribeEmbedPanel = document.getElementById("section-songscribe-embed");
const songscribeEmbedFrame = document.getElementById("songscribe-embed-frame");
const songscribeEmbedClose = document.getElementById("songscribe-embed-close");
const workspaceCount = document.getElementById("workspace-count");
const sessionSummary = document.getElementById("session-summary");
const transportTempo = document.getElementById("transport-tempo");
const transportState = document.getElementById("transport-state");
const transportStep = document.getElementById("transport-step");
const masterStepGrid = document.getElementById("master-step-grid");
const patternLibraryCount = document.getElementById("pattern-library-count");
const patternLibraryMeta = document.getElementById("pattern-library-meta");
const patternLibraryList = document.getElementById("pattern-library-list");
const composerTrackCount = document.getElementById("composer-track-count");
const arrangementEditor = document.getElementById("arrangement-editor");
const arrangementTimeline = document.getElementById("arrangement-timeline");
const composerSectionPicker = document.getElementById("composer-section-picker");
const addArrangementSectionButton = document.getElementById("add-arrangement-section");
const phraseBrushSelect = document.getElementById("phrase-brush");
const automationBrushSelect = document.getElementById("automation-brush");
const composerUndoButton = document.getElementById("composer-undo");
const composerRedoButton = document.getElementById("composer-redo");
const composerEditor = document.getElementById("composer-editor");

const phraseCycle = [".", "x", "X", "o", "^", "v", "="];
const automationLanes = ["cutoff", "resonance", "level", "pan"];
const automationBrushValues = Array.from({ length: 16 }, (_, index) => index.toString(16).toUpperCase());

editor.value = defaultSpec;

phraseBrushSelect.innerHTML = phraseCycle.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join("");
automationBrushSelect.innerHTML = automationBrushValues.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join("");
phraseBrushSelect.value = "x";
automationBrushSelect.value = "8";

function renderMasterGrid(activeStep = -1) {
  masterStepGrid.innerHTML = "";
  const stepCount = state.playbackPreview?.transport?.step_count || state.compiledPattern?.tracks?.[0]?.steps?.length || 16;
  masterStepGrid.style.setProperty("--step-count", String(stepCount));
  for (let index = 0; index < stepCount; index += 1) {
    const cell = document.createElement("div");
    cell.className = "step-cell";
    if (index === activeStep) {
      cell.classList.add("playhead");
    }
    masterStepGrid.appendChild(cell);
  }
}
renderMasterGrid();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail || response.statusText);
  }
  return response.json();
}

async function postJson(url) {
  const response = await fetch(url, { method: "POST" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === "string" ? detail : response.statusText);
  }
  return data;
}

function updateSongscribeEmbedButton() {
  if (songscribeEmbedToggle) {
    songscribeEmbedToggle.disabled = !state.songscribeBrowserUrl;
  }
}

function setSongscribeEmbed(open) {
  state.songscribeEmbedOpen = open;
  if (!songscribeEmbedPanel || !songscribeEmbedFrame) return;
  if (open) {
    songscribeEmbedPanel.classList.remove("bootstrap-banner--hidden");
    songscribeEmbedFrame.src = state.songscribeBrowserUrl;
  } else {
    songscribeEmbedPanel.classList.add("bootstrap-banner--hidden");
    songscribeEmbedFrame.removeAttribute("src");
    songscribeEmbedFrame.src = "";
  }
  if (songscribeEmbedToggle) {
    songscribeEmbedToggle.textContent = open ? "Hide embed" : "Embed";
  }
}

async function loadSongscribeDockerControls() {
  try {
    const d = await fetchJson("/api/songscribe/docker");
    state.songscribeDockerCanControl = Boolean(d.can_control);
    const allow = state.songscribeDockerCanControl;
    if (songscribeDockerStart) songscribeDockerStart.disabled = !allow;
    if (songscribeDockerStop) songscribeDockerStop.disabled = !allow;
  } catch {
    state.songscribeDockerCanControl = false;
    if (songscribeDockerStart) songscribeDockerStart.disabled = true;
    if (songscribeDockerStop) songscribeDockerStop.disabled = true;
  }
}

async function runSongscribeDocker(action) {
  const url = action === "start" ? "/api/songscribe/docker/start" : "/api/songscribe/docker/stop";
  try {
    const payload = await postJson(url);
    if (sessionSummary) {
      if (payload.ok) {
        sessionSummary.innerHTML = `<strong>Docker</strong><div class="muted">Songscribe ${action === "start" ? "start" : "stop"} OK.</div>`;
      } else {
        const err = [payload.stderr, payload.stdout].filter(Boolean).join("\n").slice(0, 800);
        sessionSummary.innerHTML = `<strong>Docker</strong><div class="muted">${err || `exit ${payload.returncode}`}</div>`;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, action === "start" ? 2500 : 800));
    await loadSongscribeStatus();
  } catch (error) {
    if (sessionSummary) {
      sessionSummary.innerHTML = `<strong>Docker</strong><div class="muted">${error.message}</div>`;
    }
  }
}

async function loadRoots() {
  const payload = await fetchJson("/api/workspaces");
  state.roots = payload.roots;
  workspaceCount.textContent = String(payload.roots.length);
  rootSelect.innerHTML = "";
  payload.roots.forEach((root) => {
    const option = document.createElement("option");
    option.value = root.id;
    option.textContent = root.label;
    rootSelect.appendChild(option);
  });
  if (payload.roots.length > 0) {
    state.selectedRoot = payload.roots[0].id;
    rootSelect.value = state.selectedRoot;
    await loadTree("");
  }
}

function patternToMarkdown(documentPayload) {
  const sectionSource = documentPayload.sections?.length ? documentPayload.sections : null;
  const baseTracks = sectionSource?.[0]?.tracks?.length ? sectionSource[0].tracks : documentPayload.tracks;
  const title = documentPayload.name || documentPayload.title || "Untitled Groovebox Pattern";
  const lines = [
    "---",
    `title: ${title}`,
    `tempo: ${documentPayload.tempo}`,
    `bars: ${documentPayload.bars || Math.max(1, Math.ceil((documentPayload.tracks[0]?.steps.length || 16) / 16))}`,
    `arrangement: ${(documentPayload.arrangement || [{ label: "A", repeats: 1, transition: "cut" }]).map((section) => `${section.label}*${section.repeats}${section.transition && section.transition !== "cut" ? `@${section.transition}` : ""}`).join(", ")}`,
    ...(documentPayload.timeline?.length ? [`timeline: ${documentPayload.timeline.map((entry) => `${entry.section}${entry.transition && entry.transition !== "cut" ? `@${entry.transition}` : ""}`).join(", ")}`] : []),
    "---",
    "",
    `# ${title}`,
    "",
  ];

  baseTracks.forEach((track) => {
    const sourcePhrases = track.phrases || track.steps.map((value) => ({ symbol: value ? "x" : "." }));
    const stepString = sourcePhrases
      .map((phrase, index) => `${index > 0 && index % 16 === 0 ? "|" : ""}${phrase.symbol || (phrase.active ? "x" : ".")}`)
      .join("");
    lines.push(`- ${track.name}: ${stepString}`);
    Object.entries(track.automation || {}).forEach(([laneName, values]) => {
      const automationString = values
        .map((value, index) => `${index > 0 && index % 16 === 0 ? "|" : ""}${Math.round(value * 15).toString(16).toUpperCase()}`)
        .join("");
      lines.push(`- ${track.name}.${laneName}: ${automationString}`);
    });
  });

  if (sectionSource?.length) {
    lines.push("", "```groovebox-sections", JSON.stringify({
      sections: sectionSource.map((section) => ({
        label: section.label,
        tracks: section.tracks,
      })),
    }, null, 2), "```");
  }

  return `${lines.join("\n")}\n`;
}

function clonePattern(pattern) {
  return structuredClone(pattern);
}

function ensurePatternTimeline(pattern) {
  pattern.timeline = pattern.timeline?.length ? pattern.timeline : pattern.arrangement.flatMap((section) => (
    Array.from({ length: Number(section.repeats) || 1 }, (_, repeatIndex) => ({
      instance_id: `${section.label}-${repeatIndex + 1}`,
      label: `${section.label} ${repeatIndex + 1}`,
      section: section.label,
      transition: section.transition || "cut",
      bars: section.bars || pattern.bars,
      kind: "section",
      timeline_index: repeatIndex,
    }))
  ));
}

function nextTimelineInstanceId(pattern, sectionLabel) {
  const prefix = `${sectionLabel}-`;
  const matches = (pattern.timeline || [])
    .map((entry) => entry.instance_id || "")
    .filter((value) => value.startsWith(prefix))
    .map((value) => Number.parseInt(value.slice(prefix.length), 10))
    .filter((value) => Number.isFinite(value));
  return `${sectionLabel}-${(matches.length ? Math.max(...matches) : 0) + 1}`;
}

function uniqueSectionLabel(pattern, baseLabel) {
  const labels = new Set((pattern.sections || []).map((section) => section.label));
  if (!labels.has(baseLabel)) return baseLabel;
  let index = 2;
  while (labels.has(`${baseLabel} ${index}`)) {
    index += 1;
  }
  return `${baseLabel} ${index}`;
}

function ensurePatternSections(pattern) {
  if (!pattern.arrangement?.length) {
    pattern.arrangement = [{ label: "A", repeats: 1, bars: pattern.bars || 1 }];
  }
  ensurePatternTimeline(pattern);
  const existingSections = new Map((pattern.sections || []).map((section) => [section.label, section]));
  const seedTracks = pattern.tracks?.length ? pattern.tracks : (pattern.sections?.[0]?.tracks || []);
  pattern.sections = pattern.arrangement.map((section, index) => {
    const existing = existingSections.get(section.label);
    const sourceTracks = existing?.tracks?.length ? existing.tracks : seedTracks;
    return {
      label: section.label || `S${index + 1}`,
      bars: section.bars || pattern.bars,
      tracks: structuredClone(sourceTracks),
    };
  });
  const baseSection = pattern.sections.find((section) => section.label === pattern.arrangement[0].label) || pattern.sections[0];
  pattern.tracks = structuredClone(baseSection?.tracks || []);
}

function currentSectionLabel(pattern) {
  ensurePatternSections(pattern);
  if (!state.activeSectionLabel || !pattern.sections.some((section) => section.label === state.activeSectionLabel)) {
    state.activeSectionLabel = pattern.arrangement[0]?.label || pattern.sections[0]?.label || "A";
  }
  return state.activeSectionLabel;
}

function activeSection(pattern) {
  const label = currentSectionLabel(pattern);
  return pattern.sections.find((section) => section.label === label) || pattern.sections[0];
}

function deriveFillSection(sourceSection) {
  const nextSection = structuredClone(sourceSection);
  nextSection.tracks.forEach((track) => {
    const sourcePhrases = track.phrases.map((phrase) => ({ ...phrase }));
    sourcePhrases.forEach((phrase, stepIndex) => {
      if (!phrase.active && stepIndex % 4 !== 0 && Math.random() > 0.66) {
        setPhraseSymbol(track, stepIndex, stepIndex % 2 === 0 ? "x" : "o");
      } else if (phrase.active && phrase.symbol === "x" && stepIndex % 4 === 0) {
        setPhraseSymbol(track, stepIndex, "X");
      }
    });
    Object.keys(track.automation || {}).forEach((laneName) => {
      track.automation[laneName] = track.automation[laneName].map((value, stepIndex) => {
        const lift = stepIndex >= Math.max(0, track.steps.length - 4) ? 0.18 : 0.06;
        return Math.max(0, Math.min(1, value + lift));
      });
    });
  });
  return nextSection;
}

function symbolForPhrase(phrase) {
  return phrase?.symbol || (phrase?.active ? "x" : ".");
}

function syncEditorFromCompiledPattern() {
  if (!state.compiledPattern) return;
  ensurePatternSections(state.compiledPattern);
  editor.value = patternToMarkdown({
    name: state.compiledPattern.title,
    tempo: state.compiledPattern.tempo,
    bars: state.compiledPattern.bars,
    arrangement: state.compiledPattern.arrangement,
    sections: state.compiledPattern.sections,
    timeline: state.compiledPattern.timeline,
    tracks: state.compiledPattern.tracks,
  });
  patternJson.textContent = JSON.stringify(state.compiledPattern, null, 2);
  composerUndoButton.disabled = state.history.past.length === 0;
  composerRedoButton.disabled = state.history.future.length === 0;
}

function applyPatternEdit(mutator, options = {}) {
  if (!state.compiledPattern) return;
  if (!options.skipHistory) {
    state.history.past.push(clonePattern(state.compiledPattern));
    if (state.history.past.length > 100) {
      state.history.past.shift();
    }
    state.history.future = [];
  }
  const nextPattern = clonePattern(state.compiledPattern);
  mutator(nextPattern);
  ensurePatternSections(nextPattern);
  state.compiledPattern = nextPattern;
  state.playbackPreview = null;
  syncEditorFromCompiledPattern();
  renderChannelStepGrids();
  renderComposerEditor();
}

function restorePatternSnapshot(snapshot) {
  state.compiledPattern = clonePattern(snapshot);
  ensurePatternSections(state.compiledPattern);
  state.playbackPreview = null;
  syncEditorFromCompiledPattern();
  renderChannelStepGrids();
  renderComposerEditor();
}

function undoComposerEdit() {
  if (!state.history.past.length || !state.compiledPattern) return;
  state.history.future.push(clonePattern(state.compiledPattern));
  const previous = state.history.past.pop();
  restorePatternSnapshot(previous);
}

function redoComposerEdit() {
  if (!state.history.future.length || !state.compiledPattern) return;
  state.history.past.push(clonePattern(state.compiledPattern));
  const next = state.history.future.pop();
  restorePatternSnapshot(next);
}

function applyComposerBrush(trackIndex, laneType, stepIndex, laneName = null) {
  applyPatternEdit((pattern) => {
    const nextTrack = activeSection(pattern)?.tracks?.[trackIndex];
    if (!nextTrack) return;
    if (laneType === "phrase") {
      setPhraseSymbol(nextTrack, stepIndex, phraseBrushSelect.value);
      return;
    }
    if (laneType === "automation" && laneName) {
      if (!nextTrack.automation[laneName]) {
        nextTrack.automation[laneName] = Array.from({ length: nextTrack.steps.length }, () => 0.5);
      }
      nextTrack.automation[laneName][stepIndex] = Number.parseInt(automationBrushSelect.value, 16) / 15;
    }
  });
}

function beginComposerPaint(trackIndex, laneType, stepIndex, laneName = null) {
  state.composerPaint = {
    active: true,
    laneType,
    trackIndex,
    laneName,
  };
  applyComposerBrush(trackIndex, laneType, stepIndex, laneName);
}

function continueComposerPaint(trackIndex, laneType, stepIndex, laneName = null) {
  if (!state.composerPaint.active) return;
  if (state.composerPaint.trackIndex !== trackIndex) return;
  if (state.composerPaint.laneType !== laneType) return;
  if (state.composerPaint.laneName !== laneName) return;
  applyComposerBrush(trackIndex, laneType, stepIndex, laneName);
}

function endComposerPaint() {
  state.composerPaint.active = false;
}

function setPhraseSymbol(track, stepIndex, symbol) {
  const phrase = track.phrases[stepIndex];
  if (!phrase) return;
  phrase.symbol = symbol;
  phrase.active = ![".", "-", "_", "="].includes(symbol);
  if (!phrase.active) {
    phrase.velocity = 0;
    phrase.accent = false;
    phrase.note_offset = 0;
    phrase.gate_steps = symbol === "=" ? 0 : 0;
  } else {
    phrase.velocity = symbol === "X" ? 122 : symbol === "o" ? 58 : symbol === "^" ? 108 : symbol === "v" ? 88 : 96;
    phrase.accent = ["X", "^"].includes(symbol);
    phrase.note_offset = symbol === "^" ? 7 : symbol === "v" ? -5 : 0;
    phrase.gate_steps = 1;
  }
  if (symbol === "=") {
    const previousActive = [...track.phrases.slice(0, stepIndex)].reverse().find((candidate) => candidate.active);
    if (previousActive) {
      previousActive.gate_steps += 1;
    }
  }
  track.steps[stepIndex] = phrase.active ? 1 : 0;
}

function clearTrackLanes(track) {
  track.steps = track.steps.map(() => 0);
  track.phrases = track.phrases.map(() => ({
    active: false,
    velocity: 0,
    accent: false,
    gate_steps: 0,
    note_offset: 0,
    symbol: ".",
  }));
  Object.keys(track.automation || {}).forEach((laneName) => {
    track.automation[laneName] = track.automation[laneName].map(() => 0.5);
  });
}

function fillTrackLane(track, symbol) {
  const interval = symbol === "o" ? 8 : 4;
  clearTrackLanes(track);
  for (let stepIndex = 0; stepIndex < track.steps.length; stepIndex += interval) {
    setPhraseSymbol(track, stepIndex, symbol);
  }
}

function invertPhraseLane(track) {
  track.phrases.forEach((phrase, stepIndex) => {
    const nextSymbol = phrase.active ? "." : "x";
    setPhraseSymbol(track, stepIndex, nextSymbol);
  });
}

function randomizePhraseLane(track) {
  clearTrackLanes(track);
  track.phrases.forEach((_, stepIndex) => {
    if (Math.random() > 0.7) {
      const pool = ["x", "X", "o"];
      setPhraseSymbol(track, stepIndex, pool[Math.floor(Math.random() * pool.length)]);
    }
  });
}

function smoothAutomationLane(values) {
  const smoothed = values.map((value, index) => {
    const previous = values[Math.max(0, index - 1)];
    const next = values[Math.min(values.length - 1, index + 1)];
    return (previous + value + next) / 3;
  });
  return smoothed;
}

function flattenAutomationLane(values, hexValue) {
  return values.map(() => Number.parseInt(hexValue, 16) / 15);
}

function randomizeAutomationLane(values) {
  return values.map(() => Math.floor(Math.random() * 16) / 15);
}

function renderComposerEditor() {
  composerEditor.innerHTML = "";
  if (!state.compiledPattern) {
    composerTrackCount.textContent = "0";
    arrangementEditor.innerHTML = "";
    arrangementTimeline.innerHTML = "";
    composerSectionPicker.innerHTML = "";
    return;
  }
  ensurePatternSections(state.compiledPattern);
  const section = activeSection(state.compiledPattern);
  const tracks = section?.tracks || [];
  composerTrackCount.textContent = String(tracks.length);
  renderArrangementEditor();
  renderArrangementTimeline();
  renderComposerSectionPicker();
  tracks.forEach((track, trackIndex) => {
    const trackCard = document.createElement("section");
    trackCard.className = "composer-track";
    trackCard.innerHTML = `
      <div class="composer-track-header">
        <div>
          <strong>${track.name}</strong>
          <div class="muted">${track.instrument}</div>
        </div>
        <div class="composer-track-actions">
          <button type="button" data-track-action="fill">Fill</button>
          <button type="button" data-track-action="duplicate">Duplicate</button>
          <button type="button" data-track-action="clear">Clear</button>
        </div>
      </div>
    `;
    trackCard.querySelector('[data-track-action="fill"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        fillTrackLane(activeSection(pattern).tracks[trackIndex], phraseBrushSelect.value);
      });
    });
    trackCard.querySelector('[data-track-action="duplicate"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        const sectionTrackList = activeSection(pattern).tracks;
        const sourceTrack = sectionTrackList[trackIndex];
        sectionTrackList.splice(trackIndex + 1, 0, {
          ...structuredClone(sourceTrack),
          track_id: `${sourceTrack.track_id}-copy`,
          name: `${sourceTrack.name} Copy`,
        });
      });
    });
    trackCard.querySelector('[data-track-action="clear"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        clearTrackLanes(activeSection(pattern).tracks[trackIndex]);
      });
    });

    const phraseLane = document.createElement("div");
    phraseLane.className = "composer-lane";
    phraseLane.innerHTML = `<div class="composer-lane-label"><span>Phrase</span><span>${track.steps.length} steps</span></div>`;
    const phraseActions = document.createElement("div");
    phraseActions.className = "composer-lane-actions";
    phraseActions.innerHTML = `
      <button type="button" data-phrase-action="invert">Invert</button>
      <button type="button" data-phrase-action="randomize">Randomize</button>
    `;
    phraseActions.querySelector('[data-phrase-action="invert"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        invertPhraseLane(activeSection(pattern).tracks[trackIndex]);
      });
    });
    phraseActions.querySelector('[data-phrase-action="randomize"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        randomizePhraseLane(activeSection(pattern).tracks[trackIndex]);
      });
    });
    phraseLane.appendChild(phraseActions);
    const phraseGrid = document.createElement("div");
    phraseGrid.className = "composer-grid";
    phraseGrid.style.setProperty("--step-count", String(track.steps.length));
    track.phrases.forEach((phrase, stepIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "phrase-cell";
      if (phrase.active) button.classList.add("is-active");
      if (phrase.accent) button.classList.add("is-accent");
      if (symbolForPhrase(phrase) === phraseBrushSelect.value) button.classList.add("is-brush");
      button.textContent = symbolForPhrase(phrase);
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        beginComposerPaint(trackIndex, "phrase", stepIndex);
      });
      button.addEventListener("pointerenter", () => {
        continueComposerPaint(trackIndex, "phrase", stepIndex);
      });
      phraseGrid.appendChild(button);
    });
    phraseLane.appendChild(phraseGrid);
    trackCard.appendChild(phraseLane);

    automationLanes.forEach((laneName) => {
      const laneValues = track.automation?.[laneName];
      if (!laneValues) return;
      const lane = document.createElement("div");
      lane.className = "composer-lane";
      lane.innerHTML = `<div class="composer-lane-label"><span>${laneName}</span><span>hex automation</span></div>`;
      const laneActions = document.createElement("div");
      laneActions.className = "composer-lane-actions";
      laneActions.innerHTML = `
        <button type="button" data-lane-action="smooth">Smooth</button>
        <button type="button" data-lane-action="flatten">Flatten</button>
        <button type="button" data-lane-action="randomize">Randomize</button>
      `;
      laneActions.querySelector('[data-lane-action="smooth"]').addEventListener("click", () => {
        applyPatternEdit((pattern) => {
          activeSection(pattern).tracks[trackIndex].automation[laneName] = smoothAutomationLane(activeSection(pattern).tracks[trackIndex].automation[laneName]);
        });
      });
      laneActions.querySelector('[data-lane-action="flatten"]').addEventListener("click", () => {
        applyPatternEdit((pattern) => {
          activeSection(pattern).tracks[trackIndex].automation[laneName] = flattenAutomationLane(
            activeSection(pattern).tracks[trackIndex].automation[laneName],
            automationBrushSelect.value,
          );
        });
      });
      laneActions.querySelector('[data-lane-action="randomize"]').addEventListener("click", () => {
        applyPatternEdit((pattern) => {
          activeSection(pattern).tracks[trackIndex].automation[laneName] = randomizeAutomationLane(activeSection(pattern).tracks[trackIndex].automation[laneName]);
        });
      });
      lane.appendChild(laneActions);
      const laneGrid = document.createElement("div");
      laneGrid.className = "composer-grid";
      laneGrid.style.setProperty("--step-count", String(laneValues.length));
      laneValues.forEach((value, stepIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "automation-cell";
        const hexValue = Math.round(value * 15).toString(16).toUpperCase();
        if (hexValue === automationBrushSelect.value) button.classList.add("is-brush");
        button.textContent = hexValue;
        button.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          beginComposerPaint(trackIndex, "automation", stepIndex, laneName);
        });
        button.addEventListener("pointerenter", () => {
          continueComposerPaint(trackIndex, "automation", stepIndex, laneName);
        });
        laneGrid.appendChild(button);
      });
      lane.appendChild(laneGrid);
      trackCard.appendChild(lane);
    });

    composerEditor.appendChild(trackCard);
  });
}

function renderComposerSectionPicker() {
  composerSectionPicker.innerHTML = "";
  if (!state.compiledPattern) return;
  ensurePatternSections(state.compiledPattern);
  const label = currentSectionLabel(state.compiledPattern);
  state.compiledPattern.arrangement.forEach((section) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-pill";
    if (section.label === label) button.classList.add("is-active");
    button.textContent = section.label;
    button.addEventListener("click", () => {
      state.activeSectionLabel = section.label;
      renderComposerEditor();
    });
    composerSectionPicker.appendChild(button);
  });
}

function renderArrangementEditor() {
  arrangementEditor.innerHTML = "";
  const arrangement = state.compiledPattern?.arrangement || [{ label: "A", repeats: 1, bars: state.compiledPattern?.bars || 1, transition: "cut" }];
  arrangement.forEach((section, sectionIndex) => {
    const row = document.createElement("div");
    row.className = "arrangement-row";

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.value = section.label;
    labelInput.placeholder = `S${sectionIndex + 1}`;
    labelInput.addEventListener("change", (event) => {
      applyPatternEdit((pattern) => {
        const nextLabel = event.target.value.trim() || `S${sectionIndex + 1}`;
        const previousLabel = pattern.arrangement[sectionIndex].label;
        pattern.arrangement[sectionIndex].label = nextLabel;
        const existingSection = pattern.sections?.find((item) => item.label === previousLabel);
        if (existingSection) {
          existingSection.label = nextLabel;
        }
        pattern.timeline = null;
        if (state.activeSectionLabel === previousLabel) {
          state.activeSectionLabel = nextLabel;
        }
      });
    });

    const repeatInput = document.createElement("input");
    repeatInput.type = "number";
    repeatInput.min = "1";
    repeatInput.max = "16";
    repeatInput.value = String(section.repeats);
    repeatInput.addEventListener("change", (event) => {
      applyPatternEdit((pattern) => {
        pattern.arrangement[sectionIndex].repeats = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
        pattern.timeline = null;
      });
    });

    const transitionSelect = document.createElement("select");
    ["cut", "lift", "drop", "fill"].forEach((transition) => {
      const option = document.createElement("option");
      option.value = transition;
      option.textContent = transition;
      transitionSelect.appendChild(option);
    });
    transitionSelect.value = section.transition || "cut";
    transitionSelect.addEventListener("change", (event) => {
      applyPatternEdit((pattern) => {
        pattern.arrangement[sectionIndex].transition = event.target.value;
        pattern.timeline = null;
      });
    });

    const fillButton = document.createElement("button");
    fillButton.type = "button";
    fillButton.textContent = "Derive Fill";
    fillButton.addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternSections(pattern);
        const target = pattern.sections.find((item) => item.label === pattern.arrangement[sectionIndex].label);
        const source = pattern.sections[sectionIndex - 1] || target;
        if (!target || !source) return;
        const derived = deriveFillSection(source);
        target.tracks = derived.tracks;
        pattern.arrangement[sectionIndex].transition = "fill";
        state.activeSectionLabel = target.label;
      });
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.disabled = arrangement.length === 1;
    removeButton.addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        const removedLabel = pattern.arrangement[sectionIndex].label;
        pattern.arrangement.splice(sectionIndex, 1);
        pattern.sections = (pattern.sections || []).filter((item) => item.label !== removedLabel);
        pattern.timeline = null;
        if (!pattern.arrangement.length) {
          pattern.arrangement.push({ label: "A", repeats: 1, bars: pattern.bars });
        }
        if (state.activeSectionLabel === removedLabel) {
          state.activeSectionLabel = pattern.arrangement[0].label;
        }
      });
    });

    row.appendChild(labelInput);
    row.appendChild(repeatInput);
    row.appendChild(transitionSelect);
    row.appendChild(fillButton);
    row.appendChild(removeButton);
    arrangementEditor.appendChild(row);
  });
}

function renderArrangementTimeline() {
  arrangementTimeline.innerHTML = "";
  if (!state.compiledPattern?.timeline?.length) return;
  state.compiledPattern.timeline.forEach((section) => {
    const chip = document.createElement("div");
    chip.className = "timeline-chip";
    if (section.section === state.activeSectionLabel) chip.classList.add("is-active");

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "timeline-chip-main";
    selectButton.innerHTML = `<strong>${section.label}</strong><span>${section.transition}</span>`;
    selectButton.addEventListener("click", () => {
      state.activeSectionLabel = section.section;
      renderComposerEditor();
    });

    const actions = document.createElement("div");
    actions.className = "timeline-chip-actions";
    actions.innerHTML = `
      <button type="button" data-timeline-action="left">←</button>
      <button type="button" data-timeline-action="right">→</button>
      <button type="button" data-timeline-action="duplicate">Dup</button>
      <button type="button" data-timeline-action="fill">+Fill</button>
      <button type="button" data-timeline-action="delete">Del</button>
    `;

    actions.querySelector('[data-timeline-action="left"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternTimeline(pattern);
        const index = pattern.timeline.findIndex((entry) => entry.instance_id === section.instance_id);
        if (index <= 0) return;
        [pattern.timeline[index - 1], pattern.timeline[index]] = [pattern.timeline[index], pattern.timeline[index - 1]];
      });
    });

    actions.querySelector('[data-timeline-action="right"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternTimeline(pattern);
        const index = pattern.timeline.findIndex((entry) => entry.instance_id === section.instance_id);
        if (index === -1 || index >= pattern.timeline.length - 1) return;
        [pattern.timeline[index + 1], pattern.timeline[index]] = [pattern.timeline[index], pattern.timeline[index + 1]];
      });
    });

    actions.querySelector('[data-timeline-action="duplicate"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternTimeline(pattern);
        const index = pattern.timeline.findIndex((entry) => entry.instance_id === section.instance_id);
        if (index === -1) return;
        pattern.timeline.splice(index + 1, 0, {
          ...structuredClone(pattern.timeline[index]),
          instance_id: nextTimelineInstanceId(pattern, section.section),
          label: `${section.section} copy`,
        });
      });
    });

    actions.querySelector('[data-timeline-action="fill"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternSections(pattern);
        ensurePatternTimeline(pattern);
        const sourceSection = pattern.sections.find((entry) => entry.label === section.section);
        if (!sourceSection) return;
        const fillLabel = uniqueSectionLabel(pattern, `${section.section} Fill`);
        pattern.sections.push({
          label: fillLabel,
          bars: pattern.bars,
          tracks: deriveFillSection(sourceSection).tracks,
        });
        const index = pattern.timeline.findIndex((entry) => entry.instance_id === section.instance_id);
        pattern.timeline.splice(index + 1, 0, {
          instance_id: nextTimelineInstanceId(pattern, fillLabel),
          label: fillLabel,
          section: fillLabel,
          transition: "fill",
          bars: pattern.bars,
          kind: "fill",
          timeline_index: index + 1,
        });
        state.activeSectionLabel = fillLabel;
      });
    });

    actions.querySelector('[data-timeline-action="delete"]').addEventListener("click", () => {
      applyPatternEdit((pattern) => {
        ensurePatternTimeline(pattern);
        if (pattern.timeline.length <= 1) return;
        const index = pattern.timeline.findIndex((entry) => entry.instance_id === section.instance_id);
        if (index === -1) return;
        pattern.timeline.splice(index, 1);
      });
    });

    chip.appendChild(selectButton);
    chip.appendChild(actions);
    arrangementTimeline.appendChild(chip);
  });
}

function eventsByStep(events = []) {
  const grouped = new Map();
  events.forEach((event) => {
    if (!grouped.has(event.step_index)) {
      grouped.set(event.step_index, []);
    }
    grouped.get(event.step_index).push(event);
  });
  return grouped;
}

function renderCompiledPattern(pattern) {
  state.compiledPattern = pattern;
  ensurePatternSections(state.compiledPattern);
  currentSectionLabel(state.compiledPattern);
  patternJson.textContent = JSON.stringify(pattern, null, 2);
  renderComposerEditor();
  renderChannelStepGrids();
}

function renderPreviewPayload(payload) {
  state.playbackPreview = payload;
  state.compiledPattern = payload.pattern;
  ensurePatternSections(state.compiledPattern);
  currentSectionLabel(state.compiledPattern);
  state.playback.eventsByStep = eventsByStep(payload.events);
  transportTempo.value = String(payload.tempo);
  transportState.textContent = payload.transport.state;
  patternJson.textContent = JSON.stringify(payload.pattern, null, 2);
  channels.innerHTML = "";
  payload.channels.forEach((channel) => {
    const card = document.createElement("div");
    card.className = "channel-card";
    card.dataset.channelName = channel.name;
    card.innerHTML = `
      <div class="channel-topline">
        <strong>${channel.channel}. ${channel.name}</strong>
        <div class="channel-engine">
          <span class="badge">${channel.engine}</span>
          <span class="badge">${channel.instrument}</span>
        </div>
      </div>
      <div class="muted">${payload.arrangement.map((section) => `${section.label}x${section.repeats}`).join(" -> ")}</div>
      <div class="muted">${channel.automation_lanes.length ? `automation: ${channel.automation_lanes.join(", ")}` : "no automation lanes"}</div>
      <div class="muted">${channel.active_steps.length ? channel.active_steps.join(", ") : "no active steps"}</div>
      <div class="step-grid" data-step-grid="${channel.name}"></div>
      <div class="meter"><span style="width:${Math.min(100, Math.max(6, channel.meter * 100))}%"></span></div>
    `;
    channels.appendChild(card);
  });
  renderChannelStepGrids();
}

async function loadPatternLibrary() {
  const payload = await fetchJson("/api/patterns");
  const library = payload.library;
  patternLibraryCount.textContent = String(library.patterns.length);
  patternLibraryMeta.textContent = `${library.owner} ${library.version} • ${library.exports.join(", ")}`;
  patternLibraryList.innerHTML = "";

  library.patterns.forEach((pattern) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "library-item";
    button.innerHTML = `
      <strong>${pattern.name}</strong>
      <span class="muted">${pattern.pattern_id}</span>
      <span class="muted">${pattern.tempo} BPM • ${pattern.track_count} track(s)</span>
    `;
    button.disabled = !pattern.available;
    button.addEventListener("click", async () => {
      const detail = await fetchJson(`/api/patterns/${encodeURIComponent(pattern.pattern_id)}`);
      editor.value = patternToMarkdown(detail.document);
      editorPath.value = detail.summary.document_path || `session/${pattern.pattern_id}.md`;
      sessionSummary.innerHTML = `<strong>Loaded library pattern</strong><div class="muted">${detail.summary.pattern_id}</div>`;
      await parseSpec();
      renderCompiledPattern(detail.compiled);
      renderPreviewPayload(detail.playback);
      window.location.hash = "#composer";
    });
    patternLibraryList.appendChild(button);
  });
}

async function loadTree(path = "") {
  if (!state.selectedRoot) return;
  const payload = await fetchJson(`/api/workspaces/tree?root_id=${encodeURIComponent(state.selectedRoot)}&path=${encodeURIComponent(path)}`);
  state.currentPath = payload.current_path === "." ? "" : payload.current_path;
  currentPath.textContent = payload.current_path;
  tree.innerHTML = "";

  payload.children.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tree-item ${item.type}`;
    button.innerHTML = `<span>${item.type === "directory" ? "DIR" : "FILE"} ${item.name}</span><span class="muted">${item.size ?? ""}</span>`;
    button.addEventListener("click", async () => {
      if (item.type === "directory") {
        await loadTree(item.path);
      } else {
        state.selectedFile = item.path;
        editorPath.value = item.path;
      }
    });
    tree.appendChild(button);
  });
}

async function loadSelectedFile() {
  if (!state.selectedRoot || !editorPath.value) return;
  const payload = await fetchJson(`/api/workspaces/file?root_id=${encodeURIComponent(state.selectedRoot)}&path=${encodeURIComponent(editorPath.value)}`);
  editor.value = payload.content;
  state.selectedFile = payload.path;
}

async function saveCurrentFile() {
  if (!state.selectedRoot || !editorPath.value) return;
  await fetchJson("/api/workspaces/file", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      root_id: state.selectedRoot,
      path: editorPath.value,
      content: editor.value,
    }),
  });
  state.selectedFile = editorPath.value;
}

async function parseSpec() {
  const payload = await fetchJson("/api/spec/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  parseSummary.innerHTML = `
    <h3>${payload.title}</h3>
    <p class="muted">Tempo ${payload.tempo} BPM</p>
    <p>${payload.tracks.length} track(s), ${payload.fences.length} fenced block(s), ${payload.bars} pattern bar(s), ${payload.arrangement_bars} arranged bar(s)</p>
    <div>${payload.supported_exports.map((item) => `<span class="badge">${item}</span>`).join("")}</div>
  `;
  state.parsedSpec = payload;
  transportTempo.value = String(payload.tempo);
  renderMasterGrid();
  return payload;
}

async function previewPlayback() {
  const payload = await fetchJson("/api/playback/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  renderPreviewPayload(payload);
  return payload;
}

async function compileSpec() {
  const payload = await fetchJson("/api/spec/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  renderCompiledPattern(payload);
  return payload;
}

function hideBootstrapBanner() {
  if (!bootstrapBanner) return;
  bootstrapBanner.className = "bootstrap-banner bootstrap-banner--hidden";
  bootstrapBanner.innerHTML = "";
}

function showBootstrapBanner(kind, title, detail) {
  if (!bootstrapBanner) return;
  bootstrapBanner.className = `bootstrap-banner bootstrap-banner--${kind}`;
  bootstrapBanner.innerHTML = "";
  const strong = document.createElement("strong");
  strong.textContent = title;
  const p = document.createElement("p");
  p.textContent = detail;
  bootstrapBanner.appendChild(strong);
  bootstrapBanner.appendChild(p);
}

async function loadSongscribeStatus() {
  let payload;
  try {
    payload = await fetchJson("/api/bootstrap/status");
  } catch {
    if (songscribeStatus) songscribeStatus.textContent = "unavailable";
    if (openSongscribeButton) openSongscribeButton.disabled = true;
    if (navSongscribeStatus) navSongscribeStatus.textContent = "unavailable";
    if (navOpenSongscribeButton) navOpenSongscribeButton.disabled = true;
    showBootstrapBanner("warn", "Could not load bootstrap status", "Check that the Groovebox API is running and refresh.");
    updateSongscribeEmbedButton();
    return;
  }
  const ss = payload.songscribe;
  const startup = payload.groovebox_startup || {};
  if (typeof ss.browser_url === "string" && ss.browser_url) {
    state.songscribeBrowserUrl = ss.browser_url;
  }
  const statusText = !ss.cloned
    ? "not cloned"
    : ss.running
      ? `running${ss.commit ? ` ${ss.commit}` : ""}`
      : `cloned (stopped)${ss.commit ? ` ${ss.commit}` : ""}`;

  if (!ss.cloned) {
    if (songscribeStatus) songscribeStatus.textContent = "not cloned";
    if (navSongscribeStatus) navSongscribeStatus.textContent = "not cloned";
    if (openSongscribeButton) {
      openSongscribeButton.disabled = true;
      openSongscribeButton.title = "Run bash scripts/setup-groovebox-first-run.sh (or start via run-groovebox-ui.sh once)";
    }
    if (navOpenSongscribeButton) {
      navOpenSongscribeButton.disabled = true;
      navOpenSongscribeButton.title = openSongscribeButton?.title || "";
    }
    showBootstrapBanner(
      "warn",
      "Songscribe is not installed yet",
      "From uDOS-groovebox run: bash scripts/setup-groovebox-first-run.sh — or restart with bash scripts/run-groovebox-ui.sh (first run clones automatically).",
    );
    updateSongscribeEmbedButton();
    return;
  }
  const openTitle = ss.running
    ? "Open Songscribe in a new tab"
    : "Songscribe may not respond until the dev server is up on port 3000";
  if (openSongscribeButton) {
    openSongscribeButton.disabled = false;
    openSongscribeButton.title = openTitle;
  }
  if (navOpenSongscribeButton) {
    navOpenSongscribeButton.disabled = false;
    navOpenSongscribeButton.title = openTitle;
  }
  if (songscribeStatus) songscribeStatus.textContent = statusText;
  if (navSongscribeStatus) navSongscribeStatus.textContent = statusText;

  if (ss.running) {
    hideBootstrapBanner();
    updateSongscribeEmbedButton();
    return;
  }
  if (startup.hint) {
    showBootstrapBanner("info", "Songscribe UI not detected on port 3000", startup.hint);
  } else {
    showBootstrapBanner(
      "info",
      "Songscribe UI not running",
      "Check the terminal where you started Groovebox for Docker/npm hints, or run: docker compose -f containers/songscribe/docker-compose.yml up",
    );
  }
  updateSongscribeEmbedButton();
}

async function saveSession() {
  const sessionName = state.compiledPattern?.title || state.parsedSpec?.title || "groovebox-session";
  const payload = await fetchJson("/api/sessions/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: sessionName,
      markdown: editor.value,
    }),
  });
  sessionSummary.innerHTML = `<strong>Saved session</strong><div class="muted">${payload.path}</div>`;
}

async function savePattern() {
  const patternName = state.compiledPattern?.title || state.parsedSpec?.title || "groovebox-pattern";
  const payload = await fetchJson("/api/patterns/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: patternName,
      markdown: editor.value,
    }),
  });
  sessionSummary.innerHTML = `<strong>Saved pattern</strong><div class="muted">${payload.path}</div>`;
  renderCompiledPattern(payload.compiled);
  renderPreviewPayload(payload.playback);
  await loadPatternLibrary();
}

async function exportMidi() {
  const payload = await fetchJson("/api/exports/midi/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  state.midiExport = payload;
  patternJson.textContent = JSON.stringify(payload, null, 2);
  sessionSummary.innerHTML = `<strong>Exported MIDI File</strong><div class="muted">${payload.path}</div>`;
}

async function exportWav() {
  const payload = await fetchJson("/api/exports/wav/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  patternJson.textContent = JSON.stringify(payload, null, 2);
  sessionSummary.innerHTML = `<strong>Rendered WAV File</strong><div class="muted">${payload.path}</div>`;
}

async function exportNotation() {
  const payload = await fetchJson("/api/exports/notation/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  patternJson.textContent = JSON.stringify(payload, null, 2);
  sessionSummary.innerHTML = `<strong>Exported Notation</strong><div class="muted">${payload.path}</div>`;
}

async function exportMml() {
  const payload = await fetchJson("/api/exports/mml/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  patternJson.textContent = JSON.stringify(payload, null, 2);
  sessionSummary.innerHTML = `<strong>Exported MML</strong><div class="muted">${payload.path}</div>`;
}

async function exportMusicxml() {
  const payload = await fetchJson("/api/exports/musicxml/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value }),
  });
  patternJson.textContent = JSON.stringify(payload, null, 2);
  sessionSummary.innerHTML = `<strong>Exported MusicXML</strong><div class="muted">${payload.path}</div>`;
}

function ensureAudioContext() {
  if (!state.playback.context) {
    state.playback.context = new window.AudioContext();
  }
  return state.playback.context;
}

function stepDurationSeconds() {
  return state.playbackPreview?.transport?.step_duration_seconds || (60 / Number(transportTempo.value || state.compiledPattern?.tempo || 120) / 4);
}

function playSynthEvent(context, event) {
  const osc = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  const cutoff = event.automation?.cutoff ?? 0.55;
  const level = event.automation?.level ?? 0.85;
  const pan = ((event.automation?.pan ?? 0.5) * 2) - 1;
  osc.type = event.instrument.includes("bass") ? "sawtooth" : (event.instrument.includes("pad") ? "triangle" : "square");
  osc.frequency.setValueAtTime(event.frequency_hz, event.time);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(320 + cutoff * (event.instrument.includes("bass") ? 1200 : 3200), event.time);
  gain.gain.setValueAtTime(0.0001, event.time);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.03, (event.velocity / 900) * level), event.time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, event.time + event.duration_seconds);
  panner.pan.setValueAtTime(pan, event.time);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  panner.connect(context.destination);
  osc.start(event.time);
  osc.stop(event.time + event.duration_seconds);
}

function playKick(context, time, destination = context.destination, level = 1) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.9 * level, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(time);
  osc.stop(time + 0.16);
}

function playSnare(context, time, destination = context.destination, level = 1) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(1800, time);
  gain.gain.setValueAtTime(0.3 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  noise.start(time);
}

function playHat(context, time, destination = context.destination, level = 1) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(6000, time);
  gain.gain.setValueAtTime(0.12 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  noise.start(time);
}

function playSamplerEvent(context, event) {
  const instrument = event.instrument.toLowerCase();
  const level = event.automation?.level ?? 0.85;
  const panner = context.createStereoPanner();
  panner.pan.setValueAtTime(((event.automation?.pan ?? 0.5) * 2) - 1, event.time);
  panner.connect(context.destination);
  if (instrument.includes("snare")) {
    playSnare(context, event.time, panner, level);
    return;
  }
  if (instrument.includes("hat") || instrument.includes("hihat")) {
    playHat(context, event.time, panner, level);
    return;
  }
  if (instrument.includes("clap")) {
    playSnare(context, event.time, panner, level);
    return;
  }
  if (instrument.includes("drum")) {
    playKick(context, event.time, panner, level);
    if (Math.random() > 0.55) {
      playHat(context, event.time + 0.01, panner, level * 0.7);
    }
    return;
  }
  playKick(context, event.time, panner, level);
}

function playEvent(context, event, scheduledTime) {
  const scheduledEvent = { ...event, time: scheduledTime };
  if (event.engine === "sampler") {
    playSamplerEvent(context, scheduledEvent);
    return;
  }
  playSynthEvent(context, scheduledEvent);
}

function highlightPlayhead(stepIndex) {
  transportStep.textContent = String(stepIndex + 1);
  renderMasterGrid(stepIndex);
  document.querySelectorAll(".step-grid").forEach((grid) => {
    Array.from(grid.children).forEach((cell, index) => {
      cell.classList.toggle("playhead", index === stepIndex);
    });
  });
}

function renderChannelStepGrids() {
  const tracks = state.playbackPreview?.channels || state.compiledPattern?.tracks;
  if (!tracks) return;
  tracks.forEach((track) => {
    const grid = document.querySelector(`[data-step-grid="${CSS.escape(track.name)}"]`);
    if (!grid) return;
    grid.innerHTML = "";
    const timelineSteps = track.timeline_steps || track.steps || [];
    grid.style.setProperty("--step-count", String(timelineSteps.length));
    timelineSteps.forEach((value) => {
      const cell = document.createElement("div");
      cell.className = "step-cell";
      if (value) {
        cell.classList.add("active");
      }
      grid.appendChild(cell);
    });
  });
}

function scheduler() {
  const playback = state.playback;
  const context = playback.context;
  if (!context || !state.playbackPreview) return;
  const stepCount = state.playbackPreview.transport.step_count;
  while (playback.nextNoteTime < context.currentTime + playback.scheduleAheadTime) {
    const stepIndex = playback.currentStep % stepCount;
    const stepEvents = state.playback.eventsByStep.get(stepIndex) || [];
    stepEvents.forEach((event) => playEvent(context, event, playback.nextNoteTime));
    highlightPlayhead(stepIndex);
    playback.nextNoteTime += stepDurationSeconds();
    playback.currentStep = (playback.currentStep + 1) % stepCount;
  }
}

async function startPlayback() {
  if (state.playback.isPlaying) return;
  if (!state.playbackPreview) {
    await previewPlayback();
  }
  const context = ensureAudioContext();
  if (context.state === "suspended") {
    await context.resume();
  }
  state.playback.isPlaying = true;
  state.playback.currentStep = 0;
  state.playback.nextNoteTime = context.currentTime + 0.05;
  state.playback.timerId = window.setInterval(scheduler, state.playback.lookaheadMs);
  transportState.textContent = "playing";
}

function stopPlayback() {
  if (state.playback.timerId) {
    window.clearInterval(state.playback.timerId);
    state.playback.timerId = null;
  }
  state.playback.isPlaying = false;
  state.playback.currentStep = 0;
  transportState.textContent = "idle";
  transportStep.textContent = "0";
  renderMasterGrid();
  document.querySelectorAll(".step-grid").forEach((grid) => {
    Array.from(grid.children).forEach((cell) => cell.classList.remove("playhead"));
  });
}

document.getElementById("path-up").addEventListener("click", async () => {
  const next = state.currentPath.split("/").slice(0, -1).join("/");
  await loadTree(next);
});

rootSelect.addEventListener("change", async (event) => {
  state.selectedRoot = event.target.value;
  await loadTree("");
});

document.getElementById("load-selected").addEventListener("click", loadSelectedFile);
document.getElementById("save-file").addEventListener("click", saveCurrentFile);
document.getElementById("save-session").addEventListener("click", async () => {
  await compileSpec();
  await saveSession();
});
document.getElementById("save-pattern").addEventListener("click", async () => {
  await parseSpec();
  await savePattern();
});
document.getElementById("parse-spec").addEventListener("click", parseSpec);
document.getElementById("compile-spec").addEventListener("click", compileSpec);
document.getElementById("preview-playback").addEventListener("click", async () => {
  await parseSpec();
  await previewPlayback();
});
document.getElementById("export-midi").addEventListener("click", exportMidi);
document.getElementById("export-wav").addEventListener("click", exportWav);
document.getElementById("export-notation").addEventListener("click", exportNotation);
document.getElementById("export-mml").addEventListener("click", exportMml);
document.getElementById("export-musicxml").addEventListener("click", exportMusicxml);
document.getElementById("transport-play").addEventListener("click", startPlayback);
document.getElementById("transport-stop").addEventListener("click", stopPlayback);
composerUndoButton.addEventListener("click", undoComposerEdit);
composerRedoButton.addEventListener("click", redoComposerEdit);
addArrangementSectionButton.addEventListener("click", () => {
  applyPatternEdit((pattern) => {
    const nextIndex = pattern.arrangement.length + 1;
    const nextLabel = `S${nextIndex}`;
    pattern.arrangement.push({ label: nextLabel, repeats: 1, bars: pattern.bars });
    pattern.sections = pattern.sections || [];
    pattern.sections.push({
      label: nextLabel,
      bars: pattern.bars,
      tracks: structuredClone(activeSection(pattern)?.tracks || pattern.tracks || []),
    });
    pattern.timeline = null;
    state.activeSectionLabel = nextLabel;
  });
});
phraseBrushSelect.addEventListener("change", renderComposerEditor);
automationBrushSelect.addEventListener("change", renderComposerEditor);
window.addEventListener("pointerup", endComposerPaint);
window.addEventListener("keydown", (event) => {
  const metaKey = event.metaKey || event.ctrlKey;
  if (!metaKey) return;
  if (event.key.toLowerCase() === "z" && !event.shiftKey) {
    event.preventDefault();
    undoComposerEdit();
  } else if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") {
    event.preventDefault();
    redoComposerEdit();
  }
});
transportTempo.addEventListener("change", async () => {
  if (state.parsedSpec) {
    state.parsedSpec.tempo = Number(transportTempo.value);
  }
  if (state.compiledPattern) {
    state.compiledPattern.tempo = Number(transportTempo.value);
    patternJson.textContent = JSON.stringify(state.compiledPattern, null, 2);
  }
  if (state.playbackPreview) {
    state.playbackPreview.tempo = Number(transportTempo.value);
  }
});

function wireOpenSongscribe(button) {
  if (!button) return;
  button.addEventListener("click", () => {
    window.open(state.songscribeBrowserUrl, "_blank", "noopener,noreferrer");
  });
}

wireOpenSongscribe(openSongscribeButton);
wireOpenSongscribe(navOpenSongscribeButton);

function grooveboxPageFromHash() {
  let h = (window.location.hash || "").slice(1).toLowerCase();
  const legacy = {
    "section-overview": "overview",
    "section-workspace": "vault",
    "section-editor": "composer",
    "section-playback": "composer",
  };
  if (legacy[h]) {
    h = legacy[h];
  }
  if (!h) {
    return "composer";
  }
  if (["composer", "vault", "library", "overview"].includes(h)) {
    return h;
  }
  return "composer";
}

function showGrooveboxPage(page) {
  document.querySelectorAll(".app-page[data-page]").forEach((el) => {
    el.hidden = el.dataset.page !== page;
  });
  document.querySelectorAll(".app-nav-links a[data-nav]").forEach((a) => {
    a.classList.toggle("is-active", a.dataset.nav === page);
  });
}

function initGrooveboxRouter() {
  const apply = () => showGrooveboxPage(grooveboxPageFromHash());
  window.addEventListener("hashchange", apply);
  apply();
}

initGrooveboxRouter();

if (songscribeDockerStart) {
  songscribeDockerStart.addEventListener("click", () => runSongscribeDocker("start"));
}
if (songscribeDockerStop) {
  songscribeDockerStop.addEventListener("click", () => runSongscribeDocker("stop"));
}
if (songscribeEmbedToggle) {
  songscribeEmbedToggle.addEventListener("click", () => {
    setSongscribeEmbed(!state.songscribeEmbedOpen);
  });
}
if (songscribeEmbedClose) {
  songscribeEmbedClose.addEventListener("click", () => setSongscribeEmbed(false));
}

Promise.all([loadRoots(), loadPatternLibrary(), loadSongscribeStatus(), loadSongscribeDockerControls(), parseSpec(), compileSpec(), previewPlayback()]).catch((error) => {
  parseSummary.innerHTML = `<p>${error.message}</p>`;
});
