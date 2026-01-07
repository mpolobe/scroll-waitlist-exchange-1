import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// Validate environment configuration
if (import.meta.env.DEV) {
  const missingVars = [];
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
  if (!import.meta.env.VITE_ALCHEMY_API_KEY) missingVars.push('VITE_ALCHEMY_API_KEY');
  if (!import.meta.env.VITE_GEMINI_API_KEY) missingVars.push('VITE_GEMINI_API_KEY');
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
  }
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

