@echo off
echo Setting up Airwallex environment...

echo USE_FALLBACK_MODE=false > .env
echo AIRWALLEX_ENV=demo >> .env
echo PORT=5000 >> .env

echo.
echo Please complete the .env file with your Airwallex credentials:
echo 1. Open the .env file in the server directory
echo 2. Add your AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY
echo 3. Save the file and restart the server
echo.

echo For testing with Airwallex, you need to:
echo 1. Ensure both backend (port 5000) and frontend (port 3000) are running
echo 2. Go through the checkout flow on the frontend
echo 3. You should be redirected to the Airwallex hosted payment page
echo 4. After payment, you'll be redirected back to the success page
echo.

pause
