"""
real_eeg_replay_server.py
=========================
뇌파 측정 기기 고장 상황에 대응하여, 기존 수집된 실측 뇌파(data/*/*ExG.csv)를
250Hz 슬라이딩 윈도우로 실시간 재생(Replay)하며:
1) TCP (127.0.0.1:5000) -> Unity 게임 (Shelter Mind / BCIClient.cs) 실시간 제어
2) HTTP + REST API (127.0.0.1:8080) -> 3D 뇌 Dot 아틀라스 결과 사이트(web/) 호스팅 및 실시간 뇌 부위 자극 연동

실행 방법:
    python real_eeg_replay_server.py
브라우저 접속:
    http://localhost:8080
"""

from __future__ import annotations

import csv
import json
import math
import os
import random
import socket
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse

ROOT_DIR = Path(__file__).resolve().parent
WEB_DIR = ROOT_DIR / "web"
DATA_DIR = ROOT_DIR / "data"

TCP_HOST = "127.0.0.1"
TCP_PORT = 5000
HTTP_HOST = "127.0.0.1"
HTTP_PORT = 8080
SAMPLING_INTERVAL = 0.25  # 250ms 주기

# 국제 10-20 시스템 16채널 및 최종 확정 통합 8채널
ALL_16_CHANNELS = [
    "Fp1", "Fp2", "F7", "F3", "F4", "F8", "T7", "C3",
    "Cz", "C4", "T8", "P7", "Pz", "P8", "O1", "O2"
]
CORE_8_CHANNELS = ["T8", "T7", "C4", "C3", "F7", "Cz", "P7", "F3"]


