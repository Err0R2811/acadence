import { test, expect } from '@playwright/test';

test.describe('Attendance Calculator', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home');
    });

    test('should display the dashboard with all key elements', async ({ page }) => {
        // Header with logo - use role instead of text to avoid duplicates
        await expect(page.getByRole('heading', { name: 'ACADENCE' })).toBeVisible();

        // Target badge
        await expect(page.getByText(/Target: \d+%/)).toBeVisible();

        // Calculator card
        await expect(page.getByRole('heading', { name: 'Attendance Calculator' })).toBeVisible();
        await expect(page.getByText('Total Conducted')).toBeVisible();
        await expect(page.getByText('Calculate Status')).toBeVisible();

        // Bottom navigation
        await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'History' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    test('should show error for empty inputs', async ({ page }) => {
        await page.getByText('Calculate Status').click();
        await page.waitForTimeout(500);

        await expect(page.getByText('Please enter valid numbers')).toBeVisible();
    });

    test('should toggle custom target input', async ({ page }) => {
        // Default target should show
        await expect(page.getByText('College Default Target (75%)')).toBeVisible();

        // Toggle off default
        await page.locator('[role="switch"]').first().click();

        // Custom input should appear
        await expect(page.getByText('Custom Target (%)')).toBeVisible();
    });

    test('should navigate to history page', async ({ page }) => {
        await page.getByRole('link', { name: 'History' }).click();
        await expect(page).toHaveURL(/\/history/);
        // Check for history page heading
        await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
        await page.getByRole('link', { name: 'Settings' }).click();
        await expect(page).toHaveURL(/\/settings/);
        await expect(page.getByText('Customize your experience')).toBeVisible();
    });
});
