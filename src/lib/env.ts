function getEnv(key: keyof ImportMetaEnv, fallback = ''): string {
  const value = import.meta.env[key]
  if (!value) {
    return fallback
  }
  return value
}

export const env = {
  supabaseUrl: getEnv('VITE_SUPABASE_URL', 'https://placeholder.supabase.co'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY', 'placeholder-anon-key'),
  appName: getEnv('VITE_APP_NAME', 'FoodIQ'),
  appUrl: getEnv('VITE_APP_URL', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'),
} as const
