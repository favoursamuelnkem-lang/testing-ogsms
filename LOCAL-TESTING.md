# OGSMS testing

The frontend now uses same-origin API calls by default. That means the same build can run locally at `http://localhost:5000` and on Render without changing the JavaScript API URL.

Set `APP_BASE_URL` to the public Render URL in production so password-reset and welcome-back email links point to the live site.

Customer UI includes dashboard, wallet, number purchase, purchase history, SMS inbox, support, profile/settings, notifications, login, registration, forgot password and reset password.
