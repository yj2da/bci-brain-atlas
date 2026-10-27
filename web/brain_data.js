/**
 * brain_data.js
 * ==============
 * 국립부경대학교 캡스톤디자인 팀 영크크 (Shelter Mind)
 * 실측 뇌파 연구 데이터 (2,624 Trials 채널 중요도, 다인 피험자 교차 분석, 14개 온라인 세션 성과,
 * 하드웨어 9~16번 포트 합선 리매핑, 해부학적 3D 좌표 및 스크롤 스토리텔링 정의)
 */

export const BRAIN_REGIONS = {
  sensorimotor: {
    id: "sensorimotor",
    nameKo: "중심 감각운동 피질 (Primary Sensorimotor Cortex)",
    nameEn: "Sensorimotor Cortex (Brodmann Area 4, 1-3)",
    color: "#00f0ff",
    role: "수의적 운동 상상(Motor Imagery) 시 반대측(Contralateral) 반구에서 가장 강력한 Mu(8-13Hz) 및 Beta(13-30Hz) 대역 사건관련 탈동기화(ERD)가 발생하는 핵심 중추입니다.",
    channels: ["C3", "Cz", "C4"]
  },
  temporal: {
    id: "temporal",
    nameKo: "양측 측두 연합 피질 (Temporal SMR Hub)",
    nameEn: "Superior & Middle Temporal Cortex",
    color: "#38bdf8",
    role: "본 연구의 2,624회 전수 분석에서 T8 채널이 전체 1위(Composite Score 78.34)를 기록하며 감각운동 리듬(SMR) 확산과 최고 수준의 좌/우 변별력을 입증한 핵심 허브입니다.",
    channels: ["T7", "T8"]
  },
  frontal: {
    id: "frontal",
    nameKo: "전두-전운동 네트워크 (Premotor & Frontal Planning)",
    nameEn: "Premotor & Dorsolateral Prefrontal Cortex",
    color: "#a855f7",
    role: "상상 동작의 기획(Motor Planning)과 의사결정 갈등(Cognitive Load)을 조율합니다. 안구 잡음(EOG)이 심한 전두극(Fp1, Fp2)은 배제하고 순수 운동 기획 영역(F3, F7)만 선별했습니다.",
    channels: ["F3", "F7", "F4", "F8", "Fp1", "Fp2"]
  },
  parietal: {
    id: "parietal",
    nameKo: "두정-체성감각 연합 피질 (Parietal Somatosensory)",
    nameEn: "Posterior Parietal & Somatosensory Association Cortex",
    color: "#10b981",
    role: "신체 공간 지각과 운동 상상의 감각 피드백을 통합합니다. 다인 교차 분석에서 희영 피험자의 변별 다면성을 보완하기 위해 좌측 두정부(P7)가 최종 8채널에 채택되었습니다.",
    channels: ["P7", "Pz", "P8"]
  },
  occipital: {
    id: "occipital",
    nameKo: "후두 시각 피질 (Primary Visual Cortex - 배제됨)",
    nameEn: "Occipital Visual Cortex (Excluded Noise Region)",
    color: "#ef4444",
    role: "화면의 카드 이동이나 시각 자극(Visual Cue)에만 반응하며, 순수 운동 상상 의도와 무관한 알파파 시각 왜곡을 유발하여 통합 8채널에서 원천 배제하였습니다.",
    channels: ["O1", "O2"]
  }
};

/**
 * 국제 10-20 시스템 16채널 상세 실측 데이터 (scratch/channel_importance_summary.csv 기반)
 * pos: 3D 뇌 모델 상의 정규화된 전극 좌표 [x(좌-우), y(상-하), z(전-후)]
 */
