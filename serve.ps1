# 大肥鱼 · 学习系统 —— 本地服务器
# 双击这个文件（右键 → 用 PowerShell 运行），然后在手机上打开显示的地址
$ErrorActionPreference = 'SilentlyContinue'
Set-Location $PSScriptRoot

$port = 8080
$ips = @()
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'
} | ForEach-Object { $ips += $_.IPAddress }

Write-Host ''
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host '    大肥鱼 · 学习系统   本地服务已启动' -ForegroundColor Cyan
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host ''
Write-Host "  电脑打开：  http://localhost:$port" -ForegroundColor Green
foreach ($ip in $ips) {
  Write-Host "  手机打开：  http://${ip}:$port" -ForegroundColor Yellow
}
Write-Host ''
Write-Host '  手机要和电脑连同一个 Wi-Fi。' -ForegroundColor DarkGray
Write-Host '  第一次运行 Windows 会弹防火墙提示，点「允许访问」。' -ForegroundColor DarkGray
Write-Host '  关掉这个窗口服务就停了；进度存在手机浏览器里，不会丢。' -ForegroundColor DarkGray
Write-Host ''

Start-Process "http://localhost:$port"

if (Get-Command python -ErrorAction SilentlyContinue) {
  python -m http.server $port
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
  py -m http.server $port
} else {
  Write-Host '  没有找到 Python。装一个，或用 VS Code 的 Live Server 插件打开。' -ForegroundColor Red
  Read-Host '  按回车退出'
}
