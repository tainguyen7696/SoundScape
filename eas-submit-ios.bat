@echo off
REM ====================================================
REM submit ios
REM Automates:
REM   1) EAS submit to TestFlight
REM Pauses on error so you can inspect logs.
REM ====================================================

REM === iOS Submit ===
echo.
echo ========================================
echo Submitting iOS to TestFlight...
echo ========================================
eas submit --platform ios --profile testflight --non-interactive
IF ERRORLEVEL 1 (
  echo.
  echo [ERROR] iOS submit failed. Aborting.
  pause
  ENDLOCAL
  EXIT /B 1
)

echo.
echo ========================================
echo ✅ All steps succeeded!
echo ========================================
ENDLOCAL
pause