export const ELECTRODE_DATA = [
  {
    id: "T8",
    rank: 1,
    isCore8: true,
    hemisphere: "Right",
    region: "temporal",
    pos: [1.32, 0.05, 0.02],
    anatomicalName: "우측 측두엽 (Right Temporal Cortex)",
    compositeScore: 78.34,
    singleAuc: 0.570,
    fdr: 0.0223,
    rfImportance: 0.1385,
    muLeft: -26.80,
    muRight: -26.69,
    powerDiff: +0.113,
    stimSide: "LEFT_MI",
    portOriginal: "Port 11 (합선 고장)",
    portRemapped: "Port 5 (물리 리매핑 복원)",
    subjectLogic: "예진·민지 통합 1위 핵심 채널 (좌수 상상 시 우측 측두-운동 연합 ERD 최고 변별력)",
    description: "전체 16채널 중 압도적 1위(78.34점)를 기록한 최우선 핵심 전극입니다. 왼손 운동 상상 시 우반구 감각운동 피질과 연동하여 가장 강력한 주파수 변별력을 제공합니다."
  },
  {
    id: "C4",
    rank: 2,
    isCore8: true,
    hemisphere: "Right",
    region: "sensorimotor",
    pos: [0.86, 0.78, -0.02],
    anatomicalName: "우반구 일차감각운동피질 (Right Motor Cortex)",
    compositeScore: 40.42,
    singleAuc: 0.549,
    fdr: 0.0093,
    rfImportance: 0.1171,
    muLeft: -27.19,
    muRight: -27.09,
    powerDiff: +0.104,
    stimSide: "LEFT_MI",
    portOriginal: "Port 10 (합선 고장)",
    portRemapped: "Port 2 (물리 리매핑 복원)",
    subjectLogic: "왼손(LEFT) 운동 상상의 생리학적 직결 중추 (전체 중요도 2위)",
    description: "왼손을 움직이는 상상을 할 때 반대측인 우반구 C4 영역의 Mu/Beta파 진폭이 즉각 감쇄(ERD)합니다. 좌수 선택 판정의 핵심 기준점입니다."
  },
  {
    id: "Cz",
    rank: 3,
    isCore8: true,
    hemisphere: "Center",
    region: "sensorimotor",
    pos: [0.0, 1.12, -0.02],
    anatomicalName: "정수리 중심 감각운동피질 (Vertex Central Cortex)",
    compositeScore: 30.88,
    singleAuc: 0.522,
    fdr: 0.0020,
    rfImportance: 0.0451,
    muLeft: -26.09,
    muRight: -26.04,
    powerDiff: +0.052,
    stimSide: "BOTH",
    portOriginal: "Port 9 (합선 고장)",
    portRemapped: "Port 3 (물리 리매핑 복원)",
    subjectLogic: "민지 피험자 보완 & 좌/우 반구 공간 필터링(CSP/CAR)의 중심 영점 기준선",
    description: "좌반구(C3)와 우반구(C4) 정중앙에 위치하여 공간 필터(CSP)가 좌/우 대칭 대비를 계산할 때 흔들리지 않는 기준점(Anchor) 역할을 수행합니다."
  },
  {
    id: "P7",
    rank: 9,
    isCore8: true,
    hemisphere: "Left",
    region: "parietal",
    pos: [-1.08, 0.12, -0.82],
    anatomicalName: "좌측 두정-체성감각 연합피질 (Left Parietal Cortex)",
    compositeScore: 22.43,
    singleAuc: 0.525,
    fdr: 0.0029,
    rfImportance: 0.0603,
    muLeft: -26.38,
    muRight: -26.33,
    powerDiff: +0.058,
    stimSide: "RIGHT_MI",
    portOriginal: "Port 12 (합선 고장)",
    portRemapped: "Port 6 (물리 리매핑 복원)",
    subjectLogic: "희영 피험자 교차 분석 반영: 두정-체성감각 피드백 연합으로 공간 다면성 확보",
    description: "운동 상상 시 손의 움직임 감각을 떠올리는 체성감각 연합 네트워크입니다. 다인 일반화 성능을 높이기 위해 최종 8채널에 포함되었습니다."
  },
  {
    id: "F7",
    rank: 10,
    isCore8: true,
    hemisphere: "Left",
    region: "frontal",
    pos: [-1.12, 0.18, 0.78],
    anatomicalName: "좌측 전두-측두 연합피질 (Left Inferior Frontal)",
    compositeScore: 16.83,
    singleAuc: 0.519,
    fdr: 0.0016,
    rfImportance: 0.0552,
    muLeft: -26.64,
    muRight: -26.61,
    powerDiff: +0.035,
    stimSide: "RIGHT_MI",
    portOriginal: "Port 3 (정상)",
    portRemapped: "Port 7 (유지/재배치)",
    subjectLogic: "민지 피험자 보완: 전두-측두 연결망을 통한 운동 기획(Motor Planning) 포착",
    description: "카드의 딜레마를 읽고 어느 쪽 손을 상상할지 기획·집중하는 초기 의사결정 신호를 포착합니다."
  },
  {
    id: "T7",
    rank: 11,
    isCore8: true,
    hemisphere: "Left",
    region: "temporal",
    pos: [-1.32, 0.05, 0.02],
    anatomicalName: "좌측 측두엽 (Left Temporal Cortex)",
    compositeScore: 16.70,
    singleAuc: 0.522,
    fdr: 0.0017,
    rfImportance: 0.0666,
    muLeft: -26.83,
    muRight: -26.86,
    powerDiff: -0.034,
    stimSide: "RIGHT_MI",
    portOriginal: "Port 7 (정상)",
    portRemapped: "Port 4 (유지/재배치)",
    subjectLogic: "우측 T8과의 해부학적 좌/우 측두 대칭 완성 및 오른손 상상 ERD 검출",
    description: "오른손(RIGHT) 운동 상상 시 좌반구 C3와 함께 활성화되며, T8과의 좌우 파워 비대칭도를 계산하는 핵심 축입니다."
  },
  {
    id: "F3",
    rank: 12,
    isCore8: true,
    hemisphere: "Left",
    region: "frontal",
    pos: [-0.72, 0.76, 0.68],
    anatomicalName: "좌측 배외측 전운동피질 (Left Premotor Cortex)",
    compositeScore: 14.44,
    singleAuc: 0.523,
    fdr: 0.0023,
    rfImportance: 0.0470,
    muLeft: -27.00,
    muRight: -26.95,
    powerDiff: +0.053,
    stimSide: "RIGHT_MI",
    portOriginal: "Port 4 (정상)",
    portRemapped: "Port 8 (유지/재배치)",
    subjectLogic: "오른손 운동 상상의 전운동 기획(Premotor) 및 C3 보조 시너지",
    description: "일차운동피질(C3) 바로 앞단에 위치하여 오른손 움직임을 구체화할 때 강한 베타/뮤 탈동기화를 일으킵니다."
  },
  {
    id: "C3",
    rank: 16,
    isCore8: true,
    hemisphere: "Left",
    region: "sensorimotor",
    pos: [-0.86, 0.78, -0.02],
    anatomicalName: "좌반구 일차감각운동피질 (Left Motor Cortex)",
    compositeScore: 12.39,
    singleAuc: 0.525,
    fdr: 0.0004,
    rfImportance: 0.0795,
    muLeft: -27.29,
    muRight: -27.31,
    powerDiff: -0.021,
    stimSide: "RIGHT_MI",
    portOriginal: "Port 8 (정상)",
    portRemapped: "Port 1 (최우선 배정)",
    subjectLogic: "예진 단독 점수는 낮으나, 해부학적 C3-C4 대칭 및 타 피험자 우수(RIGHT) 상상 디코딩을 위해 필수 채택",
    description: "오른손(RIGHT) 운동 상상의 생리학적 직결 중추입니다. 랜덤 포레스트 중요도 3위(0.0795)로, C4와의 상호 대칭 필터링에 필수적입니다."
  },

  // --- 이하 8개 채널은 노이즈/중복으로 최종 8채널에서 배제된 채널 ---
  {
    id: "Fp1",
    rank: 4,
    isCore8: false,
    hemisphere: "Left",
    region: "frontal",
    pos: [-0.48, 0.42, 1.25],
    anatomicalName: "좌측 전두극 (Left Frontopolar - 배제됨)",
    compositeScore: 27.84,
    singleAuc: 0.518,
    fdr: 0.00007,
    rfImportance: 0.0433,
    muLeft: -25.48,
    muRight: -25.47,
    powerDiff: +0.006,
    stimSide: "NOISE",
    portOriginal: "Port 1 (배제 후 C3로 스왑)",
    portRemapped: "Excluded (EOG 노이즈 차단)",
    subjectLogic: "눈 깜빡임(EOG) 및 이마 근전도(EMG) 아티팩트의 주원인이므로 원천 배제",
    description: "겉보기 점수는 높으나 실제 운동 상상이 아닌 눈 깜빡임·시선 이동 아티팩트에 의해 오염되는 대표적인 노이즈 채널입니다."
  },
  {
    id: "Fp2",
    rank: 7,
    isCore8: false,
    hemisphere: "Right",
    region: "frontal",
    pos: [0.48, 0.42, 1.25],
    anatomicalName: "우측 전두극 (Right Frontopolar - 배제됨)",
    compositeScore: 23.94,
    singleAuc: 0.509,
    fdr: 0.00014,
    rfImportance: 0.0433,
    muLeft: -25.66,
    muRight: -25.65,
    powerDiff: +0.009,
    stimSide: "NOISE",
    portOriginal: "Port 2 (배제 후 C4로 스왑)",
    portRemapped: "Excluded (EOG 노이즈 차단)",
    subjectLogic: "안구 전위(EOG) 유입 차단을 위해 원천 배제하고 해당 물리 포트를 C4에 양보",
    description: "전두극 노이즈 유입 통로입니다. 이 채널을 제거함으로써 게임 중 카드를 바라볼 때 발생하는 안구 노이즈 오작동을 차단했습니다."
  },
  {
    id: "O1",
    rank: 5,
    isCore8: false,
    hemisphere: "Left",
    region: "occipital",
    pos: [-0.48, 0.22, -1.26],
    anatomicalName: "좌측 후두부 시각피질 (Left Occipital - 배제됨)",
    compositeScore: 27.67,
    singleAuc: 0.525,
    fdr: 0.0024,
    rfImportance: 0.0498,
    muLeft: -25.94,
    muRight: -25.87,
    powerDiff: +0.062,
    stimSide: "NOISE",
    portOriginal: "Port 15",
    portRemapped: "Excluded (시각 알파파 배제)",
    subjectLogic: "화살표/카드 시각 자극에만 반응하는 후두 알파파 혼입 방지를 위해 배제",
    description: "운동 상상이 아니라 눈으로 보는 시각 자극(Visual Evoked Potential)에 반응하므로 순수 BCI 제어에서 배제하였습니다."
  },
  {
    id: "O2",
    rank: 6,
    isCore8: false,
    hemisphere: "Right",
    region: "occipital",
    pos: [0.48, 0.22, -1.26],
    anatomicalName: "우측 후두부 시각피질 (Right Occipital - 배제됨)",
    compositeScore: 25.40,
    singleAuc: 0.510,
    fdr: 0.00026,
    rfImportance: 0.0524,
    muLeft: -26.10,
    muRight: -26.08,
    powerDiff: +0.018,
    stimSide: "NOISE",
    portOriginal: "Port 16",
    portRemapped: "Excluded (시각 알파파 배제)",
    subjectLogic: "시각 피질 배경 알파파 드리프트 원천 배제",
    description: "후두엽 시각 영역으로, 피험자의 피로도에 따라 배경 알파파가 크게 요동쳐 분류기를 교란하므로 제거했습니다."
  },
  {
    id: "P8",
    rank: 8,
    isCore8: false,
    hemisphere: "Right",
    region: "parietal",
    pos: [1.08, 0.12, -0.82],
    anatomicalName: "우측 두정엽 (Right Parietal - 후보/배제)",
    compositeScore: 22.62,
    singleAuc: 0.518,
    fdr: 0.00088,
    rfImportance: 0.0477,
    muLeft: -26.43,
    muRight: -26.39,
    powerDiff: +0.036,
    stimSide: "LEFT_MI",
    portOriginal: "Port 14",
    portRemapped: "Excluded (10/08 드리프트 잡음 확인)",
    subjectLogic: "10/08 7ch 실험에서 3,738 uV 저주파 드리프트 및 CAR 역류 원인으로 규명되어 T8/C4에 집중",
    description: "우반구 신호는 이미 T8(1위)과 C4(2위)가 강력하게 포착하고 있으며, P8의 접촉 불안정성을 제거해 신호 안정성을 높였습니다."
  },
  {
    id: "F8",
    rank: 13,
    isCore8: false,
    hemisphere: "Right",
    region: "frontal",
    pos: [1.12, 0.18, 0.78],
    anatomicalName: "우측 하전두엽 (Right Inferior Frontal - 배제)",
    compositeScore: 13.79,
    singleAuc: 0.520,
    fdr: 0.00055,
    rfImportance: 0.0518,
    muLeft: -26.54,
    muRight: -26.51,
    powerDiff: +0.020,
    stimSide: "LEFT_MI",
    portOriginal: "Port 6",
    portRemapped: "Excluded (P7 리매핑에 포트 양보)",
    subjectLogic: "관자놀이 근전도(턱/안면 근육) 잡음 민감도가 높아 배제",
    description: "우반구 측두/운동 신호는 T8과 C4로 충분히 대변되므로 8채널 경량화 과정에서 제외되었습니다."
  },
  {
    id: "Pz",
    rank: 14,
    isCore8: false,
    hemisphere: "Center",
    region: "parietal",
    pos: [0.0, 0.85, -0.78],
    anatomicalName: "정중 두정엽 (Midline Parietal - 배제)",
    compositeScore: 13.56,
    singleAuc: 0.507,
    fdr: 0.00003,
    rfImportance: 0.0610,
    muLeft: -26.58,
    muRight: -26.59,
    powerDiff: -0.005,
    stimSide: "NONE",
    portOriginal: "Port 13",
    portRemapped: "Excluded (Cz로 중심 기준 일원화)",
    subjectLogic: "좌/우 파워 차이가 -0.005 dB로 거의 0에 수렴하여 변별 기여도 낮음",
    description: "정중선상에 위치하여 좌/우 상상 간 비대칭성이 거의 나타나지 않으며, 중심 기준 역할은 Cz가 수행합니다."
  },
  {
    id: "F4",
    rank: 15,
    isCore8: false,
    hemisphere: "Right",
    region: "frontal",
    pos: [0.72, 0.76, 0.68],
    anatomicalName: "우측 전운동피질 (Right Premotor - 배제)",
    compositeScore: 13.56,
    singleAuc: 0.532,
    fdr: 0.00061,
    rfImportance: 0.0416,
    muLeft: -26.61,
    muRight: -26.58,
    powerDiff: +0.028,
    stimSide: "LEFT_MI",
    portOriginal: "Port 5",
    portRemapped: "Excluded (T8 리매핑에 포트 양보)",
    subjectLogic: "Random Forest 중요도 최하위(0.0416)로, 1위 채널 T8 복원을 위해 물리 포트 양보",
    description: "우반구에서는 C4와 T8의 기여도가 압도적이므로 F4를 덜어내어 8채널 구성을 최적화했습니다."
  }
];