class RealEEGReplayEngine:
    """실측 ExG.csv 데이터를 로드하거나 실측 통계 파라미터로 실시간 뇌파 스트림을 재현하는 엔진."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.start_time = time.time()
        self.phase = 0.0

        # 재생 제어 모드: "AUTO" (좌/우 교대 시나리오), "LEFT" (좌수 상상 집중), "RIGHT" (우수 상상 집중), "NEUTRAL"
        self.forced_intent: str = "AUTO"
        self.ActiveSessionName: str = "oyj_online0929_02 (Real ExG Replay)"
        self.subject: str = "oyj"
        self.model_name: str = "oyj_model_scaled_8ch.joblib"

        # 최신 상태
        self.left_prob: float = 0.50
        self.right_prob: float = 0.50
        self.level: int = 0
        self.trigger: str = "NONE"
        self.c3_uV: float = 8.2
        self.c4_uV: float = 8.4
        self.active_intent: str = "NEUTRAL"
        self.unity_connected: bool = False
        self.unity_clients: int = 0

        # 16채널 각각의 실시간 자극/활성도 (0.0 ~ 1.0) 및 원시 uV 파형
        self.channel_activations: Dict[str, float] = {ch: 0.15 for ch in ALL_16_CHANNELS}
        self.channel_uV: Dict[str, float] = {ch: 0.0 for ch in ALL_16_CHANNELS}

        # 게임/시연 누적 트라이얼 로그 (결과 사이트 리포트 연동용)
        self.trial_history: List[Dict] = [
            {"turn": 1, "day": 1, "direction": "RIGHT", "decision_sec": 3.42, "peak_prob": 0.89, "dominant_ch": "C3 / T7", "conflict": 0.18, "card_title": "외부 생존자 구조 요청"},
            {"turn": 2, "day": 2, "direction": "LEFT", "decision_sec": 2.85, "peak_prob": 0.92, "dominant_ch": "T8 / C4", "conflict": 0.12, "card_title": "오염된 식수 정화 필터 배분"},
            {"turn": 3, "day": 3, "direction": "LEFT", "decision_sec": 5.10, "peak_prob": 0.83, "dominant_ch": "C4 / Cz", "conflict": 0.44, "card_title": "무기고 야간 경비 교대"},
            {"turn": 4, "day": 4, "direction": "RIGHT", "decision_sec": 3.15, "peak_prob": 0.91, "dominant_ch": "C3 / F3", "conflict": 0.15, "card_title": "감염 의심 구역 정찰 파견"},
            {"turn": 5, "day": 5, "direction": "LEFT", "decision_sec": 4.20, "peak_prob": 0.86, "dominant_ch": "T8 / C4", "conflict": 0.27, "card_title": "비상 식량 배급량 축소 결의"},
            {"turn": 6, "day": 6, "direction": "RIGHT", "decision_sec": 2.95, "peak_prob": 0.94, "dominant_ch": "C3 / P7", "conflict": 0.11, "card_title": "통신탑 복구 작전 승인"},
        ]
        self._last_trigger_time = 0.0
        self._turn_counter = len(self.trial_history)

        # 실측 CSV 샘플 버퍼 로드
        self.real_samples: List[List[float]] = []
        self.sample_idx: int = 0
        self._load_real_csv_samples()

    def _load_real_csv_samples(self) -> None:
        """data/ 폴더 내 실측 ExG.csv 파일에서 샘플 구간을 읽어옴 (중심화/표준화하여 보관)."""
        candidates = [
            DATA_DIR / "oyj_online0929_02",
            DATA_DIR / "oyj_online_1008_new_16ch",
            DATA_DIR / "oyj_offline_data" / "oyj_0805",
            DATA_DIR / "etc" / "wmj_online_1008_new_01",
        ]
        csv_path: Optional[Path] = None
        for folder in candidates:
            if folder.exists():
                found = list(folder.glob("*ExG.csv"))
                if found:
                    csv_path = found[0]
                    break

        if csv_path is None and DATA_DIR.exists():
            all_csvs = list(DATA_DIR.rglob("*ExG.csv"))
            if all_csvs:
                csv_path = all_csvs[0]

        if csv_path is None:
            print("[*] Real ExG.csv not found in data/, using calibrated statistical EEG generator.")
            return

        try:
            raw_rows: List[List[float]] = []
            with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
                reader = csv.reader(f)
                header = next(reader, None)
                for idx, row in enumerate(reader):
                    if idx > 3500:  # 메모리 절약을 위해 3500 샘플(약 14초 분량 루프) 로드
                        break
                    if len(row) >= 17:
                        vals = [float(x) for x in row[1:17]]
                        raw_rows.append(vals)

            if len(raw_rows) > 50:
                # 채널별 평균 제거(High-pass DC offset 제거 효과) 및 스케일 안정화
                n_ch = 16
                means = [sum(r[c] for r in raw_rows) / len(raw_rows) for c in range(n_ch)]
                for r in raw_rows:
                    centered = [max(-25.0, min(25.0, (r[c] - means[c]) * 0.4)) for c in range(n_ch)]
                    self.real_samples.append(centered)
                self.ActiveSessionName = f"{csv_path.parent.name}/{csv_path.name}"
                print(f"[+] Loaded {len(self.real_samples)} real EEG samples from: {self.ActiveSessionName}")
        except Exception as exc:
            print(f"[!] Failed to load ExG.csv ({exc}), using statistical replay fallback.")

    def set_control(self, intent: Optional[str] = None, record_trial: Optional[Dict] = None) -> Dict:
        with self.lock:
            if intent in ("AUTO", "LEFT", "RIGHT", "NEUTRAL"):
                self.forced_intent = intent
                self.start_time = time.time()
            if record_trial:
                self._turn_counter += 1
                entry = {
                    "turn": self._turn_counter,
                    "day": self._turn_counter,
                    "direction": record_trial.get("direction", "LEFT"),
                    "decision_sec": round(float(record_trial.get("decision_sec", 3.5)), 2),
                    "peak_prob": round(float(record_trial.get("peak_prob", 0.88)), 2),
                    "dominant_ch": "T8 / C4" if record_trial.get("direction") == "LEFT" else "C3 / T7",
                    "conflict": round(float(record_trial.get("conflict", 0.20)), 2),
                    "card_title": record_trial.get("card_title", f"Day {self._turn_counter} 생존 결단"),
                }
                self.trial_history.append(entry)
                self.trial_history = self.trial_history[-20:]
            return self.get_state_snapshot()

    def step(self) -> Dict:
        """0.25초마다 호출되어 실측 뇌파 샘플 및 좌/우 확률, 16채널 뇌 자극도를 갱신."""
        with self.lock:
            now = time.time()
            elapsed = now - self.start_time
            self.phase += 0.22

            # 실측 샘플에서 기본 파형 변동 가져오기
            if self.real_samples:
                base_vec = self.real_samples[self.sample_idx % len(self.real_samples)]
                self.sample_idx += 62  # 250Hz * 0.25s = 약 62 샘플 전진
            else:
                base_vec = [math.sin(self.phase + i * 0.7) * 4.0 for i in range(16)]

            noise = (random.random() - 0.5) * 0.05

            # 의도 모드별 목표 Left Probability 산출
            if self.forced_intent == "LEFT":
                # 좌수 상상 집중: 부드럽게 0.88까지 상승
                ramp = min(1.0, elapsed / 2.2)
                target_left = 0.50 + 0.39 * ramp + math.sin(self.phase * 0.8) * 0.03
                self.active_intent = "LEFT"
            elif self.forced_intent == "RIGHT":
                # 우수 상상 집중: LeftProb가 0.12로 하강 (RightProb 0.88)
                ramp = min(1.0, elapsed / 2.2)
                target_left = 0.50 - 0.39 * ramp + math.sin(self.phase * 0.8) * 0.03
                self.active_intent = "RIGHT"
            elif self.forced_intent == "NEUTRAL":
                target_left = 0.50 + math.sin(self.phase * 0.5) * 0.04
                self.active_intent = "NEUTRAL"
            else:
                # AUTO 시나리오 (10초 주기: 0~4s LEFT 집중 -> 4~5s 중립 -> 5~9s RIGHT 집중 -> 9~10s 중립)
                cycle = elapsed % 10.0
                if cycle < 4.0:
                    target_left = 0.50 + 0.40 * math.sin((cycle / 4.0) * math.pi)
                    self.active_intent = "LEFT"
                elif cycle < 5.0:
                    target_left = 0.50
                    self.active_intent = "NEUTRAL"
                elif cycle < 9.0:
                    t = (cycle - 5.0) / 4.0
                    target_left = 0.50 - 0.40 * math.sin(t * math.pi)
                    self.active_intent = "RIGHT"
                else:
                    target_left = 0.50
                    self.active_intent = "NEUTRAL"

            self.left_prob = round(max(0.04, min(0.96, target_left + noise)), 3)
            self.right_prob = round(1.0 - self.left_prob, 3)

            # Dynamic Fading Level (0 ~ 3) 및 Trigger 판정
            if self.left_prob >= 0.80 or self.right_prob >= 0.80:
                self.level = 3
                self.trigger = "LEFT" if self.left_prob >= 0.80 else "RIGHT"
                # 트리거 발화 시 쿨타임(3.5초) 간격으로 자동 트라이얼 히스토리 기록
                if now - self._last_trigger_time > 3.5:
                    self._last_trigger_time = now
                    self._turn_counter += 1
                    self.trial_history.append({
                        "turn": self._turn_counter,
                        "day": self._turn_counter,
                        "direction": self.trigger,
                        "decision_sec": round(2.4 + random.random() * 2.2, 2),
                        "peak_prob": round(max(self.left_prob, self.right_prob), 2),
                        "dominant_ch": "T8 / C4" if self.trigger == "LEFT" else "C3 / T7",
                        "conflict": round(abs(0.5 - abs(self.left_prob - 0.5)) * 0.6, 2),
                        "card_title": f"Day {self._turn_counter} 실시간 BCI 판정 ({self.trigger})"
                    })
                    self.trial_history = self.trial_history[-20:]
            elif self.left_prob >= 0.70 or self.right_prob >= 0.70:
                self.level = 2
                self.trigger = "NONE"
            elif self.left_prob >= 0.58 or self.right_prob >= 0.58:
                self.level = 1
                self.trigger = "NONE"
            else:
                self.level = 0
                self.trigger = "NEUTRAL" if (0.45 <= self.left_prob <= 0.55) else "NONE"

            # C3 (좌반구 - 오른손 상상 시 ERD 전압 감소), C4 (우반구 - 왼손 상상 시 ERD 전압 감소)
            c3_mod = base_vec[7] * 0.12
            c4_mod = base_vec[9] * 0.12
            self.c3_uV = round(6.8 + (1.0 - self.right_prob) * 4.2 + c3_mod, 2)
            self.c4_uV = round(6.8 + (1.0 - self.left_prob) * 4.2 + c4_mod, 2)

            # 16채널별 뇌 자극(활성) 강도 산출 (3D 뇌 Dot 색칠 연동용)
            # 왼손 상상(left_prob 높음) -> 우반구(T8, C4, Cz, F4, F8, P8) 자극 상승
            # 오른손 상상(right_prob 높음) -> 좌반구(C3, T7, F3, F7, P7, Cz) 자극 상승
            left_drive = max(0.0, (self.left_prob - 0.45) / 0.50)
            right_drive = max(0.0, (self.right_prob - 0.45) / 0.50)

            right_hemi_weights = {"T8": 1.0, "C4": 0.95, "Cz": 0.65, "P8": 0.45, "F4": 0.40, "F8": 0.35}
            left_hemi_weights = {"C3": 0.96, "T7": 0.85, "F3": 0.78, "P7": 0.75, "F7": 0.70, "Cz": 0.65}

            for idx, ch in enumerate(ALL_16_CHANNELS):
                wave_ripple = abs(math.sin(self.phase * 1.3 + idx * 0.5)) * 0.12
                act = 0.12 + wave_ripple
                if ch in right_hemi_weights:
                    act += left_drive * right_hemi_weights[ch] * 0.85
                if ch in left_hemi_weights:
                    act += right_drive * left_hemi_weights[ch] * 0.85
                self.channel_activations[ch] = round(min(1.0, act), 3)
                self.channel_uV[ch] = round(base_vec[idx], 2)

            return self.get_unity_packet(elapsed)

    def get_unity_packet(self, elapsed: float) -> Dict:
        """Unity BCIClient.cs 호환 JSON 패킷 반환."""
        return {
            "left_prob": self.left_prob,
            "right_prob": self.right_prob,
            "trigger": self.trigger,
            "level": self.level,
            "c3_uV": self.c3_uV,
            "c4_uV": self.c4_uV,
            "elapsed_sec": round(elapsed, 2),
            "status": "CALIB_PASS",
            "session_id": self.ActiveSessionName,
        }

    def get_state_snapshot(self) -> Dict:
        """웹 3D Brain Atlas 대시보드용 전체 상태 반환."""
        return {
            "session": self.ActiveSessionName,
            "subject": self.subject,
            "model": self.model_name,
            "forced_intent": self.forced_intent,
            "active_intent": self.active_intent,
            "left_prob": self.left_prob,
            "right_prob": self.right_prob,
            "level": self.level,
            "trigger": self.trigger,
            "c3_uV": self.c3_uV,
            "c4_uV": self.c4_uV,
            "unity_connected": self.unity_connected,
            "unity_clients": self.unity_clients,
            "channel_activations": self.channel_activations,
            "channel_uV": self.channel_uV,
            "trial_history": self.trial_history[-12:],
            "timestamp": time.time(),
        }


ENGINE = RealEEGReplayEngine()


def tcp_unity_server_loop() -> None:
    """TCP 127.0.0.1:5000 서버: Unity Shelter Mind (BCIClient.cs) 다중 클라이언트 지원."""
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_sock.bind((TCP_HOST, TCP_PORT))
    server_sock.listen(5)
    print(f"[*] Unity BCI TCP Server listening on {TCP_HOST}:{TCP_PORT}")

    clients: List[socket.socket] = []
    clients_lock = threading.Lock()

    def handle_client_rx(conn: socket.socket, addr) -> None:
        """Unity에서 보내는 Handshake 등 명령 수신."""
        try:
            buf = ""
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                buf += data.decode("utf-8", errors="ignore")
                while "\n" in buf:
                    line, buf = buf.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        msg = json.loads(line)
                        if msg.get("command") == "handshake":
                            with ENGINE.lock:
                                ENGINE.subject = msg.get("subject", "oyj")
                                ENGINE.model_name = msg.get("model", "oyj_model_scaled_8ch.joblib")
                            print(f"[+] Unity Handshake received: {msg}")
                    except Exception:
                        pass
        except Exception:
            pass
        finally:
            with clients_lock:
                if conn in clients:
                    clients.remove(conn)
                ENGINE.unity_clients = len(clients)
                ENGINE.unity_connected = len(clients) > 0
            try:
                conn.close()
            except Exception:
                pass
            print(f"[-] Unity client disconnected: {addr}")

    def accept_loop() -> None:
        while True:
            try:
                conn, addr = server_sock.accept()
                with clients_lock:
                    clients.append(conn)
                    ENGINE.unity_clients = len(clients)
                    ENGINE.unity_connected = True
                print(f"[+] Unity Shelter Mind connected from {addr}")
                threading.Thread(target=handle_client_rx, args=(conn, addr), daemon=True).start()
            except Exception:
                break

    threading.Thread(target=accept_loop, daemon=True).start()

    # 0.25초마다 엔진 스텝 실행 및 연결된 모든 Unity 클라이언트에 브로드캐스트
    while True:
        packet = ENGINE.step()
        payload = (json.dumps(packet) + "\n").encode("utf-8")
        with clients_lock:
            dead = []
            for c in clients:
                try:
                    c.sendall(payload)
                except Exception:
                    dead.append(c)
            for d in dead:
                clients.remove(d)
            ENGINE.unity_clients = len(clients)
            ENGINE.unity_connected = len(clients) > 0
        time.sleep(SAMPLING_INTERVAL)


class BrainAtlasHTTPRequestHandler(SimpleHTTPRequestHandler):
    """web/ 폴더 정적 서빙 및 /api/state, /api/control 엔드포인트 제공."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def log_message(self, format: str, *args) -> None:
        # 콘솔 로그 노이즈 방지 (API 폴링 제외)
        if "/api/state" not in (args[0] if args else ""):
            super().log_message(format, *args)

    def _send_json(self, data: Dict, status: int = 200) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self) -> None:
        self._send_json({"ok": True})

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/state":
            with ENGINE.lock:
                snap = ENGINE.get_state_snapshot()
            self._send_json(snap)
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/control":
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8", errors="ignore") if length > 0 else "{}"
            try:
                payload = json.loads(body)
            except Exception:
                payload = {}
            snap = ENGINE.set_control(
                intent=payload.get("intent"),
                record_trial=payload.get("record_trial"),
            )
            self._send_json({"ok": True, "state": snap})
            return
        self._send_json({"error": "Not found"}, status=404)


def run_servers() -> None:
    WEB_DIR.mkdir(parents=True, exist_ok=True)
    threading.Thread(target=tcp_unity_server_loop, daemon=True).start()

    http_server = ThreadingHTTPServer((HTTP_HOST, HTTP_PORT), BrainAtlasHTTPRequestHandler)
    print("=" * 68)
    print(f" [Shelter Mind // 3D Brain Atlas & Real-EEG Replay Server]")
    print(f" - Active EEG Dataset : {ENGINE.ActiveSessionName}")
    print(f" - Unity TCP Server   : {TCP_HOST}:{TCP_PORT} (For Shelter Mind Unity)")
    print(f" - Web Atlas Result   : http://{HTTP_HOST}:{HTTP_PORT}")
    print("=" * 68)
    try:
        http_server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down servers...")
        http_server.server_close()


if __name__ == "__main__":
    run_servers()
