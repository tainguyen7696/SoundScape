@echo off
REM ====================================================
REM build ios
REM Automates:
REM   1) bumping the iOS buildNumber
REM   2) EAS build for iOS (TestFlight)
REM Pauses on error so you can inspect logs.
REM ====================================================

SETLOCAL

REM === Bump iOS buildNumber ===
echo.
echo ========================================
echo Bumping iOS build number...
echo ========================================
REM assumes increment-build-number.cjs sits next to this .bat
node "%~dp0increment-build-number.cjs"
IF ERRORLEVEL 1 (
  echo.
  echo [ERROR] build-number bump failed. Aborting.
  pause
  ENDLOCAL
  EXIT /B 1
)

REM === iOS Build ===
echo.
echo ========================================
echo Building iOS (profile: testflight)...
echo ========================================
eas build --platform ios --profile testflight --non-interactive
IF ERRORLEVEL 1 (
  echo.
  echo [ERROR] iOS build failed. Aborting.
  pause
  ENDLOCAL
  EXIT /B 1
)

ENDLOCAL
pause