/**
 * 스크롤 스토리텔링 (Scrollytelling) 6단계 구성
 * 스크롤이 각 단계에 진입할 때 3D 뇌의 회전 각도(cameraPos)와 Dot 색칠 모드(visualMode)를 제어합니다.
 */
export const SCROLL_STORIES = [
  {
    step: 0,
    badge: "OVERVIEW // CAPSTONE PROJECT",
    title: "뇌파(EEG)로 생존을 결정하는 적응형 BCI 아틀라스",
    subtitle: "2,624회 실측 트라이얼 분석 · 5종 개별 분류기 벤치마크 · 통합 8채널 최적화",
    visualMode: "OVERVIEW_ALL",
    cameraPos: [4.15, 0.55, 2.85],
    description: "비가시적인 두피 생체 신호를 실시간 디코딩하여 손을 대지 않고 게임을 제어합니다. 삼각형 신경망 와이어프레임과 교차 꼭짓점(Vertex Dots)으로 구성된 3D 뇌 모델을 통해 운동 상상(Motor Imagery) 시 대뇌 피질 어디가 자극되는지, 그리고 어떤 개별 분류기(Shrinkage LDA, RBF SVM, Riemannian Tangent, Random Forest)를 설계·검증했는지 실측 데이터로 증명합니다.",
    metrics: [
      { label: "누적 분석 뇌파", value: "2,624 Trials" },
      { label: "온라인 평균 성공률", value: "96.9% (698/720)" },
      { label: "주력 개별 분류기", value: "Shrinkage LDA / SVM" }
    ]
  },
  {
    step: 1,
    badge: "STEP 01 // INDIVIDUAL CLASSIFIERS & SCALING",
    title: "420D 고차원 SVM에서 4D 초경량 Shrinkage LDA로의 진화",
    subtitle: "FBRiemann+CSP(420D) 과적합 극복 → p1-p99 Clipping + CSP(4D) + MinMax + LDA",
    visualMode: "CORE_8CH",
    cameraPos: [3.4, 1.35, 3.1],
    description: "초기 구형 모델은 3-Band FilterBank + FBRiemann(408D) + CSP(12D) = 420차원 특징과 RBF SVM(2.06MB)을 사용했으나, 당일 캘리브레이션 20회(120 블록)로 재학습할 때 심각한 과적합이 발생했습니다. 이를 해결하기 위해 Channel-wise p1–p99 클리핑 + 단일 대역(8-13Hz) CSP 4차원 + MinMaxScaler(0-1) + Ledoit-Wolf Shrinkage LDA(10.8KB)로 전면 개편하여 0.01초 당일 적응과 LOSO 최고 안정성을 달성했습니다.",
    metrics: [
      { label: "특징 차원 압축", value: "420D → 4D (1/105)" },
      { label: "모델 번들 용량", value: "2,064KB → 10.8KB" },
      { label: "당일 LDA 재학습", value: "0.01초 수렴 (무과적합)" }
    ]
  },
  {
    step: 2,
    badge: "STEP 02 // NOISE ELIMINATION & 8CH MONTAGE",
    title: "아티팩트 오염 채널 제거 & 다인 피험자 통합 8채널 확정",
    subtitle: "Fp1·Fp2(EOG)·O1·O2(VEP) 배제 → T8 · T7 · C4 · C3 · F7 · Cz · P7 · F3",
    visualMode: "NOISE_HIGHLIGHT",
    cameraPos: [3.35, 0.95, 3.35],
    description: "5대 정량 지표(FDR 25% + r² 20% + CSP 공간패턴 25% + 단일채널 LDA AUC 15% + Random Forest 중요도 15%)로 2,624회 트라이얼을 전수 분석했습니다. 눈 깜빡임 노이즈(Fp1, Fp2)와 단순 시각 알파파(O1, O2)를 원천 배제하고, 예진(C3 대칭 보완)·민지(F7·Cz 기준 보완)·희영(P7 체성감각 연합) 교차 분석으로 최종 통합 8채널을 확립했습니다.",
    metrics: [
      { label: "중요도 1위 · 2위", value: "T8 (78.3) · C4 (40.4)" },
      { label: "RF 중요도 Top 3", value: "T8 · C4 · C3" },
      { label: "착용 준비 시간", value: "20분 → 5분 단축" }
    ]
  },
  {
    step: 3,
    badge: "STEP 03 // LEFT HAND MOTOR IMAGERY",
    title: "왼손 운동 상상(LEFT MI) → 우반구 대뇌 피질 자극 점등",
    subtitle: "우반구 C4(일차운동피질) 및 T8(측두 허브) ERD 집중 활성화",
    visualMode: "STIM_LEFT_MI",
    cameraPos: [3.85, 1.0, 2.25],
    description: "신경해부학적 교차 지배(Contralateral Control) 원리에 따라, 플레이어가 왼손 움직임을 상상하면 반대쪽인 오른쪽 뇌(C4, T8, Cz)의 신경망 메쉬와 꼭짓점들이 강하게 자극받아 Mu/Beta 대역 탈동기화(ERD)가 발생합니다.",
    metrics: [
      { label: "핵심 자극 부위", value: "우반구 C4 · T8" },
      { label: "T8 단일채널 AUC", value: "0.570 (전체 1위)" },
      { label: "좌측 선택 성공률", value: "95.3% (343/360)" }
    ]
  },
  {
    step: 4,
    badge: "STEP 04 // RIGHT HAND MOTOR IMAGERY",
    title: "오른손 운동 상상(RIGHT MI) → 좌반구 네트워크 자극 점등",
    subtitle: "좌반구 C3(일차운동) · F3(전운동 기획) · T7 · P7 연쇄 활성화",
    visualMode: "STIM_RIGHT_MI",
    cameraPos: [-3.85, 1.0, 2.25],
    description: "반대로 오른손 상상을 수행하면 좌반구 감각운동 피질(C3)을 중심으로 전운동 기획 영역(F3, F7), 좌측 측두엽(T7), 두정 체성감각 연합(P7)의 뇌 메쉬와 꼭짓점들이 앰버 골드 빛으로 일제히 활성화됩니다.",
    metrics: [
      { label: "핵심 자극 부위", value: "좌반구 C3 · T7 · F3 · P7" },
      { label: "C3 RF 중요도", value: "0.0795 (전체 3위)" },
      { label: "우측 선택 성공률", value: "98.6% (355/360)" }
    ]
  },
  {
    step: 5,
    badge: "STEP 05 // SAFETY GATE, THRESHOLD GUARDRAIL & REMAPPING",
    title: "4중 안전 관문 파인튜닝 · 임계값 붕괴 디버깅 · 포트 합선 복원",
    subtitle: "AUC 0.22 → 0.95 도약 · 10/06 0.194 임계값 착시 해결 · 1~8번 포트 스왑 100% 복구",
    visualMode: "REMAPPING_RECOVERY",
    cameraPos: [3.1, 1.35, 3.55],
    description: "4중 안전 관문(OOF AUC ≥ 0.60, ΔP > 0.03, 좌/우 재현율 검증)을 통과할 때만 당일 분류기(NEW-A 80:20 가중 결합 또는 SVM Head)를 채택하고 미달 시 OLD로 Fail-safe 복귀합니다. 또한 10/06 세션에서 Balanced Accuracy 착시로 임계값이 0.194로 붕괴했던 버그를 역산 규명하여 [0.35, 0.65] 가드레일로 해결했으며, 9~16번 포트 합선 위기를 1~8번 리매핑으로 100% 복원했습니다.",
    metrics: [
      { label: "파인튜닝 최고 AUC", value: "0.35 → 0.95 (+0.60)" },
      { label: "임계값 가드레일", value: "[0.35, 0.65] 벽타기 차단" },
      { label: "포트 리매핑 복원율", value: "100% (손실 0.0%p)" }
    ]
  }
];

