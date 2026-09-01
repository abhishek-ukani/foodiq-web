import type { MealType, OrderStatus } from '@/types/database.types'

export const ROUTES = {
  home: '/',
  menu: '/menu',
  menuItem: (slug: string) => `/menu/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  orderSuccess: (id: string) => `/orders/${id}/success`,
  orders: '/orders',
  orderDetail: (id: string) => `/orders/${id}`,
  favorites: '/favorites',
  notifications: '/notifications',
  profile: '/profile',
  addresses: '/profile/addresses',
  settings: '/profile/settings',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy-policy',
  terms: '/terms',
  refund: '/refund-policy',
} as const

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
]

/** Display metadata for every order state, shared by badges and the timeline. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; description: string; tone: 'neutral' | 'info' | 'success' | 'danger' }
> = {
  pending: {
    label: 'Pending',
    description: 'Waiting for the kitchen to confirm your order.',
    tone: 'neutral',
  },
  accepted: {
    label: 'Accepted',
    description: 'Your order is confirmed.',
    tone: 'info',
  },
  preparing: {
    label: 'Preparing',
    description: 'Your meal is being cooked fresh.',
    tone: 'info',
  },
  ready: {
    label: 'Ready',
    description: 'Packed and waiting for pickup.',
    tone: 'info',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    description: 'On the way to your address.',
    tone: 'info',
  },
  delivered: {
    label: 'Delivered',
    description: 'Enjoy your meal!',
    tone: 'success',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    tone: 'danger',
  },
  rejected: {
    label: 'Rejected',
    description: 'The kitchen could not accept this order.',
    tone: 'danger',
  },
}

/** The forward-only path an order travels; used to render progress timelines. */
export const ORDER_TIMELINE: OrderStatus[] = [
  'pending',
  'accepted',
  'ready',
  'out_for_delivery',
  'delivered',
]

export const QUERY_KEYS = {
  session: ['session'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  categories: ['categories'] as const,
  foodItem: (slug: string) => ['food-item', slug] as const,
  dailyMenu: (date: string, meal?: MealType) => ['daily-menu', date, meal ?? 'all'] as const,
  cart: ['cart'] as const,
  addresses: ['addresses'] as const,
  deliverySlots: ['delivery-slots'] as const,
  deliveryAreas: ['delivery-areas'] as const,
  orders: (filters?: Record<string, unknown>) => ['orders', filters ?? {}] as const,
  order: (id: string) => ['order', id] as const,
  favorites: ['favorites'] as const,
  notifications: ['notifications'] as const,
  banners: (placement: string) => ['banners', placement] as const,
  testimonials: ['testimonials'] as const,
  todaysSpecial: ['todays-special'] as const,
  allActiveItems: ['all-active-items'] as const,
  popularItems: (limit: number) => ['popular-items', limit] as const,
  faqs: ['faqs'] as const,
  policy: (slug: string) => ['policy', slug] as const,
  systemConfig: ['system-config'] as const,
  upiQr: ['upi-qr'] as const,
} as const

export const CURRENCY_SYMBOL = '₹'
export const DATE_FORMAT = 'DD MMM YYYY'
export const DATE_TIME_FORMAT = 'DD MMM YYYY, h:mm A'
export const API_DATE_FORMAT = 'YYYY-MM-DD'
