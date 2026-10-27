/**
 * brain_atlas_3d.js
 * =================
 * Clean White 배경에 최적화된 3D Triangulated Neural Plexus Wireframe Brain Mesh 엔진
 * - 첫 화면에서 뇌가 너무 크지 않도록 전체 스케일 축소 (0.76x) 및 카메라 거리 여유 확보
 * - 흰 배경 위에서 선명하게 대비되는 코발트/인디고 신경망 와이어프레임 및 부위별 자극 색칠
 */

import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { ELECTRODE_DATA } from "./brain_data.js";

const BRAIN_SCALE = 0.76;
const DEFAULT_CAM_POS = [4.15, 0.55, 2.85];

export class BrainAtlas3D {
  constructor(canvasContainer, labelContainer, onSelectElectrode) {
    this.container = canvasContainer;
    this.labelContainer = labelContainer;
    this.onSelectElectrode = onSelectElectrode;

    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
    this.camera.position.set(...DEFAULT_CAM_POS);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.4;
    this.controls.maxDistance = 7.5;
    this.controls.target.set(0, -0.04, 0);

    this.targetCameraPos = new THREE.Vector3(...DEFAULT_CAM_POS);
    this.isCameraAnimating = false;
    this.autoRotate = true;

    this.visualMode = "OVERVIEW_ALL";
    this.selectedElectrodeId = "T8";
    this.showAll16Electrodes = true;
    this.explodeFactor = 0.0;
    this.clock = new THREE.Clock();

    this.channelStim = {};
    this.channelTargetColor = {};
    ELECTRODE_DATA.forEach((el) => {
      this.channelStim[el.id] = el.isCore8 ? 0.65 : 0.18;
      this.channelTargetColor[el.id] = new THREE.Color("#2563eb");
    });

    this.brainGroup = new THREE.Group();
    this.brainGroup.scale.setScalar(BRAIN_SCALE);
    this.scene.add(this.brainGroup);

    this.electrodeMeshes = [];
    this.electrodeMap = {};
    this.labelElements = {};

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this._createSharpNodeTexture();
    this._buildAnatomicalPlexusBrain();
    this._buildElectrodeNodes();
    this._bindEvents();
    this.applyVisualMode("OVERVIEW_ALL");
    this._animate();
  }