/**
 * 연구에서 설계·실험·비교한 5대 개별 분류기 (Individual Classifiers) 상세 데이터
 */
export const INDIVIDUAL_CLASSIFIERS = [
  {
    id: "shrinkage_lda",
    name: "Shrinkage LDA (Ledoit-Wolf)",
    shortTag: "PRIMARY // GEN-2 FINAL",
    roleBadge: "최종 주력 선형 분류기 (NEW / NEW-A / Scaled Bundle)",
    codeSpec: "LinearDiscriminantAnalysis(solver='lsqr', shrinkage='auto')",
    featureDim: "4D (CSP n_components=4, reg=0.05, log=True)",
    preprocessing: [
      "CAR (평균 기준 참조)",
      "Butterworth 4차 (8–13Hz Mu 대역)",
      "Channel-wise p1–p99 Clipping",
      "CSP 공간 필터 (4 Components)",
      "Component-wise MinMaxScaler (0–1)",
      "Shrinkage LDA (lsqr + auto shrinkage)"
    ],
    keyMetrics: [
      { label: "WMJ 5Ch AUC / F1", value: "0.7985 / 0.7200" },
      { label: "OYJ 7Ch LOSO AUC", value: "0.6002 (1위)" },
      { label: "모델 번들 용량", value: "10.8 KB" },
      { label: "당일 120블록 재학습", value: "0.01 sec" }
    ],
    formulaOrPrinciple: "Σ_shrunk = (1 - α)Σ + α·Tr(Σ)/p·I  |  w = Σ_shrunk⁻¹(μ_R - μ_L)",
    whyUsed: "고차원 비선형 모델(420D SVM)이 당일 캘리브레이션 소표본(20 Trials = 120 Windows) 재학습 시 겪는 심각한 과적합을 완벽히 해결하기 위해 도입했습니다. Ledoit-Wolf 자동 공분산 수축(Shrinkage)을 통해 작은 샘플에서도 공분산 역행렬이 무너지지 않으며, 오프라인 특징(80%)과 당일 특징(20%)을 결합하는 NEW-A 적응 학습에서도 0.01초 만에 안정적인 초평면을 형성합니다.",
    strengths: [
      "소표본(120개 0.5s 블록) 당일 캘리브레이션 재학습 시 과적합 제로",
      "0~1 MinMax 정규화된 4차원 CSP 공간에서 가장 깨끗한 선형 결정 경계 형성",
      "번들 크기 10.8KB 초경량으로 0.25s/0.5s 실시간 스트리밍 지연시간 0ms 수렴"
    ],
    limitations: "비선형 주파수 교차 왜곡이 극심한 다중 대역(420D) 원시 공간에서는 단독 적용이 어려워 반드시 정제된 CSP(4D) 또는 Tangent Space 특징 추출기와 결합해야 함.",
    activeChannels: ["T8", "C4", "Cz", "C3", "T7", "P7", "F3", "F7"],
    accentColor: "#2563eb",
    cameraPos: [3.75, 1.15, 2.55],
    channelWeights: {
      T8: 1.00, C4: 0.94, Cz: 0.78, C3: 0.85, T7: 0.76, P7: 0.72, F3: 0.68, F7: 0.64,
      P8: 0.25, F4: 0.15, F8: 0.12, Pz: 0.15, Fp1: 0.05, Fp2: 0.05, O1: 0.05, O2: 0.05
    }
  },
  {
    id: "platt_rbf_svm",
    name: "Platt-Scaled RBF / Linear SVM",
    shortTag: "GEN-1 ONLINE // SAFETY-GATED FT",
    roleBadge: "초기 온라인 14세션 주력 & 4중 안전 관문 파인튜닝 헤드",
    codeSpec: "SVC(kernel='rbf', C=1.5, gamma='scale', probability=True)",
    featureDim: "420D (FBRiemann 408D + 3-Band CSP 12D) / 4D (Linear SVM 비교군)",
    preprocessing: [
      "16Ch 전체 입력 (Fp1~O2)",
      "3-Band FilterBank (8–13, 13–20, 20–30Hz)",
      "FBRiemann (3×136=408D) + CSP (3×4=12D)",
      "StandardScaler (Z-Score)",
      "RBF SVM + Platt Scaling 확률 보정",
      "Safety-Gated Head Fine-Tuning"
    ],
    keyMetrics: [
      { label: "온라인 14세션 성공률", value: "96.9% (698/720)" },
      { label: "파인튜닝 최고 도약", value: "AUC 0.35 → 0.95" },
      { label: "7Ch Linear SVM AUC", value: "0.5975 (LOSO)" },
      { label: "구형 번들 용량", value: "2,064 KB (2.06MB)" }
    ],
    formulaOrPrinciple: "f(x) = ∑ α_i y_i K(x_i, x) + b  |  P(RIGHT|f) = 1 / (1 + exp(A·f + B))",
    whyUsed: "다중 주파수 대역(Mu, Low-Beta, High-Beta)의 리만 기하 공분산과 CSP 특징을 결합한 420차원 고차원 비선형 특징 공간에서 결정 경계를 찾기 위해 사용했습니다. 특히 `neuro_feedback3_finetuned.py`에서 특징 추출기는 동결(Frozen)하고 SVM 분류기 헤드만 당일 적응시켜 `0929_02` 세션에서 OOF AUC를 0.35에서 0.95로 끌어올리고 본실험 100%(60/60)를 달성했습니다.",
    strengths: [
      "고차원(420D) 비선형 특징 공간에서 강력한 마진 최대화 및 커널 분리 능력",
      "Platt Scaling 시그모이드 피팅을 통해 Dynamic Fading UI 제어용 연속 확률 P(RIGHT) 출력",
      "4중 안전 관문(Safety Gates)과 결합 시 일자별 비선형 분포 회전 극복"
    ],
    limitations: "데이터 120개(20 Trials)로 420차원 RBF SVM을 제약 없이 재학습하면 극심한 과적합과 임계값 편향이 발생하여, 이후 4D CSP + Shrinkage LDA 아키텍처로 경량화하는 계기가 됨.",
    activeChannels: ["T8", "C4", "Cz", "C3", "T7", "P7", "P8", "F3", "F4", "F7", "F8", "Pz", "Fp1", "Fp2", "O1", "O2"],
    accentColor: "#4f46e5",
    cameraPos: [3.65, 1.35, 2.85],
    channelWeights: {
      T8: 0.98, C4: 0.92, Cz: 0.76, C3: 0.70, T7: 0.65, P7: 0.68, P8: 0.64,
      F3: 0.55, F4: 0.52, F7: 0.54, F8: 0.50, Pz: 0.45, O1: 0.58, O2: 0.52, Fp1: 0.48, Fp2: 0.44
    }
  },
  {
    id: "riemann_tangent_lda",
    name: "Riemannian Tangent Space + LDA",
    shortTag: "GEOMETRIC // KHY BUNDLE",
    roleBadge: "양정치 공분산 다양체(SPD Manifold) 접공간 분류기",
    codeSpec: "OAS Covariance → EnsureSPD(ε=1e-6) → TangentSpace(metric='riemann') → Shrinkage LDA",
    featureDim: "N(N+1)/2 D (채널 간 대칭 공분산 상삼각 벡터화)",
    preprocessing: [
      "0.5s 스트리밍 에포크 슬라이싱",
      "OAS (Oracle Approximating Shrinkage) 공분산 추정",
      "EnsureSPD (고유값 하한 클리핑으로 양정치 행렬 보장)",
      "Riemannian 평균 공분산(C_ref) 기준 접공간(Tangent Space) 사영",
      "Shrinkage LDA 선형 판별"
    ],
    keyMetrics: [
      { label: "적용 대상 모델", value: "KHY / OYJ Hybrid" },
      { label: "기하학적 거리", value: "Affine-Invariant" },
      { label: "세션 적응 방식", value: "C_ref 고정 + LDA 재학습" },
      { label: "수치 안정성", value: "EnsureSPD 모듈 보장" }
    ],
    formulaOrPrinciple: "S_i = log_m(C_ref^(-1/2) · C_i · C_ref^(-1/2))  ∈  T_{C_ref} M",
    whyUsed: "EEG 신호의 공간적 상관관계(전극 간 위상 및 파워 공분산)는 유클리드 공간이 아닌 대칭 양정치(SPD) 리만 다양체 위에 존재합니다. `ensure_spd.py`를 자체 구현하여 실시간 스트리밍 중 특이 행렬(Singular Matrix) 오류를 원천 차단하고, 곡면 위의 공분산 행렬을 유클리드 접공간(Tangent Space)으로 펴서 선형 분류기(LDA)가 정확히 작동하도록 설계했습니다.",
    strengths: [
      "CSP가 놓칠 수 있는 채널 간 미세 위상·공분산 기하 구조를 손실 없이 보존",
      "EnsureSPD 자체 모듈로 실시간 패킷 결손이나 급격한 아티팩트에서도 행렬 로그 연산 무결성 유지",
      "참가자 KHY 모델 및 초기 하이브리드 모델의 핵심 백본으로 활약"
    ],
    limitations: "채널 수(N)가 늘어날수록 특징 차원이 N(N+1)/2로 제곱 비례 증가하여, 16채널 기준 대역당 136차원이 생성되므로 소표본 환경에서는 채널 축소(7~8ch)가 필수적임.",
    activeChannels: ["C3", "Cz", "C4", "T7", "T8", "P7", "P8", "F3", "F7"],
    accentColor: "#0891b2",
    cameraPos: [0.0, 3.6, 2.75],
    channelWeights: {
      T8: 0.92, C4: 0.90, Cz: 0.88, C3: 0.88, T7: 0.82, P7: 0.80, P8: 0.74, F3: 0.65, F7: 0.62,
      F4: 0.25, F8: 0.20, Pz: 0.30, Fp1: 0.08, Fp2: 0.08, O1: 0.10, O2: 0.10
    }
  },
  {
    id: "random_forest_importance",
    name: "Random Forest Ensemble (Gini / Permutation)",
    shortTag: "FEATURE IMPORTANCE // 2,624 TRIALS",
    roleBadge: "비선형 트리 앙상블 기반 16채널 기여도 정량 검증기",
    codeSpec: "RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)",
    featureDim: "16D (16채널 Log Band-Power: log(mean(x²) + 1e-15))",
    preprocessing: [
      "오프라인 1,134 + 온라인 1,490 = 2,624 Trials 통합",
      "16채널 CAR + 8–13Hz Mu 대역 필터링",
      "채널별 Log-Variance 파워 추출",
      "100 결정 트리(max_depth=5) 앙상블 학습",
      "불순도 감소량(Gini Importance) 기반 전극 서열화"
    ],
    keyMetrics: [
      { label: "RF 중요도 1위", value: "T8 (0.1385 / 13.85%)" },
      { label: "RF 중요도 2위", value: "C4 (0.1171 / 11.71%)" },
      { label: "RF 중요도 3위", value: "C3 (0.0795 / 7.95%)" },
      { label: "RF 최하위 (배제)", value: "F4 (0.0416) · Fp1 (0.0433)" }
    ],
    formulaOrPrinciple: "Importance(ch_k) = (1 / M) ∑_t ∑_{n ∈ ch_k} p(n) · ΔGini(n)",
    whyUsed: "선형 지표(FDR, r²)만으로는 포착하기 어려운 채널 간 비선형 상호작용 기여도를 검증하기 위해 도입했습니다. 특히 단일 채널 FDR에서는 16위로 낮게 보였던 좌반구 `C3` 채널이 Random Forest 다변량 트리 분기에서는 **전체 3위(0.0795)**의 핵심 변수로 작동함을 밝혀내어, 통합 8채널에 `C3`를 필수 포함시키는 결정적 학술 근거를 제공했습니다.",
    strengths: [
      "단변량 통계(FDR)에서는 숨겨진 C3–C4 좌/우 대칭 상호작용 중요도를 완벽히 발굴 (C3 전체 3위 입증)",
      "전두극(Fp1 0.0433, Fp2 0.0433) 및 F4(0.0416)의 낮은 기여도를 입증하여 과감한 채널 제거 뒷받침"
    ],
    limitations: "트리 분할 특성상 실시간 연속 확률 P(RIGHT)가 계단식으로 불연속 점프하므로, 실시간 Dynamic Fading 제어용보다는 오프라인 채널 선택 및 특징 검증용으로 활용.",
    activeChannels: ["T8", "C4", "C3", "T7", "P7", "Pz", "F7", "O2"],
    accentColor: "#059669",
    cameraPos: [3.55, 1.45, 2.65],
    channelWeights: {
      T8: 1.00, C4: 0.86, C3: 0.78, T7: 0.66, P7: 0.62, Pz: 0.61, F7: 0.56, O2: 0.52,
      F8: 0.51, O1: 0.49, P8: 0.47, F3: 0.47, Cz: 0.45, Fp1: 0.22, Fp2: 0.22, F4: 0.18
    }
  },
  {
    id: "l2_logreg_ridge",
    name: "L2 Logistic Regression & PSD Ridge",
    shortTag: "BENCHMARK // PSD & HYPER-GRID",
    roleBadge: "PSD 주파수 파워 특징 분류 & 7Ch 그리드 서치 선형 기준선",
    codeSpec: "LogisticRegression(C=1.0, max_iter=500)  |  RidgeClassifier(alpha=1.0)",
    featureDim: "4D (CSP) 또는 16D (Mu 8–12Hz & Beta 13–30Hz Welch PSD Power)",
    preprocessing: [
      "기본 전처리(CAR + Bandpass) 후 Welch PSD / Log-BandPower 산출",
      "또는 p1–p99 Clipping + CSP(n_comp ∈ {2,4,6}, reg ∈ {0.01..0.20})",
      "MinMaxScaler vs StandardScaler 교차 비교",
      "L2 정규화 로지스틱 회귀 / Ridge 선형 판별"
    ],
    keyMetrics: [
      { label: "7Ch LOSO AUC", value: "0.5988 (CSP4 + MinMax)" },
      { label: "최적 CSP 정규화", value: "n_comp=4, reg=0.05" },
      { label: "최적 스케일러", value: "MinMaxScaler (0–1)" },
      { label: "핵심 철학", value: "Simple Linear is Best" }
    ],
    formulaOrPrinciple: "min_w  ∑ log(1 + exp(-y_i (w^T x_i + b))) + (1 / 2C) ||w||₂²",
    whyUsed: "10/12 연구 회의 및 `tune_7ch_model.py` 그리드 서치에서 '과도한 비선형 모델보다 정제된 특징(PSD / CSP) 위의 단순 선형 분류기가 일반화 성능이 훨씬 높다'는 가설을 검증하기 위해 실험했습니다. 72개 하이퍼파라미터 조합 전수 비교 결과, `Shrinkage LDA (0.6002)`와 `L2 Logistic Regression (0.5988)`이 나란히 최상위권을 기록하며 선형 분류기 채택의 타당성을 확증했습니다.",
    strengths: [
      "L2 가중치 감쇠(Weight Decay)로 상관관계가 높은 인접 전극 간 다중공선성 억제",
      "출력 자체가 보정된 시그모이드 확률이므로 별도의 Platt Scaling 없이도 매끄러운 확률 해석 가능"
    ],
    limitations: "공분산 구조 자체를 수축 추정하는 Shrinkage LDA 대비 소표본(120 블록) 클래스 내 분산 역전 상황에서 미세하게 낮은 LOSO AUC(0.5988 vs 0.6002)를 보임.",
    activeChannels: ["T8", "C4", "Cz", "C3", "T7", "P7", "P8"],
    accentColor: "#d97706",
    cameraPos: [-3.65, 1.15, 2.65],
    channelWeights: {
      T8: 0.95, C4: 0.90, Cz: 0.75, C3: 0.80, T7: 0.72, P7: 0.68, P8: 0.62,
      F3: 0.45, F7: 0.42, F4: 0.20, F8: 0.18, Pz: 0.18, Fp1: 0.06, Fp2: 0.06, O1: 0.08, O2: 0.08
    }
  }
];

