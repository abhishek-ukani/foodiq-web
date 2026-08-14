import { expect, test } from '@playwright/test'

test('register shows field-level errors on empty submit', async ({ page }) => {
  await page.goto('/register')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.locator('[role="alert"], .text-destructive').first()).toBeVisible()
})

test('register catches a password/confirm-password mismatch', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Full name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Mobile number').fill('9876543210')
  await page.getByLabel('Password', { exact: true }).fill('abc12345')
  await page.getByLabel('Confirm password').fill('different123')
  await page.getByRole('button', { name: /create account/i }).click()
  await expect(page.getByText(/passwords do not match/i)).toBeVisible()
})

test('login rejects an empty password', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('someone@example.com')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText('Password is required')).toBeVisible()
})

test('forgot-password requires an email', async ({ page }) => {
  await page.goto('/forgot-password')
  await page.getByRole('button', { name: /send reset link/i }).click()
  await expect(page.getByText('Email is required')).toBeVisible()
})

test('contact form requires a longer message', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: /send message/i }).click()
  const errorCount = await page.locator('.text-destructive').count()
  expect(errorCount).toBeGreaterThan(0)
})