  _createSharpNodeTexture() {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.65, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.88, "rgba(255, 255, 255, 0.25)");
    grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    this.nodeTexture = new THREE.CanvasTexture(canvas);
  }

  _buildAnatomicalPlexusBrain() {
    const vertices = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    const createCerebralVertices = (countPerHemi, layerScale, isInner) => {
      for (const hemi of [-1, 1]) {
        for (let i = 0; i < countPerHemi; i++) {
          const t = (i + 0.5) / countPerHemi;
          const phi = Math.acos(1 - 2 * t);
          const theta = (2 * Math.PI * i) / goldenRatio;

          let ux = Math.abs(Math.sin(phi) * Math.cos(theta));
          let uy = Math.cos(phi);
          let uz = Math.sin(phi) * Math.sin(theta);

          let zLen = uz >= 0 ? 1.34 : 1.38;
          let yHeight = 1.02;

          if (uz > 0.25) {
            yHeight *= 0.96 - Math.pow(Math.max(0, uz - 0.35), 1.6) * 0.28;
          }
          if (uz < -0.2 && uy < 0.1) {
            uy = uy * 0.55 + 0.18 * Math.abs(uz);
          }

          let temporalBulgeX = 0;
          let temporalDropY = 0;
          if (uy < 0.05 && uz > -0.45 && uz < 0.55) {
            const tempMask = Math.exp(-Math.pow((uz - 0.06) / 0.38, 2)) * Math.exp(-Math.pow((uy + 0.32) / 0.36, 2));
            temporalBulgeX = tempMask * 0.26;
            temporalDropY = -tempMask * 0.28;
          }
          if (uy < -0.25) {
            uy = -0.25 + (uy + 0.25) * 0.32;
          }

          let xWidth = ux * 0.88 + 0.07 + temporalBulgeX;

          const sylvianDist = Math.abs((uy + 0.08) - 0.32 * uz);
          const centralDist = Math.abs(uz - (-0.05 + 0.18 * uy));
          const isSylvianRidge = ux > 0.35 && uz > -0.45 && uz < 0.55 && sylvianDist < 0.16;
          const isCentralRidge = uy > 0.15 && centralDist < 0.14;

          const facetNoise =
            Math.sin(ux * 9.5 + uz * 7.2 + i * 0.1) *
            Math.cos(uy * 8.8 - uz * 6.4) *
            (isInner ? 0.025 : 0.042);

          let x = hemi * (xWidth + facetNoise * 0.7) * layerScale;
          let y = (uy * yHeight + temporalDropY + 0.22 + facetNoise) * layerScale;
          let z = (uz * zLen + facetNoise) * layerScale;

          let ridgeBoost = 0.0;
          if (isSylvianRidge) {
            y = y * 0.92 + (-0.08 + 0.32 * uz) * 0.08;
            ridgeBoost = 0.85;
          } else if (isCentralRidge) {
            ridgeBoost = 0.55;
          }

          vertices.push({
            pos: new THREE.Vector3(x, y, z),
            basePos: new THREE.Vector3(x, y, z),
            hemi,
            part: "cerebrum",
            ridgeBoost
          });
        }
      }
    };

    createCerebralVertices(460, 1.0, false);
    createCerebralVertices(150, 0.76, true);

    const cerebCount = 110;
    for (const hemi of [-1, 1]) {
      for (let i = 0; i < cerebCount; i++) {
        const t = (i + 0.5) / cerebCount;
        const phi = Math.acos(1 - 2 * t);
        const theta = (2 * Math.PI * i) / goldenRatio;

        const ux = Math.abs(Math.sin(phi) * Math.cos(theta));
        const uy = Math.cos(phi);
        const uz = Math.sin(phi) * Math.sin(theta);

        const folia = Math.sin(uy * 16.0) * 0.018;
        const x = hemi * (ux * 0.52 + 0.05 + folia);
        const y = -0.36 + uy * 0.28;
        const z = -0.74 + uz * 0.36 + folia;

        vertices.push({
          pos: new THREE.Vector3(x, y, z),
          basePos: new THREE.Vector3(x, y, z),
          hemi,
          part: "cerebellum",
          ridgeBoost: 0.25
        });
      }
    }

    const stemRings = 9;
    const stemSegs = 12;
    for (let r = 0; r < stemRings; r++) {
      const v = r / (stemRings - 1);
      const radiusX = 0.22 * (1.0 - v * 0.48);
      const radiusZ = 0.20 * (1.0 - v * 0.45);
      const centerZ = -0.18 - v * 0.22 + Math.sin(v * Math.PI) * 0.06;
      const centerY = -0.22 - v * 0.68;

      for (let s = 0; s < stemSegs; s++) {
        const ang = (s / stemSegs) * Math.PI * 2;
        const jitter = Math.sin(r * 3.1 + s * 2.7) * 0.015;
        const x = Math.cos(ang) * (radiusX + jitter);
        const y = centerY + Math.cos(ang * 2) * 0.015;
        const z = centerZ + Math.sin(ang) * (radiusZ + jitter);

        vertices.push({
          pos: new THREE.Vector3(x, y, z),
          basePos: new THREE.Vector3(x, y, z),
          hemi: x < 0 ? -1 : 1,
          part: "brainstem",
          ridgeBoost: 0.35
        });
      }
    }

    this.vertices = vertices;
    const numVerts = vertices.length;

    const elPositions = ELECTRODE_DATA.map((e) => new THREE.Vector3(...e.pos));
    this.vertNearestCh1 = new Uint8Array(numVerts);
    this.vertWeight1 = new Float32Array(numVerts);
    this.vertNearestCh2 = new Uint8Array(numVerts);
    this.vertWeight2 = new Float32Array(numVerts);

    for (let i = 0; i < numVerts; i++) {
      const vp = vertices[i].basePos;
      let best1 = 0, best2 = 1, d1 = 999, d2 = 999;
      for (let e = 0; e < elPositions.length; e++) {
        const d = vp.distanceTo(elPositions[e]);
        if (d < d1) { d2 = d1; best2 = best1; d1 = d; best1 = e; }
        else if (d < d2) { d2 = d; best2 = e; }
      }
      this.vertNearestCh1[i] = best1;
      this.vertWeight1[i] = Math.exp(-(d1 * d1) / 0.38);
      this.vertNearestCh2[i] = best2;
      this.vertWeight2[i] = Math.exp(-(d2 * d2) / 0.45) * 0.5;
    }

    const edgePairs = [];
    const edgeSet = new Set();

    for (let i = 0; i < numVerts; i++) {
      const vi = vertices[i];
      const candidates = [];

      for (let j = 0; j < numVerts; j++) {
        if (i === j) continue;
        const vj = vertices[j];
        if (vi.part === "cerebrum" && vj.part === "cerebrum" && vi.hemi !== vj.hemi) {
          if (Math.abs(vi.basePos.x) > 0.16 || Math.abs(vj.basePos.x) > 0.16) continue;
        }
        const d = vi.basePos.distanceToSquared(vj.basePos);
        if (d < 0.11) {
          candidates.push({ j, d });
        }
      }

      candidates.sort((a, b) => a.d - b.d);
      const maxLinks = vi.ridgeBoost > 0.5 ? 7 : 5;
      for (let k = 0; k < Math.min(maxLinks, candidates.length); k++) {
        const j = candidates[k].j;
        const a = Math.min(i, j);
        const b = Math.max(i, j);
        const key = `${a}_${b}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edgePairs.push(a, b);
        }
      }
    }

    this.edgeIndices = new Uint16Array(edgePairs);
    const numEdges = edgePairs.length / 2;

    const linePositions = new Float32Array(numEdges * 6);
    const lineColors = new Float32Array(numEdges * 6);

    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    this.lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    this.lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.52,
      blending: THREE.NormalBlending
    });

    this.plexusLines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    this.brainGroup.add(this.plexusLines);

    const nodePositions = new Float32Array(numVerts * 3);
    const nodeColors = new Float32Array(numVerts * 3);

    this.nodeGeometry = new THREE.BufferGeometry();
    this.nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    this.nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    this.nodeMaterial = new THREE.PointsMaterial({
      size: 0.032,
      map: this.nodeTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.plexusNodes = new THREE.Points(this.nodeGeometry, this.nodeMaterial);
    this.brainGroup.add(this.plexusNodes);
  }

  _buildElectrodeNodes() {
    this.electrodeGroup = new THREE.Group();
    this.brainGroup.add(this.electrodeGroup);

    const sphereGeo = new THREE.SphereGeometry(0.038, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.054, 0.070, 24);

    ELECTRODE_DATA.forEach((el) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...el.pos);

      const baseColor = el.isCore8 ? 0x2563eb : 0x94a3b8;
      const mat = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: el.isCore8 ? 0.95 : 0.45
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.userData = { electrodeId: el.id, data: el };
      nodeGroup.add(mesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: el.isCore8 ? 0.45 : 0.2
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(nodeGroup.position.clone().multiplyScalar(2));
      nodeGroup.add(ring);

      this.electrodeGroup.add(nodeGroup);
      this.electrodeMeshes.push(mesh);
      this.electrodeMap[el.id] = { group: nodeGroup, mesh, ring, data: el, basePos: new THREE.Vector3(...el.pos) };

      if (this.labelContainer) {
        const tag = document.createElement("button");
        tag.className = `electrode-label ${el.isCore8 ? "core8" : "excluded"}`;
        tag.innerHTML = `<span class="ch-id">${el.id}</span>`;
        tag.addEventListener("click", (ev) => {
          ev.stopPropagation();
          this.selectElectrode(el.id, true);
        });
        this.labelContainer.appendChild(tag);
        this.labelElements[el.id] = tag;
      }
    });
  }

  applyVisualMode(mode) {
    this.visualMode = mode;

    // 흰 배경에서 선명하고 깔끔한 메디컬 아틀라스 컬러 팔레트
    const royalBlue = new THREE.Color("#2563eb");
    const deepIndigo = new THREE.Color("#1d4ed8");
    const crimsonRose = new THREE.Color("#e11d48");
    const amberOrange = new THREE.Color("#d97706");
    const emerald = new THREE.Color("#059669");
    const mutedSlate = new THREE.Color("#94a3b8");

    ELECTRODE_DATA.forEach((el) => {
      if (mode === "OVERVIEW_ALL") {
        this.channelStim[el.id] = el.isCore8 ? 0.72 : 0.35;
        this.channelTargetColor[el.id] = el.isCore8 ? royalBlue : mutedSlate;
      } else if (mode === "NOISE_HIGHLIGHT") {
        const isNoise = ["Fp1", "Fp2", "O1", "O2", "P8", "F8"].includes(el.id);
        this.channelStim[el.id] = isNoise ? 1.0 : 0.12;
        this.channelTargetColor[el.id] = isNoise ? crimsonRose : mutedSlate;
      } else if (mode === "CORE_8CH") {
        this.channelStim[el.id] = el.isCore8 ? 0.96 : 0.08;
        this.channelTargetColor[el.id] = el.isCore8 ? deepIndigo : mutedSlate;
      } else if (mode === "STIM_LEFT_MI") {
        const isRightActive = ["T8", "C4", "Cz"].includes(el.id);
        this.channelStim[el.id] = el.id === "T8" || el.id === "C4" ? 1.0 : el.id === "Cz" ? 0.75 : 0.08;
        this.channelTargetColor[el.id] = isRightActive ? royalBlue : mutedSlate;
      } else if (mode === "STIM_RIGHT_MI") {
        const isLeftActive = ["C3", "T7", "F3", "F7", "P7", "Cz"].includes(el.id);
        this.channelStim[el.id] = ["C3", "T7", "F3"].includes(el.id) ? 1.0 : isLeftActive ? 0.85 : 0.08;
        this.channelTargetColor[el.id] = isLeftActive ? amberOrange : mutedSlate;
      } else if (mode === "REMAPPING_RECOVERY") {
        const isRemapped = ["T8", "C4", "Cz", "P7"].includes(el.id);
        this.channelStim[el.id] = isRemapped ? 1.0 : el.isCore8 ? 0.55 : 0.08;
        this.channelTargetColor[el.id] = isRemapped ? emerald : el.isCore8 ? royalBlue : mutedSlate;
      }
    });
  }

  updateLiveActivations(channelActivations) {
    if (this.visualMode !== "LIVE_SYNC") return;
    const royalBlue = new THREE.Color("#2563eb");
    const amberOrange = new THREE.Color("#d97706");
    const emerald = new THREE.Color("#059669");

    ELECTRODE_DATA.forEach((el) => {
      const act = channelActivations?.[el.id] ?? 0.18;
      this.channelStim[el.id] = el.isCore8 ? act : act * 0.25;
      if (el.hemisphere === "Right") this.channelTargetColor[el.id] = royalBlue;
      else if (el.hemisphere === "Left") this.channelTargetColor[el.id] = amberOrange;
      else this.channelTargetColor[el.id] = emerald;
    });
  }

  selectElectrode(electrodeId, flyCamera = false) {
    this.selectedElectrodeId = electrodeId;
    const targetEntry = this.electrodeMap[electrodeId];
    if (!targetEntry) return;
    const elData = targetEntry.data;

    if (this.visualMode === "ATLAS_EXPLORER") {
      const activeCol = elData.isCore8 ? new THREE.Color("#2563eb") : new THREE.Color("#e11d48");
      const dimCol = new THREE.Color("#94a3b8");

      ELECTRODE_DATA.forEach((el) => {
        if (el.id === electrodeId) {
          this.channelStim[el.id] = 1.0;
          this.channelTargetColor[el.id] = activeCol;
        } else if (el.region === elData.region) {
          this.channelStim[el.id] = 0.68;
          this.channelTargetColor[el.id] = activeCol;
        } else {
          this.channelStim[el.id] = 0.10;
          this.channelTargetColor[el.id] = dimCol;
        }
      });
    }

    if (flyCamera) {
      const pos = new THREE.Vector3(...elData.pos);
      const camTarget = pos.clone().normalize().multiplyScalar(4.2);
      camTarget.y = Math.max(0.35, camTarget.y + 0.3);
      if (Math.abs(camTarget.x) < 0.9) camTarget.x = elData.hemisphere === "Left" ? -2.5 : 2.5;
      this.flyToCamera(camTarget, false);
    }

    if (this.onSelectElectrode) {
      this.onSelectElectrode(elData);
    }
  }

  setExplodeFactor(val) {
    this.explodeFactor = Math.max(0, Math.min(1, Number(val) || 0));
  }

  flyToCamera(vec3ArrayOrVector, enableAutoRotate = true) {
    if (Array.isArray(vec3ArrayOrVector)) {
      this.targetCameraPos.set(...vec3ArrayOrVector);
    } else {
      this.targetCameraPos.copy(vec3ArrayOrVector);
    }
    this.isCameraAnimating = true;
    this.autoRotate = enableAutoRotate;
  }

  setShowAll16(showAll) {
    this.showAll16Electrodes = showAll;
  }

  _bindEvents() {
    window.addEventListener("resize", () => this._onResize());
    this.controls.addEventListener("start", () => {
      this.isCameraAnimating = false;
      this.autoRotate = false;
    });

    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      this._pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.renderer.domElement.addEventListener("pointerup", (e) => {
      if (!this._pointerDownPos) return;
      const dx = Math.abs(e.clientX - this._pointerDownPos.x);
      const dy = Math.abs(e.clientY - this._pointerDownPos.y);
      if (dx > 6 || dy > 6) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.electrodeMeshes, false);
      if (hits.length > 0) {
        const hitId = hits[0].object.userData.electrodeId;
        if (hitId) this.selectElectrode(hitId, true);
      }
    });
  }

  _onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const elapsed = this.clock.getElapsedTime();

    if (this.isCameraAnimating) {
      this.camera.position.lerp(this.targetCameraPos, 0.055);
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.03) {
        this.isCameraAnimating = false;
      }
    } else if (this.autoRotate) {
      this.brainGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.22;
    }

    const stimArr = new Float32Array(ELECTRODE_DATA.length);
    const colR = new Float32Array(ELECTRODE_DATA.length);
    const colG = new Float32Array(ELECTRODE_DATA.length);
    const colB = new Float32Array(ELECTRODE_DATA.length);

    for (let e = 0; e < ELECTRODE_DATA.length; e++) {
      const id = ELECTRODE_DATA[e].id;
      stimArr[e] = this.channelStim[id] || 0;
      const c = this.channelTargetColor[id];
      colR[e] = c.r;
      colG[e] = c.g;
      colB[e] = c.b;
    }

    const numVerts = this.vertices.length;
    const nodePosArr = this.nodeGeometry.attributes.position.array;
    const nodeColArr = this.nodeGeometry.attributes.color.array;

    // 흰 배경 위에서 차분한 쿨 슬레이트-블루 기본 신경망 색상 (#94a3b8 ~ #64748b)
    const baseR = 0.56, baseG = 0.64, baseB = 0.74;

    for (let i = 0; i < numVerts; i++) {
      const v = this.vertices[i];
      const bp = v.basePos;

      let ex = bp.x, ey = bp.y, ez = bp.z;
      if (this.explodeFactor > 0.001) {
        if (v.part === "cerebrum") {
          ex += v.hemi * this.explodeFactor * 0.42;
          ey += this.explodeFactor * 0.12;
        } else if (v.part === "cerebellum") {
          ex += v.hemi * this.explodeFactor * 0.22;
          ey -= this.explodeFactor * 0.25;
          ez -= this.explodeFactor * 0.32;
        } else if (v.part === "brainstem") {
          ey -= this.explodeFactor * 0.45;
        }
      }
      v.pos.set(ex, ey, ez);

      const i3 = i * 3;
      nodePosArr[i3] = ex;
      nodePosArr[i3 + 1] = ey;
      nodePosArr[i3 + 2] = ez;

      const c1 = this.vertNearestCh1[i];
      const w1 = this.vertWeight1[i];
      const c2 = this.vertNearestCh2[i];
      const w2 = this.vertWeight2[i];

      const s1 = stimArr[c1] * w1;
      const s2 = stimArr[c2] * w2;
      const stim = Math.min(1.0, s1 + s2);

      // 실비우스 고랑 등 주요 신경 줄기는 더 짙고 선명한 코발트 블루로 강조
      const ridgeBoost = v.ridgeBoost * 0.35;
      const pulse = 0.92 + 0.08 * Math.sin(elapsed * 2.6 - bp.z * 2.5);
      const blend = Math.min(1.0, (stim * 0.92 + ridgeBoost) * pulse);

      const dom = s1 >= s2 ? c1 : c2;
      const tr = colR[dom];
      const tg = colG[dom];
      const tb = colB[dom];

      nodeColArr[i3] = baseR * (1 - blend) + tr * blend;
      nodeColArr[i3 + 1] = baseG * (1 - blend) + tg * blend;
      nodeColArr[i3 + 2] = baseB * (1 - blend) + tb * blend;
    }

    this.nodeGeometry.attributes.position.needsUpdate = true;
    this.nodeGeometry.attributes.color.needsUpdate = true;

    const linePosArr = this.lineGeometry.attributes.position.array;
    const lineColArr = this.lineGeometry.attributes.color.array;
    const edges = this.edgeIndices;
    const numEdges = edges.length / 2;

    for (let e = 0; e < numEdges; e++) {
      const a = edges[e * 2];
      const b = edges[e * 2 + 1];
      const a3 = a * 3;
      const b3 = b * 3;
      const e6 = e * 6;

      linePosArr[e6] = nodePosArr[a3];
      linePosArr[e6 + 1] = nodePosArr[a3 + 1];
      linePosArr[e6 + 2] = nodePosArr[a3 + 2];
      linePosArr[e6 + 3] = nodePosArr[b3];
      linePosArr[e6 + 4] = nodePosArr[b3 + 1];
      linePosArr[e6 + 5] = nodePosArr[b3 + 2];

      lineColArr[e6] = nodeColArr[a3];
      lineColArr[e6 + 1] = nodeColArr[a3 + 1];
      lineColArr[e6 + 2] = nodeColArr[a3 + 2];
      lineColArr[e6 + 3] = nodeColArr[b3];
      lineColArr[e6 + 4] = nodeColArr[b3 + 1];
      lineColArr[e6 + 5] = nodeColArr[b3 + 2];
    }

    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.attributes.color.needsUpdate = true;

    const tempV = new THREE.Vector3();
    ELECTRODE_DATA.forEach((el) => {
      const entry = this.electrodeMap[el.id];
      if (!entry) return;

      const bp = entry.basePos;
      const hemiDir = el.hemisphere === "Left" ? -1 : el.hemisphere === "Right" ? 1 : 0;
      entry.group.position.set(
        bp.x + hemiDir * this.explodeFactor * 0.42,
        bp.y + this.explodeFactor * 0.14,
        bp.z
      );

      const visible = this.showAll16Electrodes || el.isCore8 || this.visualMode === "NOISE_HIGHLIGHT";
      entry.group.visible = visible;

      const stim = this.channelStim[el.id] || 0.1;
      const isSelected = this.selectedElectrodeId === el.id;
      const targetCol = this.channelTargetColor[el.id];

      entry.mesh.material.color.copy(targetCol);
      entry.ring.material.color.copy(targetCol);

      const scale = isSelected ? 1.35 : 0.8 + stim * 0.35;
      entry.mesh.scale.setScalar(scale);
      entry.ring.scale.setScalar(scale * 1.15);
      entry.ring.material.opacity = isSelected ? 0.85 : 0.2 + stim * 0.45;

      const labelEl = this.labelElements[el.id];
      if (labelEl) {
        if (!visible) {
          labelEl.style.display = "none";
          return;
        }
        entry.group.getWorldPosition(tempV);
        const camDist = tempV.distanceTo(this.camera.position);
        tempV.project(this.camera);

        if (tempV.z > 1.0 || camDist > 5.4) {
          labelEl.style.opacity = "0.2";
        } else {
          labelEl.style.opacity = stim > 0.5 || isSelected ? "0.98" : "0.55";
        }

        const x = (tempV.x * 0.5 + 0.5) * this.width;
        const y = (-tempV.y * 0.5 + 0.5) * this.height;
        labelEl.style.display = "inline-flex";
        labelEl.style.transform = `translate(-50%, -135%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        labelEl.classList.toggle("active-stim", stim > 0.65);
        labelEl.classList.toggle("selected", isSelected);
      }
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
