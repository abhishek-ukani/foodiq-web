import { expect, test } from '@playwright/test'

const PUBLIC_PAGES = [
  ['/', 'Homemade tiffin'],
  ['/menu', "Today's Menu"],
  ['/about', 'About FoodIQ'],
  ['/contact', 'Get in touch'],
  ['/faq', 'Frequently Asked Questions'],
  ['/privacy-policy', null],
  ['/terms', null],
  ['/refund-policy', null],
] as const

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`public pages (${scheme})`, () => {
    test.use({ colorScheme: scheme })

    for (const [path, heading] of PUBLIC_PAGES) {
      test(`${path} loads without a console error`, async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(String(e)))

        await page.goto(path)
        await page.waitForLoadState('networkidle')

        if (heading) {
          await expect(page.getByText(heading, { exact: false }).first()).toBeVisible()
        }
        expect(errors).toEqual([])
      })
    }
  })
}

test('an unknown route renders the 404 page instead of a blank screen', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page.getByText('Page not found')).toBeVisible()
})
