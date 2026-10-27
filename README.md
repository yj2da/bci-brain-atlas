# Shelter Mind — 3D Neural Plexus Atlas & Adaptive MI-BCI

> **국립부경대학교 컴퓨터·인공지능공학부 캡스톤디자인 (팀 영크크)**  
> 8채널 적응형 운동상상 뇌파(MI-BCI) 연구 스토리텔링, 3D 신경망 브레인 메쉬 아틀라스 및 Shelter Mind 실시간 게임 연동 쇼케이스

---

## 주요 구성 (Overview)

본 저장소는 뇌파(EEG) 기반 생존 의사결정 게임 **Shelter Mind**와 2,624회 실측 트라이얼 기반 **통합 8채널(`T8, T7, C4, C3, F7, Cz, P7, F3`) MI-BCI 연구 성과**를 인터랙티브 3D 뇌 신경망 메쉬(Triangulated Neural Plexus Wireframe + Vertex Nodes)로 시각화한 웹 아틀라스 및 실시간 리플레이 브릿지 서버입니다.

### 1. Research Scroll (스크롤 연구 스토리텔링)
- 스크롤 진행에 따라 3D 뇌 메쉬가 회전·포커싱되며 단계별 연구 결과를 시각적으로 재현합니다.
  - **Step 01**: 16채널 풀캡의 안구 잡음(`Fp1, Fp2`) 및 단순 시각 반응(`O1, O2`) 아티팩트 제거
  - **Step 02**: 다인 피험자 교차 분석 기반 최종 통합 8채널(`T8, T7, C4, C3, F7, Cz, P7, F3`) 도출
  - **Step 03**: 왼손 운동 상상(`LEFT MI`) 시 반대측 우반구 감각운동 피질(`C4`) 및 우측 측두엽(`T8`) 활성화
  - **Step 04**: 오른손 운동 상상(`RIGHT MI`) 시 좌반구 네트워크(`C3 · T7 · F3 · P7`) 활성화
  - **Step 05**: 4중 안전 관문(Safety-Gated Fine-Tuning) 및 하드웨어 포트 리매핑 복원 검증

### 2. Atlas Explorer (3D 뇌 해부학 & 전극 인스펙터)
- 3D 뇌 위의 10-20 시스템 전극 마커를 직접 클릭하거나 해부학적 영역별로 필터링하여 탐색합니다.
- 선택된 전극의 해부학적 기능, 실측 **Composite Score**, **Single-Channel ROC-AUC**, **Random Forest 기여도**, **좌/우 Mu 대역 파워 차이(dB)** 및 하드웨어 리매핑 정보를 확인합니다.
- 하단 컨트롤 독의 **Explode 슬라이더**를 통해 좌반구·우반구·소뇌·뇌간 구조를 공간적으로 분해하여 관찰할 수 있습니다.

### 3. Live Telemetry & Report (실측 뇌파 리플레이 & Unity 게임 연동)
- 수집된 실측 뇌파(`ExG.csv`) 데이터를 250Hz 슬라이딩 윈도우로 실시간 추론하여 3D 뇌 메쉬와 **Unity 게임(`Shelter Mind`, TCP `127.0.0.1:5000`)**을 동시에 구동합니다.
- 실시간 `C3 / C4` 뇌파 오실로스코프 파형, Dynamic Fading 레벨, 턴별 의사결정 뇌 자극 로그 및 14개 온라인 세션(720 Trials, 평균 성공률 96.9%) 벤치마크 리포트를 제공합니다.

---

## 파일 구조 (Repository Structure)

```text
bci-brain-atlas/
├── index.html                  # 단독 실행 및 GitHub Pages 호환 3D 뇌 아틀라스 메인 엔트리
├── styles.css                  # 미니멀 다크 아틀라스 UI 스타일시트
├── app.js                      # 스크롤 스토리텔링, 인스펙터, 실시간 텔레메트리 컨트롤러
├── brain_atlas_3d.js           # Three.js 기반 3D Triangulated Neural Plexus Brain 엔진
├── brain_data.js               # 2,624 Trials 실측 채널 중요도 및 14개 온라인 세션 데이터셋
├── web/                        # 로컬 Python HTTP 서버 호스팅용 동일 웹 에셋 디렉토리
├── real_eeg_replay_server.py   # 실측 EEG 슬라이딩 재생 서버 (Unity TCP :5000 + Web HTTP :8080)
├── run_replay_bridge.ps1       # Python 미설치 환경을 위한 PowerShell 네이티브 TCP/Web 브릿지
└── run_capstone_showcase.bat   # 원클릭 쇼케이스 실행 스크립트 (Windows)
```

---

## 실행 방법 (Getting Started)

### 방법 1. 웹 브라우저에서 바로 열기 (설치 불필요)
- GitHub Pages 배포 링크에 접속하거나, 로컬에서 `index.html` 파일을 더블클릭하면 별도의 백엔드 없이도 내장된 실측 리플레이 엔진을 통해 3D 뇌 아틀라스의 모든 기능이 즉시 작동합니다.

### 방법 2. Unity 게임(`Shelter Mind`)과 실시간 TCP 연동 실행
1. Windows 환경에서 `run_capstone_showcase.bat`를 더블클릭하거나 아래 명령어를 실행합니다:
   ```bash
   python real_eeg_replay_server.py
   ```
2. 브라우저에서 `http://localhost:8080` 접속 후, Unity에서 `Shelter Mind`를 실행하면 `127.0.0.1:5000` TCP 소켓을 통해 실시간 뇌파 판정 패킷이 동기화됩니다.
