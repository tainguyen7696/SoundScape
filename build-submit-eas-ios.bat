@echo off
REM ====================================================
REM build_and_submit.bat
REM Automates EAS build + submit for iOS (TestFlight)
REM Pauses on error to let you inspect logs.
REM ====================================================

SETLOCAL

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
echo ✅ All builds and submissions succeeded!
echo ========================================
ENDLOCAL
pause