/**
 * 구형 모델(Gen 1) vs 신형 정석 모델(Gen 2) 10대 핵심 아키텍처 비교표
 * (md/OYJ_모델_스케일링_개선_및_온라인_프로토콜_분석_보고서.md 기반)
 */
export const MODEL_EVOLUTION_COMPARISON = [
  { item: "모델 세대 및 파일명", oldModel: "Gen 1: oyj_model_neurofeedback.py (oyj_model_old.joblib)", newModel: "Gen 2: oyj_model_scaled.py / build_best_7ch_model.py", impact: "조교 피드백 및 온라인 드리프트 분석 반영 전면 재설계" },
  { item: "입력 채널 구성", oldModel: "16채널 전체 (Fp1~O2, 안구/후두 잡음 포함)", newModel: "통합 8채널 (T8,T7,C4,C3,F7,Cz,P7,F3) / 7채널", impact: "EOG(Fp1/2) 및 시각 알파파(O1/2) 오염 원천 차단" },
  { item: "주파수 필터 대역", oldModel: "3-Band 멀티 필터뱅크 (8–13, 13–20, 20–30Hz)", newModel: "8.0 – 13.0 Hz 단일 대역 (4차 Butterworth Causal SOS)", impact: "가장 변별력 높은 Mu/SMR 대역 집중 & 실시간 연산 지연 제거" },
  { item: "이상치 억제 (Outlier)", oldModel: "없음 또는 사후 3초 실시간 게인 보정", newModel: "Channel-wise p1–p99 Percentile Clipping (오프라인 경계 고정)", impact: "돌발 스파이크 노이즈에 의한 공간 필터 왜곡 원천 차단" },
  { item: "특징 추출 (Feature)", oldModel: "FBRiemann (408D) + CSP (12D) = 총 420차원", newModel: "Single-Band CSP (n_components=4, reg=0.05) = 단 4차원", impact: "특징 차원 1/105 압축으로 소표본 과적합 위험 완전 해소" },
  { item: "특징 스케일러", oldModel: "StandardScaler (평균 0, 분산 1 — 이상치에 민감)", newModel: "CSP Component-wise MinMaxScaler (0–1 정규화)", impact: "온라인 0.5초 슬라이딩 윈도우 변환 시 출력 범위 안정화" },
  { item: "개별 분류기 (Classifier)", oldModel: "RBF SVM (C=1.5, probability=True, Platt Scaling)", newModel: "Shrinkage LDA (solver='lsqr', shrinkage='auto')", impact: "0.01초 초고속 재학습 수렴 및 명확한 선형 결정 경계" },
  { item: "모델 번들 크기", oldModel: "약 2,064 KB (2.06 MB)", newModel: "약 10.8 KB (초경량 bci_bundle_v1)", impact: "불필요한 거대 공분산 행렬 제거, 메모리/로딩 99.5% 경량화" },
  { item: "기본 임계값 (Threshold)", oldModel: "0.5380 (편향 보정용 수동 상향)", newModel: "0.4850 ~ 0.4950 (Youden J & BA 교차 최적화) + [0.35, 0.65] 가드레일", impact: "좌/우 50:50 균형 달성 및 10/06 임계값 0.194 붕괴 원천 방지" },
  { item: "당일 캘리브레이션 재학습", oldModel: "120개 블록으로 420D SVM 학습 시 심각한 과적합 발생", newModel: "OLD(오프라인 80%) + NEW(당일 20%) 가중 LDA 재학습 + 4중 안전 관문", impact: "당일 컨디션 난조 시에도 4중 관문으로 최소 88~100% 성능 방어" }
];

