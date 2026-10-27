/**
 * app.js
 * ======
 * Shelter Mind 3D Neural Plexus Atlas 메인 컨트롤러 (Clean White Light UI)
 */

import {
  BRAIN_REGIONS,
  ELECTRODE_DATA,
  INDIVIDUAL_CLASSIFIERS,
  MODEL_EVOLUTION_COMPARISON,
  ONLINE_SESSIONS,
  PARTICIPANT_BUNDLES,
  RESEARCH_PILLARS,
  SCROLL_STORIES
} from "./brain_data.js";
import { BrainAtlas3D } from "./brain_atlas_3d.js";

const CORE_8_IDS = ["T8", "T7", "C4", "C3", "F7", "Cz", "P7", "F3"];
const DEFAULT_CAM_POS = [4.15, 0.55, 2.85];

class BrainAtlasApp {
  constructor() {
    this.currentMode = "scroll";
    this.channelFilter = "all";
    this.selectedElectrode = ELECTRODE_DATA[0];
    this.selectedClassifier = INDIVIDUAL_CLASSIFIERS[0];
    this.classifierRightTab = "inspector";

    this.c3WaveHistory = new Array(90).fill(8.0);
    this.c4WaveHistory = new Array(90).fill(8.0);
    this.localFallbackPhase = 0;

    this.init3D();
    this.renderScrollStories();
    this.renderClassifiersDirectory();
    this.renderClassifierRightPanel();
    this.renderExplorerDirectory();
    this.renderElectrodeInspector(this.selectedElectrode);
    this.renderLive8ChBars();
    this.renderSessionTable();
    this.bindUIEvents();
    this.startLiveTelemetryLoop();
  }

  init3D() {
    const canvasContainer = document.getElementById("canvas-container");
    const labelContainer = document.getElementById("electrode-labels-layer");

    this.atlas3D = new BrainAtlas3D(canvasContainer, labelContainer, (elData) => {
      this.selectedElectrode = elData;
      this.renderElectrodeInspector(elData);
      this.highlightActiveChip(elData.id);
      this.updateHudBadge(
        `${elData.id} · ${elData.anatomicalName} (Rank #${elData.rank}, Score ${elData.compositeScore.toFixed(1)})`
      );
    });
  }

  updateHudBadge(title) {
    const titleEl = document.getElementById("hud-stim-title");
    if (titleEl) titleEl.textContent = title;
  }

