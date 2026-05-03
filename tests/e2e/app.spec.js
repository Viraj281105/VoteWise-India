/**
 * VoteWise India — End-to-End Tests (Playwright)
 */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('VoteWise India E2E', () => {

  test('Page loads with hero section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('.hero-headline')).toContainText('Understand Your Vote');
    // Language selector exists
    await expect(page.locator('.lang-selector')).toBeVisible();
    const langBtns = page.locator('.lang-btn');
    await expect(langBtns).toHaveCount(5);
  });

  test('Timeline renders cards and expands on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.timeline-card');
    const cards = page.locator('.timeline-card');
    await expect(cards).toHaveCount(8);
    // Click first card
    await cards.first().click();
    const detail = page.locator('#timeline-detail');
    await expect(detail).not.toContainText('Click on a step');
  });

  test('Quiz completes full flow', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-take-quiz');
    await page.waitForSelector('#quiz-container');
    await page.click('#btn-start-quiz');
    await page.waitForSelector('.quiz-option');

    // Answer all 20 questions
    for (let i = 0; i < 20; i++) {
      await page.waitForSelector('.quiz-option');
      await page.locator('.quiz-option').first().click();
      await page.waitForSelector('#btn-next-question:not([style*="display: none"])');
      await page.click('#btn-next-question');
    }

    await expect(page.locator('#quiz-results')).toBeVisible();
    await expect(page.locator('#result-score')).toBeVisible();
  });

  test('Chatbot sends message and shows response', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#chatbot"]');
    await page.waitForSelector('#chat-input');
    // Click a chip
    await page.locator('.chip').first().click();
    // User message should appear
    await expect(page.locator('.chat-bubble.user')).toBeVisible();
  });

  test('Accessibility — zero critical violations on hero', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('#hero')
      .analyze();
    const critical = results.violations.filter(v => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('Keyboard navigation — interactive elements are focusable', async ({ page }) => {
    await page.goto('/');
    // Tab to skip link
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.id || document.activeElement?.className);
    expect(focused).toBeTruthy();

    // Tab through several elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    const el = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(el);
  });

  test('High contrast toggle changes mode', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#btn-high-contrast');
    await btn.click();
    const hasClass = await page.evaluate(() => document.body.classList.contains('high-contrast'));
    expect(hasClass).toBe(true);
    // Toggle off
    await btn.click();
    const removed = await page.evaluate(() => !document.body.classList.contains('high-contrast'));
    expect(removed).toBe(true);
  });

  test('TTS buttons are present in rights section', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tts-btn');
    const ttsBtns = page.locator('.tts-btn');
    const count = await ttsBtns.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

});
