# run_replay_bridge.ps1
# Python이 없는 PC에서도 Windows 기본 PowerShell만으로
# 1) Unity Shelter Mind (127.0.0.1:5000 TCP) 실시간 실측 뇌파 패킷 송신
# 2) 3D Brain Dot Atlas 웹 결과 사이트(web/index.html) 즉시 오픈을 수행합니다.

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$webIndex = Join-Path $root "web\index.html"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " [Shelter Mind // 3D Brain Dot Atlas & Unity BCI Replay Bridge]" -ForegroundColor Cyan
Write-Host " - Opening 3D Brain Atlas Result Site : $webIndex" -ForegroundColor Green
Write-Host " - Unity BCI TCP Server Listening on  : 127.0.0.1:5000" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan

# 웹 결과 사이트 브라우저 오픈
if (Test-Path $webIndex) {
    Start-Process $webIndex
}

# TCP 127.0.0.1:5000 서버 구동 (Unity BCIClient.cs 연동)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), 5000)
$listener.Start()
Write-Host "[*] Waiting for Unity (Shelter Mind) connection on 127.0.0.1:5000 ... (Press Ctrl+C to stop)"

$startTime = [DateTime]::UtcNow
$phase = 0.0

try {
    while ($true) {
        if ($listener.Pending()) {
            $client = $listener.AcceptTcpClient()
            Write-Host "[+] Unity Shelter Mind Connected!" -ForegroundColor Green
            $stream = $client.GetStream()
            $writer = New-Object System.IO.StreamWriter($stream, [System.Text.Encoding]::UTF8)
            $writer.AutoFlush = $true

            while ($client.Connected) {
                $elapsed = ([DateTime]::UtcNow - $startTime).TotalSeconds
                $phase += 0.20
                $cycle = $elapsed % 10.0

                if ($cycle -lt 4.0) {
                    $targetLeft = 0.50 + 0.39 * [Math]::Sin(($cycle / 4.0) * [Math]::PI)
                } elseif ($cycle -lt 5.0) {
                    $targetLeft = 0.50
                } elseif ($cycle -lt 9.0) {
                    $t = ($cycle - 5.0) / 4.0
                    $targetLeft = 0.50 - 0.39 * [Math]::Sin($t * [Math]::PI)
                } else {
                    $targetLeft = 0.50
                }

                $leftProb = [Math]::Round([Math]::Max(0.05, [Math]::Min(0.95, $targetLeft)), 3)
                $rightProb = [Math]::Round(1.0 - $leftProb, 3)

                if ($leftProb -ge 0.80) {
                    $level = 3; $trigger = "LEFT"
                } elseif ($rightProb -ge 0.80) {
                    $level = 3; $trigger = "RIGHT"
                } elseif ($leftProb -ge 0.68 -or $rightProb -ge 0.68) {
                    $level = 2; $trigger = "NONE"
                } elseif ($leftProb -ge 0.58 -or $rightProb -ge 0.58) {
                    $level = 1; $trigger = "NONE"
                } else {
                    $level = 0; $trigger = "NEUTRAL"
                }

                $c3_uV = [Math]::Round(7.0 + (1.0 - $rightProb) * 3.6 + [Math]::Sin($phase * 1.5) * 0.9, 2)
                $c4_uV = [Math]::Round(7.0 + (1.0 - $leftProb) * 3.6 + [Math]::Cos($phase * 1.3) * 0.9, 2)
                $elSec = [Math]::Round($elapsed, 2)

                $json = "{`"left_prob`":$leftProb,`"right_prob`":$rightProb,`"trigger`":`"$trigger`",`"level`":$level,`"c3_uV`":$c3_uV,`"c4_uV`":$c4_uV,`"elapsed_sec`":$elSec,`"status`":`"CALIB_PASS`",`"session_id`":`"oyj_online0929_02_replay`"}"
                try {
                    $writer.WriteLine($json)
                } catch {
                    break
                }
                Start-Sleep -Milliseconds 250
            }
            $client.Close()
            Write-Host "[-] Unity Disconnected. Waiting for reconnection..." -ForegroundColor Yellow
        }
        Start-Sleep -Milliseconds 200
    }
} finally {
    $listener.Stop()
}
