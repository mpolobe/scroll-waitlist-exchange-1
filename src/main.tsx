import { createRoot } from 'react-dom/client'
import './index.css'

// Log environment status
console.log('App initializing...');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('VITE_ALCHEMY_API_KEY:', import.meta.env.VITE_ALCHEMY_API_KEY ? 'SET' : 'NOT SET');

// Wrap initialization in try-catch to show errors instead of white screen
const renderApp = async () => {
  try {
    const { default: App } = await import('./App.tsx');
    
    const root = document.getElementById("root");
    if (!root) {
      throw new Error('Root element not found');
    }
    
    createRoot(root).render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Show error on screen instead of white screen
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">App Failed to Load</h1>
          <p style="color: #666;">An error occurred during initialization:</p>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 14px;">${error instanceof Error ? error.message : String(error)}</pre>
          <p style="color: #666; margin-top: 16px;">Stack trace:</p>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 12px; color: #666;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Reload App
          </button>
        </div>
      `;
    }
  }
};

renderApp();

// Build trigger 1768429137
// Build trigger 1769023952