/**
 * 피험자별 맞춤형 개별 모델 번들 (.joblib) 및 다형성 런타임 어댑터 스펙
 */
export const PARTICIPANT_BUNDLES = [
  {
    subject: "OYJ (예진)",
    bundleFile: "oyj_model_scaled_7ch_1008.joblib / oyj_8ch.joblib",
    adapterMode: "ordered_objects (clipping → csp → scaler → classifier)",
    channels: "T8, C4, Cz, C3, T7, P7, F3, F7 (통합 8Ch) / 7Ch",
    epochWindow: "0.00 – 0.50 s (즉각 반응형, 6 windows / 3s trial)",
    classifier: "Shrinkage LDA (4D CSP) & Platt RBF SVM (Gen-1 420D)",
    offlinePerf: "Online 14세션 평균 96.9% (698/720) · FT 최고 AUC 0.950",
    keyFinding: "우반구(T8 78.3점, C4 40.4점) 좌수 상상 ERD가 압도적으로 선명하며, 0.0초부터 즉각적인 변별력(AUC 0.6052) 발현."
  },
  {
    subject: "WMJ (민지)",
    bundleFile: "wmj_model.joblib",
    adapterMode: "ordered_objects (clipping → csp → scaler → classifier)",
    channels: "T7, C3, Cz, C4, T8 (Motor Core 5Ch)",
    epochWindow: "0.20 – 0.70 s (초기 시각 유발 잠복기 0.2s 제외)",
    classifier: "Shrinkage LDA (CSP 4D + MinMaxScaler)",
    offlinePerf: "Offline CV AUC 0.7985 · F1-Score 0.7200",
    keyFinding: "조교 피드백 정석 파이프라인(5Ch + p1-p99 Clipping + CSP + MinMax + LDA)을 최초 실증하여 약 0.80의 높은 오프라인 AUC 달성."
  },
  {
    subject: "KHY (희영)",
    bundleFile: "khy_model.joblib",
    adapterMode: "sklearn_pipeline / feature_transformer",
    channels: "감각운동 + 두정 체성감각 연합 (P7 보강)",
    epochWindow: "0.50 s Sliding Window (250Hz, 125 samples)",
    classifier: "OAS Covariance → EnsureSPD → Riemannian Tangent Space → Shrinkage LDA",
    offlinePerf: "공분산 다양체 접공간 투영 + 세션별 LDA Head 재학습",
    keyFinding: "특징 공간(OAS + EnsureSPD + TangentSpace)을 동결하고 최종 Shrinkage LDA 결정 경계만 당일 120 블록에 적응시키는 구조 확립."
  }
];

