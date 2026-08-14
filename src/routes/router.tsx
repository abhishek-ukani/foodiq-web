import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PageLoader } from '@/components/common/page-loader'
import { ProtectedRoute } from '@/components/common/protected-route'
import { GuestRoute } from '@/components/common/guest-route'
import { NotFoundPage } from '@/components/common/not-found-page'
import { MainLayout } from '@/layouts/main-layout'
import { ROUTES } from '@/constants'

const HomePage = lazy(() =>
  import('@/features/home/components/home-page').then((m) => ({ default: m.HomePage })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/components/login-page').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/components/register-page').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/components/forgot-password-page').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/components/reset-password-page').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const VerifyEmailPage = lazy(() =>
  import('@/features/auth/components/verify-email-page').then((m) => ({
    default: m.VerifyEmailPage,
  })),
)
const AccountPage = lazy(() =>
  import('@/features/profile/components/account-page').then((m) => ({ default: m.AccountPage })),
)
const MenuPage = lazy(() =>
  import('@/features/menu/components/menu-page').then((m) => ({ default: m.MenuPage })),
)
const ProductDetailPage = lazy(() =>
  import('@/features/menu/components/product-detail-page').then((m) => ({
    default: m.ProductDetailPage,
  })),
)
const CartPage = lazy(() =>
  import('@/features/cart/components/cart-page').then((m) => ({ default: m.CartPage })),
)
const CheckoutPage = lazy(() =>
  import('@/features/checkout/components/checkout-page').then((m) => ({ default: m.CheckoutPage })),
)
const OrderSuccessPage = lazy(() =>
  import('@/features/orders/components/order-success-page').then((m) => ({
    default: m.OrderSuccessPage,
  })),
)
const OrderHistoryPage = lazy(() =>
  import('@/features/orders/components/order-history-page').then((m) => ({
    default: m.OrderHistoryPage,
  })),
)
const OrderDetailPage = lazy(() =>
  import('@/features/orders/components/order-detail-page').then((m) => ({
    default: m.OrderDetailPage,
  })),
)
const AboutPage = lazy(() =>
  import('@/features/static-pages/components/about-page').then((m) => ({ default: m.AboutPage })),
)
const ContactPage = lazy(() =>
  import('@/features/static-pages/components/contact-page').then((m) => ({
    default: m.ContactPage,
  })),
)
const FaqPage = lazy(() =>
  import('@/features/static-pages/components/faq-page').then((m) => ({ default: m.FaqPage })),
)
const PrivacyPolicyPage = lazy(() =>
  import('@/features/static-pages/components/privacy-policy-page').then((m) => ({
    default: m.PrivacyPolicyPage,
  })),
)
const TermsPage = lazy(() =>
  import('@/features/static-pages/components/terms-page').then((m) => ({ default: m.TermsPage })),
)
const RefundPolicyPage = lazy(() =>
  import('@/features/static-pages/components/refund-policy-page').then((m) => ({
    default: m.RefundPolicyPage,
  })),
)

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: withSuspense(<HomePage />) },
      { path: ROUTES.menu, element: withSuspense(<MenuPage />) },
      { path: ROUTES.menuItem(':slug'), element: withSuspense(<ProductDetailPage />) },
      {
        path: ROUTES.cart,
        element: withSuspense(
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: ROUTES.checkout,
        element: withSuspense(
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: ROUTES.orderSuccess(':id'),
        element: withSuspense(
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: ROUTES.orders,
        element: withSuspense(
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: ROUTES.orderDetail(':id'),
        element: withSuspense(
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>,
        ),
      },
      { path: ROUTES.about, element: withSuspense(<AboutPage />) },
      { path: ROUTES.contact, element: withSuspense(<ContactPage />) },
      { path: ROUTES.faq, element: withSuspense(<FaqPage />) },
      { path: ROUTES.privacy, element: withSuspense(<PrivacyPolicyPage />) },
      { path: ROUTES.terms, element: withSuspense(<TermsPage />) },
      { path: ROUTES.refund, element: withSuspense(<RefundPolicyPage />) },
      {
        path: ROUTES.profile,
        element: withSuspense(
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>,
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: ROUTES.login,
    element: withSuspense(
      <GuestRoute>
        <LoginPage />
      </GuestRoute>,
    ),
  },
  {
    path: ROUTES.register,
    element: withSuspense(
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>,
    ),
  },
  {
    path: ROUTES.forgotPassword,
    element: withSuspense(
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>,
    ),
  },
  {
    // Reachable via the recovery-link redirect regardless of current session state.
    path: ROUTES.resetPassword,
    element: withSuspense(<ResetPasswordPage />),
  },
  {
    path: ROUTES.verifyEmail,
    element: withSuspense(<VerifyEmailPage />),
  },
])
