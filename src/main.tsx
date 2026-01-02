import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// Log environment status for debugging
console.log('Africoin Wallet - Environment check:', {
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  hasAlchemyKey: !!import.meta.env.VITE_ALCHEMY_API_KEY,
  hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
});

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