/**
 * 수행한 핵심 연구 아카이브 (What We Researched - 4대 연구 기둥)
 */
export const RESEARCH_PILLARS = [
  {
    id: "pillar_evolution",
    code: "RESEARCH 01 // 5-PHASE PROTOCOL EVOLUTION",
    title: "온라인 프로토콜 5단계 진화: 단순 판별기에서 안전관문 적응형 뉴로피드백까지",
    summary: "오프라인 모델만으로는 일자별 전극 임피던스와 컨디션 변화(Non-stationarity)로 인해 온라인 Baseline AUC가 0.20~0.38까지 붕괴함을 실측 데이터로 확인하고, 이를 해결하기 위해 5단계에 걸쳐 온라인 프로토콜을 진화시켰습니다.",
    phases: [
      { phase: "Phase 0–1", name: "Offline & Static Online (08/05~09/05)", detail: "300 Trials 오프라인 수집 및 고정 모델 판정 → 실시간 뉴로피드백 루프 부재 한계 확인" },
      { phase: "Phase 2", name: "Dynamic Fading UI & Unity 연동 (09/15~09/22)", detail: "0.5초 슬라이딩 확률로 Level 0 → Level 3 점진 전이, 순간 오분류 노이즈 완충 (평균 98.7% 달성)" },
      { phase: "Phase 3", name: "Session Calibration & Threshold Blending (09/23)", detail: "본실험 전 20회 캘리브레이션 도입, 초기 진폭 Gain 클리핑 [0.67, 1.50] 및 임계값 40:60 블렌딩" },
      { phase: "Phase 4", name: "4-Safety-Gate Classifier Fine-Tuning (09/28~09/30)", detail: "특징 추출기 동결 후 분류기 헤드만 당일 적응. 4중 관문 통과 시 채택, 미달 시 Fail-safe 기각 (AUC 0.35→0.95)" },
      { phase: "Phase 5", name: "4D Scaled LDA & 80:20 NEW-A Adaptation (10/01~10/12)", detail: "p1–p99 Clipping + 4D CSP + MinMax + Shrinkage LDA 정석화 및 오프라인(80%)+당일(20%) 가중 재학습 완성" }
    ]
  },
  {
    id: "pillar_collapse",
    code: "RESEARCH 02 // 10/06 THRESHOLD COLLAPSE DEBUGGING",
    title: "10/06 세션 임계값 붕괴(0.194 착시) 원인 규명 및 Safety Guardrail 수학적 패치",
    summary: "10/06 온라인 실험에서 피험자의 의도와 무관하게 20회 연속 한쪽 방향(RIGHT)으로만 직진하는 '벽타기 현상'이 발생했습니다. 전수 로그 역산 결과, 피험자의 뇌파 문제가 아니라 Balanced Accuracy 최적화 함수의 극단치 착시 버그임을 규명하고 완벽히 패치했습니다.",
    steps: [
      { step: "원인 1 (분포 이동)", desc: "당일 캘리브레이션에서 미세한 베이스라인 이동으로 기존 임계값(0.485) 기준 BA가 38.33%로 일시 하락" },
      { step: "원인 2 (0.000 착시)", desc: "탐색 후보군에 포함된 극단치 Th=0.000을 선택하면 모든 샘플을 무조건 RIGHT로 찍어 TPR=100%, TNR=0% → BA=50.00%가 되는 수학적 착시 발생" },
      { step: "원인 3 (40:60 왜곡)", desc: "Applied Th = 0.40×0.485 + 0.60×0.000 = 0.1940으로 추락 → 본실험 P(RIGHT) ∈ [0.40, 0.70]이 항상 0.194를 초과해 20회 전원 RIGHT 오작동" },
      { step: "해결 패치 (Guardrail)", desc: "극단치(0.0, 1.0) 후보 영구 제거 + 탐색 범위 [0.35, 0.65] 강제 제한 + BA < 0.50 시 오프라인 기준값 유지 → 사후 검증 정확도 50.0% → 65.0~70.0% 즉시 복원" }
    ]
  },
  {
    id: "pillar_gates",
    code: "RESEARCH 03 // 4-SAFETY-GATE ADAPTATION BENCHMARK",
    title: "소표본 과적합을 막는 '4중 안전 관문(Quality Gates)' 실측 방어 성적표",
    summary: "당일 20회 캘리브레이션 데이터는 표본이 작아 무조건 재학습 모델을 쓰면 오히려 한쪽 재현율이 0.20으로 무너질 수 있습니다. 4가지 관문을 모두 통과할 때만 NEW 분류기를 채택하고, 하나라도 미달하면 즉시 기각(Fail-safe)하여 전 세션 88.3%~100% 성공률을 방어했습니다.",
    gateRows: [
      { session: "0928_01", baseAuc: "0.370", ftAuc: "0.510", lRec: "1.00", rRec: "0.20 (미달)", decision: "REJECT (Fail-Safe 방어)", finalAcc: "93.3% (56/60)" },
      { session: "0928_02", baseAuc: "0.220", ftAuc: "0.860 (+0.64)", lRec: "1.00", rRec: "0.80", decision: "PASS (NEW 채택)", finalAcc: "88.3% (53/60)" },
      { session: "0929_01", baseAuc: "0.330", ftAuc: "0.695 (+0.37)", lRec: "0.40", rRec: "1.00", decision: "PASS (NEW 채택)", finalAcc: "91.7% (55/60)" },
      { session: "0929_02", baseAuc: "0.350", ftAuc: "0.950 (+0.60)", lRec: "0.80", rRec: "1.00", decision: "PASS (NEW 채택)", finalAcc: "100.0% (60/60)" },
      { session: "0930_01", baseAuc: "0.380", ftAuc: "0.490", lRec: "0.30 (미달)", rRec: "1.00", decision: "REJECT (Fail-Safe 방어)", finalAcc: "100.0% (30/30)" },
      { session: "0930_02", baseAuc: "0.200", ftAuc: "0.710 (+0.51)", lRec: "0.70", rRec: "0.80", decision: "PASS (NEW 채택)", finalAcc: "100.0% (30/30)" },
      { session: "0930_03", baseAuc: "0.240", ftAuc: "0.590 (+0.35)", lRec: "0.60", rRec: "0.70", decision: "PASS (NEW 채택)", finalAcc: "96.7% (29/30)" }
    ]
  }
];

