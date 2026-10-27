# Shelter Mind — 3D Neural Plexus Atlas & Adaptive MI-BCI

> **국립부경대학교 컴퓨터·인공지능공학부 캡스톤디자인**  
> 8채널 적응형 운동상상 뇌파(MI-BCI) 연구 스토리텔링, 5종 개별 분류기 벤치마크, 3D 신경망 브레인 메쉬 아틀라스 및 Shelter Mind 실시간 게임 연동 쇼케이스
>
> 🌐 **Live Web Demo**: [https://yj2da.github.io/bci-brain-atlas/](https://yj2da.github.io/bci-brain-atlas/)

---

## 🔬 연구 개요 (Research Overview)

본 프로젝트는 두피 뇌파(EEG) 기반 생존 의사결정 게임 **Shelter Mind**와 2,624회 실측 트라이얼 기반 **통합 8채널(`T8, T7, C4, C3, F7, Cz, P7, F3`) 적응형 운동상상(MI-BCI) 연구 성과**를 인터랙티브 3D 뇌 신경망 메쉬(Triangulated Neural Plexus Wireframe + Vertex Nodes)로 시각화한 결과 사이트입니다.

기존 16채널 고차원 비선형 파이프라인(420D RBF SVM)의 소표본 과적합과 임피던스 드리프트 한계를 극복하고, **초경량 선형 모델(4D Shrinkage LDA)**, **피험자별 맞춤형 BundleRuntime**, **4중 안전 관문(4-Safety-Gate) 파인튜닝**, **하드웨어 단락 리매핑**을 통해 실시간 온라인 제어 성공률 **96.9% (698/720)**를 달성한 전 과정을 체계적으로 증명합니다.

---

## 🧠 핵심 기능 및 탭 구성 (Core Features)

### 1. Classifiers & Pipeline (5종 개별 분류기 & 핵심 연구 아키텍처)
분류기나 피험자 번들을 선택하면 **중앙 3D 뇌 메쉬에 해당 모델의 공간 필터 및 전극 가중치가 즉시 점등**되며 최적 관측 각도로 비행합니다.
- **5종 개별 분류기 벤치마크**:
  1. **Shrinkage LDA (`lsqr`, `auto`) — 주력 2세대 모델**:
     - `8–13Hz Mu SOS` → `Channel-wise p1–p99 Clipping` → `CSP (4D, reg=0.05)` → `MinMaxScaler (0–1)` → `Shrinkage LDA`
     - 420차원 대비 모델 크기 **99.5% 경량화 (`2.06MB → 10.8KB`)**, 당일 재학습 **0.01초**, OYJ 7Ch LOSO AUC **0.6002**, WMJ 5Ch AUC **0.7985 / F1 0.7200**.
  2. **Platt-Scaled RBF / Linear SVM — 실시간 온라인 검증 모델**:
     - 14세션 온라인 실시간 제어 평균 정확도 **96.9% (`698/720`)**, 4중 안전 관문 파인튜닝 시 OOF AUC **0.35 → 0.95** 도약.
  3. **Riemannian Tangent Space + LDA — 공분산 다양체 기하 모델**:
     - `OAS Covariance` → 자체 `EnsureSPD` 수치 안정성 보장 → 리만 다양체 접공간(Tangent Space) 사영 → 선형 판별. `KHY` 참가자 번들에 적용.
  4. **Random Forest Ensemble — 2,624 트라이얼 비선형 중요도 검증기**:
     - 단변량 통계(FDR #16)에서 누락될 뻔한 좌반구 일차운동피질 **`C3`가 트리 앙상블 중요도 전체 3위(`0.0795`)**임을 규명하여 8채널 필수 채택 근거 확립.
  5. **L2 Logistic Regression / PSD Ridge — 주파수 파워 선형 기준선**:
     - 72개 하이퍼파라미터 그리드 서치에서 LOSO AUC **0.5988**을 기록하며 '정제된 특징 위의 단순 선형 분류기가 최선'임을 교차 검증.
- **피험자별 맞춤형 `.joblib` 번들 (`BundleRuntime`)**:
  - `OYJ (예진 7CH)`, `WMJ (민지 5CH)`, `KHY (희영 6CH)` 각 피험자의 고유 생체 특성에 맞춘 채널과 분류기 프로필을 동적 로드.
- **3-Subtab 연구 인스펙터**:
  - `Individual Classifier Spec`: 신호처리 파이프라인 흐름도, 수학 결정식, scikit-learn 코드 명세, 강점/한계.
  - `420D SVM vs 4D LDA Scaling`: 1세대(420D) vs 2세대(4D) 10개 지표 정량 비교표.
  - `Core Research & Safety Gate`: 5단계 프로토콜 진화, 10/06 세션 임계값 `0.194` 붕괴 수학적 디버깅, 4-Safety-Gate 검증 규칙.

### 2. Research Scroll (스크롤 연구 스토리텔링)
스크롤에 맞춰 3D 뇌 메쉬의 시점과 색상이 전환되며 연구의 논리적 흐름을 보여줍니다.
- **Step 01**: 420D 고차원 SVM에서 4D 초경량 Shrinkage LDA로의 모델 스케일링
- **Step 02**: EOG(Fp1/2)·VEP(O1/2) 잡음 제거 및 다인 피험자 통합 8채널 확정
- **Step 03**: 왼손 운동 상상(`LEFT MI`) 시 우반구 감각운동 피질(`C4`, `T8`) ERD 점등
- **Step 04**: 오른손 운동 상상(`RIGHT MI`) 시 좌반구 네트워크(`C3`, `T7`, `F3`, `P7`) ERD 점등
- **Step 05**: 4중 안전 관문 파인튜닝, 임계값 가드레일, 1~8번 물리 포트 리매핑 복원

### 3. Atlas Explorer (3D 뇌 해부학 & 전극 인스펙터)
- 3D 뇌 위의 10-20 시스템 전극 노드를 클릭하거나 영역별(`All 16Ch`, `Core 8Ch`, `Excluded`)로 필터링.
- 실측 종합 점수(**Composite Score**), **ROC-AUC**, **Random Forest 기여도**, **Mu 파워 차이(dB)** 및 물리 포트 매핑 확인.
- 하단 컨트롤 독의 **Explode 슬라이더**로 대뇌 좌/우반구, 소뇌, 뇌간을 공간적으로 분해하여 관찰 가능.

### 4. Live Telemetry & Report (실측 뇌파 리플레이 & Unity 연동)
- 실측 뇌파(`ExG.csv`) 데이터를 슬라이딩 윈도우로 재생하며 3D 뇌 메쉬와 **Unity 게임(`Shelter Mind`, TCP `:5000`)**에 동시 패킷 스트리밍.
- 실시간 `C3 / C4` 오실로스코프 파형, Dynamic Fading 레벨, 턴별 의사결정 로그 및 14세션 온라인 벤치마크 테이블 제공.

---

## 📁 저장소 구조 (Repository Structure)

```text
bci-brain-atlas/
├── index.html                  # GitHub Pages 배포용 Standalone 3D 뇌 아틀라스 엔트리
├── styles.css                  # Clean White 미니멀 Light Mode UI 스타일시트
├── app.js                      # 모듈형 아틀라스 애플리케이션 컨트롤러
├── brain_atlas_3d.js           # Three.js 기반 3D Triangulated Neural Plexus Brain 엔진
├── brain_data.js               # 5종 분류기, 모델 비교표, 번들, 2,624 Trials 채널 지표 데이터
├── web/                        # 로컬 웹 서버 호스팅용 웹 에셋 디렉토리
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── brain_atlas_3d.js
│   └── brain_data.js
├── real_eeg_replay_server.py   # 실측 EEG 슬라이딩 재생 서버 (Unity TCP :5000 + Web HTTP :8080)
├── run_replay_bridge.ps1       # Python 미설치 환경용 PowerShell 네이티브 TCP/Web 브릿지
└── run_capstone_showcase.bat   # 원클릭 쇼케이스 실행 배치 파일 (Windows)
```

---

## 🚀 실행 방법 (Getting Started)

### 1. 웹 브라우저에서 바로 확인 (설치 불필요)
- 배포 주소: [https://yj2da.github.io/bci-brain-atlas/](https://yj2da.github.io/bci-brain-atlas/)
- 브라우저에서 `index.html`을 직접 열어도 내장된 실측 뇌파 시뮬레이터를 통해 모든 3D 시각화와 분류기 탐색 기능이 즉시 동작합니다.

### 2. Unity 게임(`Shelter Mind`)과 실시간 TCP 소켓 연동
1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/yj2da/bci-brain-atlas.git
   cd bci-brain-atlas
   ```
2. Python 환경에서 리플레이 서버를 실행합니다:
   ```bash
   python real_eeg_replay_server.py
   ```
   *(또는 Windows에서 `run_capstone_showcase.bat` 더블클릭)*
3. 브라우저에서 `http://localhost:8080`에 접속하고 Unity에서 `Shelter Mind`를 실행하면 `127.0.0.1:5000` TCP 통신을 통해 실시간 뇌파 제어가 동기화됩니다.

---

## 📊 정량적 연구 성과 요약 (Key Achievements)

| 평가 항목 | 구형 모델 (Gen-1) | 신형 모델 (Gen-2) | 연구 성과 및 의의 |
| :--- | :--- | :--- | :--- |
| **특징 공간 차원** | 420차원 (FBRiemann+CSP) | **4차원 (CSP n=4)** | 차원의 저주 해소, 소표본 과적합 방지 |
| **개별 분류기** | RBF SVM (C=1.5, Platt) | **Shrinkage LDA (`lsqr`)** | 0.01초 만에 당일 캘리브레이션 수렴 |
| **모델 번들 용량** | 2,064 KB (2.06 MB) | **10.8 KB** | **99.5% 용량 경량화**, 실시간 스트리밍 최적화 |
| **전극 채널 구성** | 16채널 풀캡 (노이즈 포함) | **통합 8채널 (T8, C4, Cz ...)** | 착용 준비 시간 20분 → 5분 단축, EOG/VEP 잡음 원천 배제 |
| **온라인 실시간 성공률** | - | **96.9% (698 / 720 Trials)** | 14개 세션 장기 연속 실시간 제어 실증 |
| **안전 관문 파인튜닝** | 고정 오프라인 가중치 | **4-Safety-Gate Head FT** | OOF AUC **0.35 → 0.95** 도약 및 Fail-safe 보장 |
| **하드웨어 포트 복원** | 9~16번 합선 시 사용 불가 | **1~8번 리매핑 맵핑 테이블** | 핵심 1위 T8, 2위 C4 전극 100% 정상 복구 |
