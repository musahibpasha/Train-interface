import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://zehtfqkbllzfbbqkoctm.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplaHRmcWtibGx6ZmJicWtvY3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDE2NjEsImV4cCI6MjA1ODMxNzY2MX0.wVEdlL4oPTRMX0tivVTau1vx-f79khl8QYQ3wObbZq0')
  }
})
