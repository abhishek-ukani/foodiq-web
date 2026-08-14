import { expect, test } from '@playwright/test'

const PROTECTED_PATHS = ['/profile', '/cart', '/checkout', '/orders']

for (const path of PROTECTED_PATHS) {
  test(`${path} redirects to /login when signed out`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login/)
  })
}

test('login page is directly reachable when signed out', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})

test('reset-password shows an expired-link state with no recovery session', async ({ page }) => {
  await page.goto('/reset-password')
  await expect(page.getByText('Link expired')).toBeVisible()
})