/**
 * 14개 실측 온라인 세션 성능 요약 (md/온라인_프로토콜_변천사_및_성능_분석_보고서.md 기반)
 */
export const ONLINE_SESSIONS = [
  { id: "0921_01", trials: 60, acc: 98.3, leftAcc: 96.7, rightAcc: 100.0, rt: 5.02, phase: "Phase 2: Dynamic Fading", gate: "Baseline" },
  { id: "0921_02", trials: 60, acc: 98.3, leftAcc: 100.0, rightAcc: 96.7, rt: 4.57, phase: "Phase 2: Dynamic Fading", gate: "Baseline" },
  { id: "0922_01", trials: 60, acc: 98.3, leftAcc: 96.7, rightAcc: 100.0, rt: 3.32, phase: "Phase 2: Dynamic Fading", gate: "Baseline" },
  { id: "0922_02", trials: 60, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 2.65, phase: "Phase 2: Dynamic Fading", gate: "Baseline" },
  { id: "0923_01", trials: 30, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 3.10, phase: "Phase 3: Gain & Th Calib", gate: "Th=0.538" },
  { id: "0923_02", trials: 60, acc: 96.7, leftAcc: 93.3, rightAcc: 100.0, rt: 5.32, phase: "Phase 3: Gain & Th Calib", gate: "Th=0.554" },
  { id: "0923_03", trials: 60, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 5.17, phase: "Phase 3: Gain & Th Calib", gate: "Th=0.562" },
  { id: "0928_01", trials: 60, acc: 93.3, leftAcc: 90.0, rightAcc: 96.7, rt: 6.08, phase: "Phase 4: Safety-Gated FT", gate: "Fail-Safe 기각 방어 (93.3%)" },
  { id: "0928_02", trials: 60, acc: 88.3, leftAcc: 83.3, rightAcc: 93.3, rt: 5.83, phase: "Phase 4: Safety-Gated FT", gate: "FT 통과 (AUC 0.22→0.86)" },
  { id: "0929_01", trials: 60, acc: 91.7, leftAcc: 86.7, rightAcc: 96.7, rt: 5.73, phase: "Phase 4: Safety-Gated FT", gate: "FT 통과 (AUC 0.33→0.70)" },
  { id: "0929_02", trials: 60, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 4.82, phase: "Phase 4: Safety-Gated FT", gate: "FT 통과 (AUC 0.35→0.95)" },
  { id: "0930_01", trials: 30, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 5.70, phase: "Phase 4: Safety-Gated FT", gate: "Fail-Safe 기각 방어 (100%)" },
  { id: "0930_02", trials: 30, acc: 100.0, leftAcc: 100.0, rightAcc: 100.0, rt: 4.20, phase: "Phase 4: Safety-Gated FT", gate: "FT 통과 (AUC 0.20→0.71)" },
  { id: "0930_03", trials: 30, acc: 96.7, leftAcc: 93.3, rightAcc: 100.0, rt: 6.30, phase: "Phase 4: Safety-Gated FT", gate: "FT 통과 (AUC 0.24→0.59)" }
];
