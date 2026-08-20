@echo off
echo ===================================================
echo FIESTO WEBSITE LAUNCHER
echo ===================================================
echo.
echo Please wait while we install the required packages.
echo This might take a minute or two...
echo.
call npm install --legacy-peer-deps
echo.
echo Installation complete! Starting the development server...
echo.
echo Once the server starts, open your browser to:
echo http://localhost:3000/festivals
echo.
echo Keep this window open to keep the website running!
echo ===================================================
call npm run dev
pause
