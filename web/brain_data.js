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
    subtitle: "2,624회 실측 트라이얼 분석 · 통합 8채널 최적화 · Shelter Mind",
    visualMode: "OVERVIEW_ALL",
    cameraPos: [0.0, 1.3, 4.1],
    description: "비가시적인 두피 생체 신호를 실시간 디코딩하여 손을 대지 않고 게임을 제어합니다. 수만 개의 3D 뇌 신경망 Dot을 통해 운동 상상(Motor Imagery) 시 대뇌 피질 어디가 자극되고 색칠되는지 실측 데이터로 증명합니다.",
    metrics: [
      { label: "누적 분석 뇌파", value: "2,624 Trials" },
      { label: "온라인 평균 성공률", value: "96.9% (698/720)" },
      { label: "평균 의사결정 반응속도", value: "4.84 sec" }
    ]
  },
  {
    step: 1,
    badge: "STEP 01 // NOISE ELIMINATION",
    title: "16채널 풀캡의 한계와 아티팩트 오염 부위 제거",
    subtitle: "안구 깜빡임(Fp1, Fp2) 및 단순 시각 반응(O1, O2) 원천 배제",
    visualMode: "NOISE_HIGHLIGHT",
    cameraPos: [1.8, 1.1, 3.6],
    description: "16채널 풀캡은 착용에 20분 이상 소요되며, 게임을 보며 눈을 깜빡일 때 전두극(Fp1, Fp2)에서 거대한 EOG 노이즈가 발생합니다. 또한 후두부(O1, O2)는 운동 상상이 아닌 화면의 시각 자극에만 반응합니다. 붉게 표시된 오염 영역을 과감히 소거하여 신호 순도를 높였습니다.",
    metrics: [
      { label: "원천 배제 노이즈 전극", value: "Fp1, Fp2, O1, O2" },
      { label: "7ch 축소 시 문제점", value: "CAR 노이즈 역류 규명" },
      { label: "착용 및 준비 시간", value: "20분 → 5분 단축" }
    ]
  },
  {
    step: 2,
    badge: "STEP 02 // MULTI-SUBJECT 8CH MONTAGE",
    title: "다인 피험자 교차 분석 기반 '전체 통합 8채널' 확정",
    subtitle: "T8 · T7 · C4 · C3 · F7 · Cz · P7 · F3",
    visualMode: "CORE_8CH",
    cameraPos: [0.0, 2.8, 2.7],
    description: "단일 피험자 과적합을 막기 위해 예진·민지·희영 다인 피험자의 뇌파를 교차 분석했습니다. 우반구 최고 변별력(T8 1위, C4 2위)과 좌반구 대칭 핵심(C3, T7), 중심 기준선(Cz), 그리고 전두-두정 운동 기획 연합(F3, F7, P7)을 결합한 최적의 8채널 몽타주를 독자 도출했습니다.",
    metrics: [
      { label: "중요도 1위 전극", value: "T8 (78.34점)" },
      { label: "중요도 2위 전극", value: "C4 (40.42점)" },
      { label: "모델 피처 압축", value: "420D → 4D (10.8KB)" }
    ]
  },
  {
    step: 3,
    badge: "STEP 03 // LEFT HAND MOTOR IMAGERY",
    title: "왼손 운동 상상(LEFT MI) → 우반구 대뇌 피질 자극 점등",
    subtitle: "우반구 C4(일차운동피질) 및 T8(측두 허브) ERD 집중 활성화",
    visualMode: "STIM_LEFT_MI",
    cameraPos: [3.1, 1.2, 2.2],
    description: "신경해부학적 교차 지배(Contralateral Control) 원리에 따라, 플레이어가 왼손 움직임을 상상하면 반대쪽인 오른쪽 뇌(C4, T8, Cz)의 신경망 Dot들이 강하게 자극받아 Mu/Beta 대역 탈동기화(ERD)가 발생합니다. 청록색(Cyan)으로 물든 우반구 자극 영역을 확인하세요.",
    metrics: [
      { label: "핵심 자극 부위", value: "우반구 C4 · T8" },
      { label: "T8 Mu 파워 변화", value: "+0.113 dB 변별" },
      { label: "좌측 선택 성공률", value: "95.3% (343/360)" }
    ]
  },
  {
    step: 4,
    badge: "STEP 04 // RIGHT HAND MOTOR IMAGERY",
    title: "오른손 운동 상상(RIGHT MI) → 좌반구 네트워크 자극 점등",
    subtitle: "좌반구 C3(일차운동) · F3(전운동 기획) · T7 · P7 연쇄 활성화",
    visualMode: "STIM_RIGHT_MI",
    cameraPos: [-3.1, 1.2, 2.2],
    description: "반대로 오른손 상상을 수행하면 좌반구 감각운동 피질(C3)을 중심으로 전운동 기획 영역(F3, F7), 좌측 측두엽(T7), 두정 체성감각 연합(P7)의 뇌 Dot들이 마젠타/코랄 빛으로 일제히 활성화됩니다.",
    metrics: [
      { label: "핵심 자극 부위", value: "좌반구 C3 · T7 · F3 · P7" },
      { label: "C3 RF 중요도", value: "0.0795 (전체 3위)" },
      { label: "우측 선택 성공률", value: "98.6% (355/360)" }
    ]
  },
  {
    step: 5,
    badge: "STEP 05 // SAFETY GATE & HARDWARE REMAPPING",
    title: "4중 안전 관문 파인튜닝 & 하드웨어 합선 리매핑 복원",
    subtitle: "AUC 0.22 → 0.95 도약 및 9~16번 포트 단선 시 100% 성능 복구",
    visualMode: "REMAPPING_RECOVERY",
    cameraPos: [0.0, 1.8, 3.8],
    description: "일자별 뇌파 드리프트를 해결하기 위해 4중 안전 관문(OOF AUC ≥ 0.60, 좌/우 재현율 검증) 기반 적응형 파인튜닝과 MI 3초 실시간 진폭 정규화를 구축했습니다. 또한 증폭기 9~16번 포트 합선 위기 시 정상 1~8번 포트로 C4·Cz·T8 리드선을 물리적으로 스왑하여 성능을 100% 복원했습니다.",
    metrics: [
      { label: "파인튜닝 최고 AUC", value: "0.35 → 0.95 (+0.60)" },
      { label: "포트 리매핑 복원율", value: "100% (손실 0.0%p)" },
      { label: "실시간 추론 주기", value: "0.25s 슬라이딩" }
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