  renderScrollStories() {
    const container = document.getElementById("scrolly-cards-container");
    if (!container) return;

    const lateralViewPos = [
      DEFAULT_CAM_POS,
      [3.35, 0.95, 3.35],
      [0.0, 3.65, 2.85],
      [3.85, 1.05, 2.25],
      [-3.85, 1.05, 2.25],
      [3.15, 1.35, 3.55]
    ];

    container.innerHTML = SCROLL_STORIES.map((st, idx) => `
      <article class="story-step-card ${idx === 0 ? "in-view" : ""}" data-step="${st.step}">
        <span class="story-badge">${st.badge}</span>
        <h2 class="story-title">${st.title}</h2>
        <div class="story-subtitle">${st.subtitle}</div>
        <p class="story-desc">${st.description}</p>
        <div class="story-metrics-grid">
          ${st.metrics.map((m) => `
            <div class="story-metric-box">
              <span class="story-metric-label">${m.label}</span>
              <span class="story-metric-value">${m.value}</span>
            </div>
          `).join("")}
        </div>
        ${idx === SCROLL_STORIES.length - 1 ? `
          <div class="story-action-row">
            <button class="story-jump-btn" data-goto-mode="classifiers">Classifiers &amp; Pipeline</button>
            <button class="story-jump-btn" data-goto-mode="explorer">Atlas Explorer</button>
            <button class="story-jump-btn" data-goto-mode="live">Live Telemetry</button>
          </div>
        ` : ""}
      </article>
    `).join("");

    const cards = container.querySelectorAll(".story-step-card");
    const observer = new IntersectionObserver(
      (entries) => {
        if (this.currentMode !== "scroll") return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cards.forEach((c) => c.classList.remove("in-view"));
            entry.target.classList.add("in-view");
            const stepIdx = parseInt(entry.target.getAttribute("data-step"), 10);
            const story = SCROLL_STORIES[stepIdx];
            if (story) {
              this.atlas3D.applyVisualMode(story.visualMode);
              this.atlas3D.flyToCamera(lateralViewPos[stepIdx] || DEFAULT_CAM_POS, stepIdx === 0);
              this.syncBottomToolbarActive(story.visualMode);
              this.updateHudBadge(`${story.badge} — ${story.subtitle}`);
            }
          }
        });
      },
      { threshold: 0.52 }
    );

    cards.forEach((c) => observer.observe(c));

    window.addEventListener("scroll", () => {
      if (this.currentMode !== "scroll") return;
      const scrollTop = window.scrollY;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      const bar = document.getElementById("scroll-progress-bar");
      if (bar) bar.style.width = `${pct}%`;
    });

    container.querySelectorAll("[data-goto-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchMode(btn.getAttribute("data-goto-mode"));
      });
    });
  }

  renderClassifiersDirectory() {
    const clfListEl = document.getElementById("clf-directory-list");
    const bundleListEl = document.getElementById("participant-bundles-list");
    if (clfListEl) {
      clfListEl.innerHTML = INDIVIDUAL_CLASSIFIERS.map((clf) => `
        <button class="clf-select-card ${this.selectedClassifier?.id === clf.id ? "active" : ""}" data-clf-id="${clf.id}">
          <div class="clf-card-top">
            <span class="clf-tag">${clf.shortTag}</span>
            <span class="clf-dim-pill">${clf.featureDim.split(" ")[0]}</span>
          </div>
          <div class="clf-card-title">${clf.name}</div>
          <div class="clf-card-role">${clf.roleBadge}</div>
        </button>
      `).join("");

      clfListEl.querySelectorAll(".clf-select-card").forEach((card) => {
        card.addEventListener("click", () => {
          const cid = card.getAttribute("data-clf-id");
          const found = INDIVIDUAL_CLASSIFIERS.find((x) => x.id === cid);
          if (found) {
            this.selectedClassifier = found;
            this.classifierRightTab = "inspector";
            this.renderClassifiersDirectory();
            this.renderClassifierRightPanel();
            this.atlas3D.applyClassifierProfile(found);
            this.updateHudBadge(`Classifier: ${found.name} — ${found.featureDim}`);
          }
        });
      });
    }

    if (bundleListEl) {
      bundleListEl.innerHTML = PARTICIPANT_BUNDLES.map((b) => `
        <div class="bundle-card">
          <div class="bundle-head">
            <span class="bundle-subj">${b.subject}</span>
            <span class="bundle-file">${b.bundleFile}</span>
          </div>
          <div class="bundle-meta">
            • Channels: <strong>${b.channels}</strong><br/>
            • Window: ${b.epochWindow}<br/>
            • Classifier: <strong>${b.classifier}</strong><br/>
            • Performance: <strong style="color:var(--accent-emerald)">${b.offlinePerf}</strong>
          </div>
          <p class="bundle-desc">${b.keyFinding}</p>
        </div>
      `).join("");
    }
  }

  renderClassifierRightPanel() {
    const panel = document.getElementById("classifier-right-inspector");
    if (!panel) return;
    const clf = this.selectedClassifier || INDIVIDUAL_CLASSIFIERS[0];

    let bodyHtml = "";
    if (this.classifierRightTab === "inspector") {
      bodyHtml = `
        <div class="inspector-top-banner">
          <div>
            <div class="panel-kicker">${clf.shortTag}</div>
            <h2 style="font-size:15px; font-weight:700; margin-top:2px;">${clf.name}</h2>
            <p style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">${clf.roleBadge}</p>
          </div>
        </div>

        <div class="inspector-kpi-grid">
          ${clf.keyMetrics.map((m) => `
            <div class="kpi-card">
              <div class="kpi-label">${m.label}</div>
              <div class="kpi-value">${m.value}</div>
            </div>
          `).join("")}
        </div>

        <div class="inspector-box">
          <h4>End-to-End Preprocessing &amp; Feature Pipeline</h4>
          <div class="pipeline-flow-wrap">
            ${clf.preprocessing.map((step, i) => `
              <span class="pipe-step">${step}</span>
              ${i < clf.preprocessing.length - 1 ? `<span class="pipe-arrow">→</span>` : ""}
            `).join("")}
          </div>
          <div class="formula-code-box">
            <div><span style="color:#94a3b8"># Scikit-learn / MNE Spec</span></div>
            <div>${clf.codeSpec}</div>
            <div style="margin-top:4px; color:#93c5fd">${clf.formulaOrPrinciple}</div>
          </div>
        </div>

        <div class="inspector-box">
          <h4>연구 채택 배경 및 핵심 역할 (Why We Researched This)</h4>
          <p>${clf.whyUsed}</p>
        </div>

        <div class="inspector-box">
          <h4>알고리즘 강점 &amp; 실험 검증 결과</h4>
          <ul class="clf-strength-list">
            ${clf.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>
          <p style="margin-top:8px; font-size:11px; color:var(--text-muted)">
            <strong>한계점 및 보완:</strong> ${clf.limitations}
          </p>
        </div>

        <div class="inspector-box">
          <h4>3D 뇌 메쉬 활성 채널 (${clf.activeChannels.length}Ch)</h4>
          <div class="channel-chip-grid" style="margin-top:6px;">
            ${clf.activeChannels.map((chId) => `
              <span class="channel-chip core">
                <strong>${chId}</strong>
                <span style="font-size:9.5px; opacity:0.7">${Math.round((clf.channelWeights[chId] || 0.7) * 100)}%</span>
              </span>
            `).join("")}
          </div>
        </div>
      `;
    } else if (this.classifierRightTab === "comparison") {
      bodyHtml = `
        <div class="inspector-box">
          <h4>Gen-1 구형(420D SVM) vs Gen-2 신형(4D Shrinkage LDA) 정밀 비교</h4>
          <p style="margin-bottom:8px;">조교님 피드백(p1–p99 클리핑 + CSP 4D + MinMax + 정석 LDA)과 당일 캘리브레이션 재학습 안정성 검증을 통해 완성한 모델 아키텍처 세대교체 비교표입니다.</p>
          <div style="overflow-x:auto;">
            <table class="session-table">
              <thead>
                <tr>
                  <th>비교 항목</th>
                  <th>Gen-1 구형 (420D SVM)</th>
                  <th>Gen-2 신형 (4D LDA)</th>
                </tr>
              </thead>
              <tbody>
                ${MODEL_EVOLUTION_COMPARISON.map((r) => `
                  <tr>
                    <td><strong>${r.item}</strong></td>
                    <td style="color:var(--text-secondary)">${r.oldModel}</td>
                    <td><strong style="color:var(--accent-blue)">${r.newModel}</strong><br/><small style="color:var(--text-muted)">${r.impact}</small></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      bodyHtml = RESEARCH_PILLARS.map((p) => `
        <div class="pillar-card">
          <div class="pillar-code">${p.code}</div>
          <div class="pillar-title">${p.title}</div>
          <p class="pillar-summary">${p.summary}</p>
          ${p.phases ? p.phases.map((ph) => `
            <div class="phase-mini-item">
              <div class="phase-mini-head">${ph.phase} · ${ph.name}</div>
              <div class="phase-mini-desc">${ph.detail}</div>
            </div>
          `).join("") : ""}
          ${p.steps ? p.steps.map((st) => `
            <div class="phase-mini-item">
              <div class="phase-mini-head">${st.step}</div>
              <div class="phase-mini-desc">${st.desc}</div>
            </div>
          `).join("") : ""}
          ${p.gateRows ? `
            <div style="overflow-x:auto; margin-top:6px;">
              <table class="session-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Base→FT AUC</th>
                    <th>L/R Recall</th>
                    <th>Gate 판정</th>
                    <th>본실험 성공률</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.gateRows.map((g) => `
                    <tr>
                      <td><strong>${g.session}</strong></td>
                      <td>${g.baseAuc} → <strong>${g.ftAuc}</strong></td>
                      <td>${g.lRec} / ${g.rRec}</td>
                      <td style="color:${g.decision.startsWith("PASS") ? "var(--accent-emerald)" : "var(--accent-rose)"}; font-weight:700">${g.decision}</td>
                      <td><strong>${g.finalAcc}</strong></td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          ` : ""}
        </div>
      `).join("");
    }

    panel.innerHTML = `
      <div class="research-subtabs">
        <button class="res-subtab ${this.classifierRightTab === "inspector" ? "active" : ""}" data-rtab="inspector">개별 분류기 상세</button>
        <button class="res-subtab ${this.classifierRightTab === "comparison" ? "active" : ""}" data-rtab="comparison">420D SVM vs 4D LDA</button>
        <button class="res-subtab ${this.classifierRightTab === "pillars" ? "active" : ""}" data-rtab="pillars">핵심 연구 &amp; 디버깅</button>
      </div>
      ${bodyHtml}
    `;

    panel.querySelectorAll(".res-subtab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.classifierRightTab = btn.getAttribute("data-rtab");
        this.renderClassifierRightPanel();
      });
    });
  }

  renderExplorerDirectory() {
    const listEl = document.getElementById("atlas-region-list");
    if (!listEl) return;

    const regionKeys = Object.keys(BRAIN_REGIONS);
    listEl.innerHTML = regionKeys.map((rKey) => {
      const reg = BRAIN_REGIONS[rKey];
      const channels = ELECTRODE_DATA.filter((e) => {
        if (e.region !== rKey) return false;
        if (this.channelFilter === "core8") return e.isCore8;
        if (this.channelFilter === "excluded") return !e.isCore8;
        return true;
      });

      if (channels.length === 0) return "";

      return `
        <div class="region-group-card">
          <div class="region-group-title">
            <span>${reg.nameKo}</span>
            <span style="font-size:10px; font-family:var(--font-mono); color:var(--text-muted)">${channels.length}</span>
          </div>
          <p class="region-group-desc">${reg.role}</p>
          <div class="channel-chip-grid">
            ${channels.map((ch) => `
              <button class="channel-chip ${ch.isCore8 ? "core" : ""} ${this.selectedElectrode?.id === ch.id ? "selected" : ""}"
                      data-ch-id="${ch.id}">
                <span>${ch.id}</span>
                <span style="font-size:9.5px; opacity:0.65">#${ch.rank}</span>
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");

    listEl.querySelectorAll(".channel-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const chId = chip.getAttribute("data-ch-id");
        this.atlas3D.visualMode = "ATLAS_EXPLORER";
        this.atlas3D.selectElectrode(chId, true);
      });
    });
  }

  highlightActiveChip(chId) {
    document.querySelectorAll(".channel-chip").forEach((chip) => {
      chip.classList.toggle("selected", chip.getAttribute("data-ch-id") === chId);
    });
  }

  renderElectrodeInspector(el) {
    const panel = document.getElementById("electrode-inspector");
    if (!panel || !el) return;

    const scorePct = Math.min(100, (el.compositeScore / 78.34) * 100);
    const rfPct = Math.min(100, (el.rfImportance / 0.14) * 100);
    const aucPct = Math.min(100, ((el.singleAuc - 0.5) / 0.08) * 100);

    panel.innerHTML = `
      <div class="inspector-top-banner">
        <div class="inspector-ch-badge">
          <div class="ch-circle">${el.id}</div>
          <div>
            <div class="panel-kicker">${el.hemisphere} Hemisphere · Rank #${el.rank} / 16</div>
            <h2 style="font-size:14px; font-weight:700; margin-top:2px;">${el.anatomicalName}</h2>
          </div>
        </div>
        <span class="ch-status-tag ${el.isCore8 ? "core" : "excluded"}">
          ${el.isCore8 ? "Core 8CH" : "Excluded"}
        </span>
      </div>

      <div class="inspector-kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Composite Score</div>
          <div class="kpi-value">${el.compositeScore.toFixed(2)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Single-Channel AUC</div>
          <div class="kpi-value">${el.singleAuc.toFixed(3)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">RF Importance</div>
          <div class="kpi-value">${(el.rfImportance * 100).toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Mu Power Diff (R-L)</div>
          <div class="kpi-value">${el.powerDiff >= 0 ? "+" : ""}${el.powerDiff.toFixed(3)} dB</div>
        </div>
      </div>

      <div class="inspector-box">
        <h4>Anatomical Function &amp; MI Response</h4>
        <p>${el.description}</p>
      </div>

      <div class="inspector-box">
        <h4>Multi-Subject Selection Rationale</h4>
        <p>${el.subjectLogic}</p>
      </div>

      <div class="inspector-box">
        <h4>Quantitative Metrics (2,624 Trials)</h4>
        <div class="bar-compare-row">
          <div class="bar-label-line"><span>Composite Score</span><span>${el.compositeScore.toFixed(1)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${scorePct}%"></div></div>
        </div>
        <div class="bar-compare-row">
          <div class="bar-label-line"><span>Random Forest Importance</span><span>${el.rfImportance.toFixed(4)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${rfPct}%"></div></div>
        </div>
        <div class="bar-compare-row">
          <div class="bar-label-line"><span>Single-Ch Discriminability</span><span>${el.singleAuc.toFixed(3)}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(10, aucPct)}%"></div></div>
        </div>
      </div>

      <div class="inspector-box">
        <h4>Hardware Port Remapping</h4>
        <p style="font-family:var(--font-mono); font-size:11px;">
          Original: ${el.portOriginal}<br/>
          Remapped: <strong style="color:var(--text-primary)">${el.portRemapped}</strong>
        </p>
      </div>
    `;
  }

  renderLive8ChBars() {
    const container = document.getElementById("live-8ch-bars");
    if (!container) return;

    container.innerHTML = CORE_8_IDS.map((chId) => {
      const el = ELECTRODE_DATA.find((e) => e.id === chId);
      return `
        <div class="ch-live-item">
          <div class="ch-live-top">
            <span><strong>${chId}</strong> <small style="color:var(--text-muted)">${el?.hemisphere[0]}</small></span>
            <span id="live-act-val-${chId}">45%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" id="live-act-bar-${chId}" style="width:45%; transition: width 0.2s;"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  renderSessionTable() {
    const wrap = document.getElementById("session-table-wrap");
    if (!wrap) return;

    wrap.innerHTML = `
      <table class="session-table">
        <thead>
          <tr>
            <th>Session</th>
            <th>Trials</th>
            <th>Accuracy</th>
            <th>RT</th>
            <th>Adaptation / Safety Gate</th>
          </tr>
        </thead>
        <tbody>
          ${ONLINE_SESSIONS.map((s) => `
            <tr>
              <td><strong>${s.id}</strong></td>
              <td>${s.trials}</td>
              <td style="font-weight:700">${s.acc.toFixed(1)}%</td>
              <td>${s.rt.toFixed(2)}s</td>
              <td style="color:var(--text-secondary)">${s.gate}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  renderTrialHistory(trials) {
    const listEl = document.getElementById("trial-history-list");
    if (!listEl || !trials) return;

    const reversed = [...trials].reverse();
    listEl.innerHTML = reversed.map((t) => `
      <div class="trial-item" data-trial-dir="${t.direction}">
        <div>
          <strong style="font-family:var(--font-mono); color:${t.direction === "LEFT" ? "var(--accent-blue)" : "var(--accent-amber)"}">
            D${t.day} · ${t.direction}
          </strong>
          <span style="margin-left:6px; color:var(--text-primary)">${t.card_title}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:10.5px; color:var(--text-muted)">
          ${t.dominant_ch} · ${t.decision_sec}s
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll(".trial-item").forEach((item) => {
      item.addEventListener("click", () => {
        const dir = item.getAttribute("data-trial-dir");
        if (dir === "LEFT") {
          this.atlas3D.applyVisualMode("STIM_LEFT_MI");
          this.atlas3D.flyToCamera([3.85, 1.05, 2.25], false);
          this.updateHudBadge("Left Hand MI — Right Hemisphere (C4 · T8) Activated");
        } else {
          this.atlas3D.applyVisualMode("STIM_RIGHT_MI");
          this.atlas3D.flyToCamera([-3.85, 1.05, 2.25], false);
          this.updateHudBadge("Right Hand MI — Left Hemisphere (C3 · T7 · F3) Activated");
        }
      });
    });
  }

  drawOscilloscope() {
    const canvas = document.getElementById("eeg-waveform-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const drawLine = (arr, color, yOffset) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < arr.length; i++) {
        const x = (i / (arr.length - 1)) * w;
        const norm = (arr[i] - 8.5) * 6.0;
        const y = Math.max(6, Math.min(h - 6, yOffset - norm));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawLine(this.c4WaveHistory, "#2563eb", h * 0.36);
    drawLine(this.c3WaveHistory, "#d97706", h * 0.68);
  }

  startLiveTelemetryLoop() {
    let lastHistoryLen = 0;

    setInterval(async () => {
      let state = null;
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        if (res.ok) state = await res.json();
      } catch (_) {
        state = this._generateFallbackLiveState();
      }

      if (!state) return;

      const statusText = document.getElementById("status-text");
      if (statusText) {
        statusText.textContent = state.unity_connected
          ? `Unity Connected · ${state.session}`
          : `Replay Active · TCP :5000 Ready`;
      }

      if (this.currentMode === "live") {
        this.atlas3D.visualMode = "LIVE_SYNC";
        this.atlas3D.updateLiveActivations(state.channel_activations);
      }

      const lPct = (state.left_prob * 100).toFixed(1);
      const rPct = (state.right_prob * 100).toFixed(1);
      const lEl = document.getElementById("live-left-prob");
      const rEl = document.getElementById("live-right-prob");
      const barEl = document.getElementById("prob-bar-left");
      const levelEl = document.getElementById("live-fading-level");
      const trigEl = document.getElementById("live-trigger-text");
      const c3El = document.getElementById("live-c3-uv");
      const c4El = document.getElementById("live-c4-uv");

      if (lEl) lEl.textContent = `${lPct}%`;
      if (rEl) rEl.textContent = `${rPct}%`;
      if (barEl) barEl.style.width = `${lPct}%`;
      if (levelEl) levelEl.textContent = `LV ${state.level} · ${state.active_intent}`;
      if (trigEl) trigEl.textContent = state.trigger;
      if (c3El) c3El.textContent = `${state.c3_uV} uV`;
      if (c4El) c4El.textContent = `${state.c4_uV} uV`;

      this.c3WaveHistory.push(state.c3_uV);
      this.c3WaveHistory.shift();
      this.c4WaveHistory.push(state.c4_uV);
      this.c4WaveHistory.shift();
      this.drawOscilloscope();

      CORE_8_IDS.forEach((chId) => {
        const act = Math.round((state.channel_activations?.[chId] || 0.2) * 100);
        const valNode = document.getElementById(`live-act-val-${chId}`);
        const barNode = document.getElementById(`live-act-bar-${chId}`);
        if (valNode) valNode.textContent = `${act}%`;
        if (barNode) barNode.style.width = `${act}%`;
      });

      if (state.trial_history && state.trial_history.length !== lastHistoryLen) {
        lastHistoryLen = state.trial_history.length;
        this.renderTrialHistory(state.trial_history);
      }
    }, 250);
  }

  _generateFallbackLiveState() {
    this.localFallbackPhase += 0.2;
    const cycle = (this.localFallbackPhase * 1.2) % 10.0;
    let leftProb = 0.5;
    let activeIntent = "NEUTRAL";
    if (cycle < 4.2) {
      leftProb = 0.5 + 0.38 * Math.sin((cycle / 4.2) * Math.PI);
      activeIntent = "LEFT";
    } else if (cycle > 5.0 && cycle < 9.2) {
      leftProb = 0.5 - 0.38 * Math.sin(((cycle - 5.0) / 4.2) * Math.PI);
      activeIntent = "RIGHT";
    }
    const rightProb = 1.0 - leftProb;
    const acts = {};
    ELECTRODE_DATA.forEach((e, idx) => {
      const base = 0.18 + Math.abs(Math.sin(this.localFallbackPhase + idx)) * 0.12;
      if (e.hemisphere === "Right") acts[e.id] = Math.min(1, base + Math.max(0, leftProb - 0.45) * 1.4);
      else if (e.hemisphere === "Left") acts[e.id] = Math.min(1, base + Math.max(0, rightProb - 0.45) * 1.4);
      else acts[e.id] = base + 0.25;
    });
    return {
      session: "oyj_online0929_02",
      unity_connected: false,
      left_prob: leftProb,
      right_prob: rightProb,
      level: leftProb > 0.8 || rightProb > 0.8 ? 3 : leftProb > 0.65 || rightProb > 0.65 ? 2 : 1,
      trigger: leftProb > 0.8 ? "LEFT" : rightProb > 0.8 ? "RIGHT" : "NONE",
      active_intent: activeIntent,
      c3_uV: +(7.2 + (1 - rightProb) * 3.5 + Math.sin(this.localFallbackPhase * 2) * 0.9).toFixed(2),
      c4_uV: +(7.2 + (1 - leftProb) * 3.5 + Math.cos(this.localFallbackPhase * 2) * 0.9).toFixed(2),
      channel_activations: acts,
      trial_history: [
        { day: 1, direction: "RIGHT", decision_sec: 3.42, dominant_ch: "C3 / T7", conflict: 0.18, card_title: "외부 생존자 구조 요청" },
        { day: 2, direction: "LEFT", decision_sec: 2.85, dominant_ch: "T8 / C4", conflict: 0.12, card_title: "오염된 식수 정화 필터 배분" },
        { day: 3, direction: "LEFT", decision_sec: 4.10, dominant_ch: "C4 / Cz", conflict: 0.24, card_title: "무기고 야간 경비 교대" },
        { day: 4, direction: "RIGHT", decision_sec: 3.15, dominant_ch: "C3 / F3", conflict: 0.15, card_title: "감염 의심 구역 정찰 파견" }
      ]
    };
  }

  switchMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll(".mode-tab").forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-mode") === mode);
    });
    document.getElementById("view-scroll")?.classList.toggle("active", mode === "scroll");
    document.getElementById("view-classifiers")?.classList.toggle("active", mode === "classifiers");
    document.getElementById("view-explorer")?.classList.toggle("active", mode === "explorer");
    document.getElementById("view-live")?.classList.toggle("active", mode === "live");

    if (mode === "classifiers") {
      this.atlas3D.applyClassifierProfile(this.selectedClassifier);
      this.updateHudBadge(`Classifier: ${this.selectedClassifier.name} — ${this.selectedClassifier.featureDim}`);
    } else if (mode === "explorer") {
      this.atlas3D.visualMode = "ATLAS_EXPLORER";
      this.atlas3D.selectElectrode(this.selectedElectrode.id, true);
    } else if (mode === "live") {
      this.atlas3D.visualMode = "LIVE_SYNC";
      this.atlas3D.flyToCamera(DEFAULT_CAM_POS, true);
      this.updateHudBadge("Live Stream — Real-EEG Cortical Mesh Activation");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      this.atlas3D.applyVisualMode("OVERVIEW_ALL");
      this.atlas3D.flyToCamera(DEFAULT_CAM_POS, true);
    }
  }

  syncBottomToolbarActive(visualMode) {
    document.querySelectorAll(".floating-atlas-toolbar [data-stim]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-stim") === visualMode);
    });
  }

  bindUIEvents() {
    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.switchMode(tab.getAttribute("data-mode"));
      });
    });

    document.querySelectorAll(".floating-atlas-toolbar [data-stim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const stim = btn.getAttribute("data-stim");
        this.syncBottomToolbarActive(stim);
        this.atlas3D.applyVisualMode(stim);

        if (stim === "STIM_LEFT_MI") {
          this.atlas3D.flyToCamera([3.85, 1.05, 2.25], false);
          this.updateHudBadge("Left Hand MI — Right Sensorimotor (C4 · T8)");
        } else if (stim === "STIM_RIGHT_MI") {
          this.atlas3D.flyToCamera([-3.85, 1.05, 2.25], false);
          this.updateHudBadge("Right Hand MI — Left Sensorimotor (C3 · T7 · F3)");
        } else if (stim === "CORE_8CH") {
          this.atlas3D.flyToCamera([0.0, 3.65, 2.85], false);
          this.updateHudBadge("Confirmed 8-Channel Montage (T8, T7, C4, C3, F7, Cz, P7, F3)");
        } else if (stim === "NOISE_HIGHLIGHT") {
          this.atlas3D.flyToCamera([3.35, 0.95, 3.35], false);
          this.updateHudBadge("Excluded Noise Channels (Fp1, Fp2, O1, O2)");
        } else {
          this.atlas3D.flyToCamera(DEFAULT_CAM_POS, true);
          this.updateHudBadge("3D Neural Plexus Atlas — 8-Channel Adaptive MI-BCI");
        }
      });
    });

    const explodeSlider = document.getElementById("explode-slider");
    if (explodeSlider) {
      explodeSlider.addEventListener("input", (e) => {
        this.atlas3D.setExplodeFactor(parseFloat(e.target.value));
      });
    }

    const toggle16Btn = document.getElementById("toggle-16ch-btn");
    if (toggle16Btn) {
      toggle16Btn.addEventListener("click", () => {
        const next = !this.atlas3D.showAll16Electrodes;
        this.atlas3D.setShowAll16(next);
        toggle16Btn.textContent = next ? "Labels: 16CH" : "Labels: 8CH";
      });
    }

    const resetCamBtn = document.getElementById("reset-cam-btn");
    if (resetCamBtn) {
      resetCamBtn.addEventListener("click", () => {
        if (explodeSlider) explodeSlider.value = "0";
        this.atlas3D.setExplodeFactor(0);
        this.atlas3D.flyToCamera(DEFAULT_CAM_POS, true);
      });
    }

    document.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        this.channelFilter = pill.getAttribute("data-filter");
        this.renderExplorerDirectory();
      });
    });

    document.querySelectorAll(".intent-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        document.querySelectorAll(".intent-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const intent = btn.getAttribute("data-intent");
        try {
          await fetch("/api/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intent })
          });
        } catch (_) {}
      });
    });

    const simTurnBtn = document.getElementById("sim-new-turn-btn");
    if (simTurnBtn) {
      simTurnBtn.addEventListener("click", async () => {
        const dir = Math.random() < 0.5 ? "LEFT" : "RIGHT";
        const sampleCards = [
          "야간 발전기 연료 긴급 투입",
          "부상당한 정찰대원 항생제 투여",
          "지하 벙커 환기구 봉쇄 결단",
          "외부 생존자 무전 응답 승인"
        ];
        const cardTitle = sampleCards[Math.floor(Math.random() * sampleCards.length)];
        try {
          const res = await fetch("/api/control", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              record_trial: {
                direction: dir,
                decision_sec: (2.5 + Math.random() * 2.3).toFixed(2),
                peak_prob: (0.84 + Math.random() * 0.12).toFixed(2),
                conflict: (0.10 + Math.random() * 0.25).toFixed(2),
                card_title: cardTitle
              }
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.state?.trial_history) {
              this.renderTrialHistory(data.state.trial_history);
            }
          }
        } catch (_) {}
      });
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new BrainAtlasApp();
});
