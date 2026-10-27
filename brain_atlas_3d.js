/**
 * brain_atlas_3d.js
 * =================
 * 레퍼런스 이미지 스타일의 3D Triangulated Neural Plexus Wireframe Brain Mesh 엔진
 * - 무작위 분사 점(Random Scatter)을 완전히 배제하고,
 *   대뇌(전두엽·두정엽·후두엽·측두엽), 실비우스 고랑 신경 다발, 소뇌, 뇌간의
 *   해부학적 꼭짓점(Vertex Dots)과 삼각형 와이어프레임(Triangulated Plexus Edges)으로 구성.
 * - 스크롤 및 전극 클릭에 따라 자극 부위의 메쉬 선(Edge)과 꼭짓점(Dot)이 색칠됨.
 */

import * as THREE from "https://esm.sh/three@0.160.0";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { ELECTRODE_DATA } from "./brain_data.js";

export class BrainAtlas3D {
  constructor(canvasContainer, labelContainer, onSelectElectrode) {
    this.container = canvasContainer;
    this.labelContainer = labelContainer;
    this.onSelectElectrode = onSelectElectrode;

    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
    // 레퍼런스 이미지와 같은 측면-사선(3/4 Lateral View) 각도에서 뇌 실루엣이 가장 잘 보이도록 설정
    this.camera.position.set(3.45, 0.45, 2.35);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 6.8;
    this.controls.target.set(0, -0.05, 0);

    this.targetCameraPos = new THREE.Vector3(3.45, 0.45, 2.35);
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
      this.channelStim[el.id] = el.isCore8 ? 0.55 : 0.15;
      this.channelTargetColor[el.id] = new THREE.Color("#38bdf8");
    });

    this.brainGroup = new THREE.Group();
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

    const grad = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
    grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.35, "rgba(180, 225, 255, 0.95)");
    grad.addColorStop(0.7, "rgba(59, 130, 246, 0.35)");
    grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    this.nodeTexture = new THREE.CanvasTexture(canvas);
  }

  /**
   * 해부학적 대뇌 반구(전두엽·두정엽·후두엽·측두엽), 실비우스 고랑 신경 트랙, 소뇌, 뇌간의
   * 꼭짓점(Vertices)과 삼각형 플렉서스 와이어프레임(Triangulated Plexus Wireframe) 생성
   */
  _buildAnatomicalPlexusBrain() {
    const vertices = []; // { pos: Vector3, basePos: Vector3, hemi: -1|0|1, part: string, ridgeBoost: number }

    // 1) 대뇌 좌/우 반구 외피 및 내피 (Cerebral Cortex Outer & Inner Sub-surface Layer)
    // 피보나치 격자 + 해부학적 프로파일 조형으로 균일한 삼각망 생성
    const createCerebralVertices = (countPerHemi, layerScale, isInner) => {
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      for (const hemi of [-1, 1]) {
        for (let i = 0; i < countPerHemi; i++) {
          const t = (i + 0.5) / countPerHemi;
          const phi = Math.acos(1 - 2 * t);
          const theta = (2 * Math.PI * i) / goldenRatio;

          // 구면 단위 벡터 (ux: 외측, uy: 상하, uz: 전후 [+z가 전두엽 앞쪽])
          let ux = Math.abs(Math.sin(phi) * Math.cos(theta));
          let uy = Math.cos(phi);
          let uz = Math.sin(phi) * Math.sin(theta);

          // 해부학적 대뇌 측면 실루엣 프로파일링 (레퍼런스 이미지 형태 완벽 재현)
          // 앞쪽(+z): 전두엽(Frontal Lobe) 둥근 돌출, 뒤쪽(-z): 후두엽(Occipital Lobe) 돌출
          let zLen = uz >= 0 ? 1.34 : 1.38;
          let yHeight = 1.02;

          // 전두엽 앞쪽 상단-하단 곡률
          if (uz > 0.25) {
            yHeight *= 0.96 - Math.pow( Math.max(0, uz - 0.35), 1.6 ) * 0.28;
          }
          // 후두엽 뒤쪽 하단 들어올림 (소뇌 공간 확보)
          if (uz < -0.2 && uy < 0.1) {
            uy = uy * 0.55 + 0.18 * Math.abs(uz);
          }

          // 바닥면 평탄화 및 측두엽(Temporal Lobe) 하방·전방 돌출 조형
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

          // 대뇌종열(중심 갈라짐) 간격 유지 및 좌우 폭
          let xWidth = (ux * 0.88 + 0.07 + temporalBulgeX);

          // 실비우스 고랑(Sylvian Fissure / Lateral Sulcus) & 중심고랑(Central Sulcus) 굴곡 및 밀집도
          const sylvianDist = Math.abs((uy + 0.08) - 0.32 * uz);
          const centralDist = Math.abs(uz - (-0.05 + 0.18 * uy));
          const isSylvianRidge = ux > 0.35 && uz > -0.45 && uz < 0.55 && sylvianDist < 0.16;
          const isCentralRidge = uy > 0.15 && centralDist < 0.14;

          // 폴리곤 표면의 로우폴리 각진 주름(Faceted Cortical Gyri) 변조
          const facetNoise =
            Math.sin(ux * 9.5 + uz * 7.2 + i * 0.1) *
            Math.cos(uy * 8.8 - uz * 6.4) *
            (isInner ? 0.025 : 0.042);

          let x = hemi * (xWidth + facetNoise * 0.7) * layerScale;
          let y = (uy * yHeight + temporalDropY + 0.22 + facetNoise) * layerScale;
          let z = (uz * zLen + facetNoise) * layerScale;

          // 실비우스 고랑 라인으로 정점들을 살짝 끌어당겨 레퍼런스 이미지의 빛나는 대각선 신경줄기 형성
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

    // 외피(460 * 2 = 920 정점) + 내부 코어 시냅스 층(150 * 2 = 300 정점)
    createCerebralVertices(460, 1.0, false);
    createCerebralVertices(150, 0.76, true);

    // 2) 소뇌 (Cerebellum - 후하단 둥근 엽 구조)
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
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

    // 3) 뇌간 (Brainstem - 레퍼런스 이미지 하단의 날렵한 기둥 메쉬)
    const stemRings = 9;
    const stemSegs = 12;
    for (let r = 0; r < stemRings; r++) {
      const v = r / (stemRings - 1); // 0(위쪽 다리뇌) -> 1(아래쪽 척수 연결부)
      const radiusX = 0.22 * (1.0 - v * 0.48);
      const radiusZ = 0.20 * (1.0 - v * 0.45);
      // 다리뇌(Pons) 앞쪽 볼록함 및 아래로 내려갈수록 뒤로 살짝 꺾이는 형태
      const centerZ = -0.18 - v * 0.22 + Math.sin(v * Math.PI) * 0.06;
      const centerY = -0.22 - v * 0.68;

      for (let s = 0; s < stemSegs; s++) {
        const ang = (s / stemSegs) * Math.PI * 2;
        const jitter = (Math.sin(r * 3.1 + s * 2.7) * 0.015);
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

    // 각 정점마다 가장 가까운 전극 2개 및 가중치 매핑
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

    // 4) 삼각형 플렉서스 엣지 네트워크 구축 (K-Nearest Neighbors Triangulation)
    // 각 정점에서 같은 반구(또는 인접 구조)의 가장 가까운 5~6개 정점을 연결하여
    // 레퍼런스 이미지와 완전히 동일한 삼각형 와이어프레임 그물망 생성
    const edgePairs = [];
    const edgeSet = new Set();

    for (let i = 0; i < numVerts; i++) {
      const vi = vertices[i];
      const candidates = [];

      for (let j = 0; j < numVerts; j++) {
        if (i === j) continue;
        const vj = vertices[j];
        // 좌/우 대뇌 반구끼리는 중심부(뇌량 Corpus Callosum) 외에는 무분별하게 가로지르지 않도록 제한
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

    // 5) THREE.LineSegments (삼각형 신경망 와이어프레임) 생성
    const linePositions = new Float32Array(numEdges * 6);
    const lineColors = new Float32Array(numEdges * 6);

    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    this.lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    this.lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.46,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.plexusLines = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    this.brainGroup.add(this.plexusLines);

    // 6) THREE.Points (삼각망 꼭짓점 Vertex Dots) 생성
    const nodePositions = new Float32Array(numVerts * 3);
    const nodeColors = new Float32Array(numVerts * 3);

    this.nodeGeometry = new THREE.BufferGeometry();
    this.nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    this.nodeGeometry.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));

    this.nodeMaterial = new THREE.PointsMaterial({
      size: 0.042,
      map: this.nodeTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.plexusNodes = new THREE.Points(this.nodeGeometry, this.nodeMaterial);
    this.brainGroup.add(this.plexusNodes);
  }

  /**
   * 16채널 전극 마커 및 미니멀 2D 태그 생성
   */
  _buildElectrodeNodes() {
    this.electrodeGroup = new THREE.Group();
    this.brainGroup.add(this.electrodeGroup);

    const sphereGeo = new THREE.SphereGeometry(0.036, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.052, 0.068, 24);

    ELECTRODE_DATA.forEach((el) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...el.pos);

      const baseColor = el.isCore8 ? 0x60a5fa : 0x475569;
      const mat = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: el.isCore8 ? 0.95 : 0.4
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.userData = { electrodeId: el.id, data: el };
      nodeGroup.add(mesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: el.isCore8 ? 0.5 : 0.15,
        blending: THREE.AdditiveBlending
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

  /**
   * 시각 모드(스크롤 단계 또는 프리셋 버튼)에 따라 각 영역의 메쉬/Dot 하이라이트 색상 지정
   */
  applyVisualMode(mode) {
    this.visualMode = mode;

    // 레퍼런스 이미지의 아이스 블루/코발트 기본 톤과 조화로운 하이라이트 팔레트
    const iceCyan = new THREE.Color("#38bdf8");
    const brightWhiteBlue = new THREE.Color("#e0f2fe");
    const coralRose = new THREE.Color("#fb7185");
    const amberGold = new THREE.Color("#fbbf24");
    const emerald = new THREE.Color("#34d399");
    const deepCobalt = new THREE.Color("#1d4ed8");

    ELECTRODE_DATA.forEach((el) => {
      if (mode === "OVERVIEW_ALL") {
        // 레퍼런스 사진과 100% 동일한 클래식 코발트/아이스블루 신경망 룩
        this.channelStim[el.id] = el.isCore8 ? 0.62 : 0.35;
        this.channelTargetColor[el.id] = el.isCore8 ? iceCyan : deepCobalt;
      } else if (mode === "NOISE_HIGHLIGHT") {
        const isNoise = ["Fp1", "Fp2", "O1", "O2", "P8", "F8"].includes(el.id);
        this.channelStim[el.id] = isNoise ? 0.98 : 0.12;
        this.channelTargetColor[el.id] = isNoise ? coralRose : deepCobalt;
      } else if (mode === "CORE_8CH") {
        this.channelStim[el.id] = el.isCore8 ? 0.92 : 0.08;
        this.channelTargetColor[el.id] = el.isCore8 ? brightWhiteBlue : deepCobalt;
      } else if (mode === "STIM_LEFT_MI") {
        // 왼손 운동 상상 -> 우반구(C4, T8, Cz) 메쉬 집중 점등
        const isRightActive = ["T8", "C4", "Cz"].includes(el.id);
        this.channelStim[el.id] = el.id === "T8" || el.id === "C4" ? 1.0 : el.id === "Cz" ? 0.72 : 0.08;
        this.channelTargetColor[el.id] = isRightActive ? iceCyan : deepCobalt;
      } else if (mode === "STIM_RIGHT_MI") {
        // 오른손 운동 상상 -> 좌반구(C3, T7, F3, F7, P7, Cz) 메쉬 집중 점등
        const isLeftActive = ["C3", "T7", "F3", "F7", "P7", "Cz"].includes(el.id);
        this.channelStim[el.id] = ["C3", "T7", "F3"].includes(el.id) ? 1.0 : isLeftActive ? 0.82 : 0.08;
        this.channelTargetColor[el.id] = isLeftActive ? amberGold : deepCobalt;
      } else if (mode === "REMAPPING_RECOVERY") {
        const isRemapped = ["T8", "C4", "Cz", "P7"].includes(el.id);
        this.channelStim[el.id] = isRemapped ? 1.0 : el.isCore8 ? 0.55 : 0.08;
        this.channelTargetColor[el.id] = isRemapped ? emerald : el.isCore8 ? iceCyan : deepCobalt;
      }
    });
  }

  updateLiveActivations(channelActivations) {
    if (this.visualMode !== "LIVE_SYNC") return;
    const iceCyan = new THREE.Color("#38bdf8");
    const amberGold = new THREE.Color("#fbbf24");
    const emerald = new THREE.Color("#34d399");

    ELECTRODE_DATA.forEach((el) => {
      const act = channelActivations?.[el.id] ?? 0.18;
      this.channelStim[el.id] = el.isCore8 ? act : act * 0.25;
      if (el.hemisphere === "Right") this.channelTargetColor[el.id] = iceCyan;
      else if (el.hemisphere === "Left") this.channelTargetColor[el.id] = amberGold;
      else this.channelTargetColor[el.id] = emerald;
    });
  }

  selectElectrode(electrodeId, flyCamera = false) {
    this.selectedElectrodeId = electrodeId;
    const targetEntry = this.electrodeMap[electrodeId];
    if (!targetEntry) return;
    const elData = targetEntry.data;

    if (this.visualMode === "ATLAS_EXPLORER") {
      const activeCol = elData.isCore8 ? new THREE.Color("#38bdf8") : new THREE.Color("#fb7185");
      const dimCol = new THREE.Color("#1d4ed8");

      ELECTRODE_DATA.forEach((el) => {
        if (el.id === electrodeId) {
          this.channelStim[el.id] = 1.0;
          this.channelTargetColor[el.id] = activeCol;
        } else if (el.region === elData.region) {
          this.channelStim[el.id] = 0.65;
          this.channelTargetColor[el.id] = activeCol;
        } else {
          this.channelStim[el.id] = 0.10;
          this.channelTargetColor[el.id] = dimCol;
        }
      });
    }

    if (flyCamera) {
      const pos = new THREE.Vector3(...elData.pos);
      const camTarget = pos.clone().normalize().multiplyScalar(3.8);
      camTarget.y = Math.max(0.25, camTarget.y + 0.25);
      if (Math.abs(camTarget.x) < 0.8) camTarget.x = elData.hemisphere === "Left" ? -2.2 : 2.2;
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

    // 채널 자극 상태 캐싱
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

    // 정점(Vertices) 위치(Explode 반영) 및 색상 계산
    const numVerts = this.vertices.length;
    const nodePosArr = this.nodeGeometry.attributes.position.array;
    const nodeColArr = this.nodeGeometry.attributes.color.array;

    // 기본 코발트 블루 베이스 컬러 (레퍼런스 사진의 딥 블루 신경망 색상)
    const baseR = 0.09, baseG = 0.24, baseB = 0.68;

    for (let i = 0; i < numVerts; i++) {
      const v = this.vertices[i];
      const bp = v.basePos;

      // Explode 슬라이더 적용 시 좌반구, 우반구, 소뇌, 뇌간이 해부학적으로 분리됨
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

      // 실비우스 고랑 등 주요 신경 줄기는 레퍼런스 이미지처럼 더 밝은 시안-화이트 하이라이트 부여
      const ridgeGlow = v.ridgeBoost * 0.42;
      const pulse = 0.90 + 0.10 * Math.sin(elapsed * 2.6 - bp.z * 2.5);
      const intensity = Math.min(1.2, (stim * 0.95 + ridgeGlow) * pulse);

      const dom = s1 >= s2 ? c1 : c2;
      const tr = colR[dom];
      const tg = colG[dom];
      const tb = colB[dom];

      nodeColArr[i3] = baseR * (1 - intensity * 0.7) + tr * intensity + ridgeGlow * 0.35;
      nodeColArr[i3 + 1] = baseG * (1 - intensity * 0.6) + tg * intensity + ridgeGlow * 0.45;
      nodeColArr[i3 + 2] = baseB * (1 - intensity * 0.5) + tb * intensity + ridgeGlow * 0.55;
    }

    this.nodeGeometry.attributes.position.needsUpdate = true;
    this.nodeGeometry.attributes.color.needsUpdate = true;

    // 삼각형 와이어프레임 선분(LineSegments) 정점/색상 동기화
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

    // 전극 마커 및 2D 라벨 업데이트
    const tempV = new THREE.Vector3();
    ELECTRODE_DATA.forEach((el) => {
      const entry = this.electrodeMap[el.id];
      if (!entry) return;

      // Explode 연동
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
      entry.ring.material.opacity = isSelected ? 0.9 : 0.2 + stim * 0.5;

      const labelEl = this.labelElements[el.id];
      if (labelEl) {
        if (!visible) {
          labelEl.style.display = "none";
          return;
        }
        entry.group.getWorldPosition(tempV);
        const camDist = tempV.distanceTo(this.camera.position);
        tempV.project(this.camera);

        if (tempV.z > 1.0 || camDist > 4.9) {
          labelEl.style.opacity = "0.15";
        } else {
          labelEl.style.opacity = stim > 0.5 || isSelected ? "0.95" : "0.45";
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
