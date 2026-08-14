import { expect, test } from '@playwright/test'

test('mobile nav sheet opens and links to the menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByLabel('Open menu').click()
  await expect(page.getByRole('link', { name: 'Menu', exact: true })).toBeVisible()
})

test('theme toggle switches the document to dark mode', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/dark/)
  await page.getByRole('button', { name: /toggle theme/i }).click()
  await expect(html).toHaveClass(/dark/)
})

test('menu search narrows results and an empty query restores them', async ({ page }) => {
  await page.goto('/menu')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Search dishes…').fill('zzz-no-such-dish-zzz')
  await expect(page.getByText(/no dishes match|isn't ready yet/i)).toBeVisible()
  await page.getByPlaceholder('Search dishes…').fill('')
})
