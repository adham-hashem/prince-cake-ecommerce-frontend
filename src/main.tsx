// In src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';
import './index.css'; // Assuming you have a main css file


// Make sure your .env file is configured correctly
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId) {
  console.error("VITE_GOOGLE_CLIENT_ID is not set in your environment variables. Google Login will not work.");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* This Provider loads the Google script once for your whole app */}
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
      {/* Vercel Analytics - Tracks page views automatically */}
      <Analytics />
      {/* Vercel Speed Insights - Tracks performance metrics */}
      <SpeedInsights />
    </GoogleOAuthProvider>
  </React.StrictMode>
);