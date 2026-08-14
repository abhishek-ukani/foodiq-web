function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
  appName: import.meta.env.VITE_APP_NAME || 'FoodIQ',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  orderCutoffHour: Number(import.meta.env.VITE_ORDER_CUTOFF_HOUR ?? 20),
  defaultCurrency: import.meta.env.VITE_DEFAULT_CURRENCY || 'INR',
} as const
