@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js не знайдено. Встановіть LTS з https://nodejs.org і запустіть цей файл знову.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Перший запуск: встановлюю залежності...
  call npm install
)
if not exist node_modules\electron\dist\electron.exe (
  echo Докачую Electron...
  set "ELECTRON_SKIP_BINARY_DOWNLOAD="
  set "ELECTRON_OVERRIDE_DIST_PATH="
  rmdir /s /q node_modules\electron\dist 2>nul
  node node_modules\electron\install.js
)
if not exist node_modules\electron\dist\electron.exe (
  echo Стандартна розпаковка не спрацювала. Розпаковую засобами Windows...
  set "EZIP="
  for /r "%LOCALAPPDATA%\electron\Cache" %%f in (electron-v*-win32-x64.zip) do set "EZIP=%%f"
  if defined EZIP (
    echo Архів: !EZIP!
    rmdir /s /q node_modules\electron\dist 2>nul
    mkdir node_modules\electron\dist
    tar -xf "!EZIP!" -C node_modules\electron\dist
    powershell -NoProfile -Command "[IO.File]::WriteAllText((Join-Path (Get-Location) 'node_modules\electron\path.txt'),'electron.exe')"
  ) else (
    echo Архів Electron у кеші не знайдено: %LOCALAPPDATA%\electron\Cache
  )
)
if not exist node_modules\electron\dist\electron.exe (
  echo.
  echo Electron все ще не встановився. Надішліть цей екран розробнику.
  pause
  exit /b 1
)
call npm start
if errorlevel 1 pause
