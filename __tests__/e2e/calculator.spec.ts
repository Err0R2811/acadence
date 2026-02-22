import { test, expect } from '@playwright/test';

test.describe('Attendance Calculator', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home');
    });

    test('should display the dashboard with all key elements', async ({ page }) => {
        // Header
        await expect(page.getByText('Attendance Tracker')).toBeVisible();
        await expect(page.getByText('Keep your streak alive')).toBeVisible();

        // Target badge
        await expect(page.getByText(/Target: \d+%/)).toBeVisible();

        // Calculator card
        await expect(page.getByText('Attendance Calculator')).toBeVisible();
        await expect(page.getByPlaceholder('e.g. Mathematics')).toBeVisible();
        await expect(page.getByText('Calculate Status')).toBeVisible();

        // Bottom navigation
        await expect(page.getByText('Home')).toBeVisible();
        await expect(page.getByText('History')).toBeVisible();
        await expect(page.getByText('Settings')).toBeVisible();
    });

    test('should calculate attendance above target', async ({ page }) => {
        // Fill inputs
        await page.getByPlaceholder('e.g. Mathematics').fill('Mathematics');
        await page.locator('input[placeholder="0"]').first().fill('100');
        await page.locator('input[placeholder="0"]').last().fill('80');

        // Calculate
        await page.getByText('Calculate Status').click();

        // Wait for result
        await page.waitForTimeout(500);

        // Verify result
        await expect(page.getByText('80.0%')).toBeVisible();
        await expect(page.getByText('Above Target')).toBeVisible();
        await expect(page.getByText(/can miss \d+ more/)).toBeVisible();
    });

    test('should calculate attendance below target', async ({ page }) => {
        await page.getByPlaceholder('e.g. Mathematics').fill('Physics');
        await page.locator('input[placeholder="0"]').first().fill('100');
        await page.locator('input[placeholder="0"]').last().fill('60');

        await page.getByText('Calculate Status').click();
        await page.waitForTimeout(500);

        await expect(page.getByText('60.0%')).toBeVisible();
        await expect(page.getByText('Below Target')).toBeVisible();
        await expect(page.getByText(/Need to attend \d+ more/)).toBeVisible();
    });

    test('should show error for invalid input (attended > conducted)', async ({ page }) => {
        await page.getByPlaceholder('e.g. Mathematics').fill('Chemistry');
        await page.locator('input[placeholder="0"]').first().fill('50');
        await page.locator('input[placeholder="0"]').last().fill('60');

        await page.getByText('Calculate Status').click();
        await page.waitForTimeout(500);

        await expect(page.getByText('Attended cannot exceed conducted')).toBeVisible();
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

    test('should add calculation to recent list', async ({ page }) => {
        await page.getByPlaceholder('e.g. Mathematics').fill('Biology');
        await page.locator('input[placeholder="0"]').first().fill('80');
        await page.locator('input[placeholder="0"]').last().fill('65');

        await page.getByText('Calculate Status').click();
        await page.waitForTimeout(500);

        // Recent section should appear
        await expect(page.getByText('Recent Calculations')).toBeVisible();
        await expect(page.getByText('Biology')).toBeVisible();
    });

    test('should navigate to history page', async ({ page }) => {
        await page.getByRole('link', { name: 'History' }).click();
        await expect(page).toHaveURL(/\/history/);
        await expect(page.getByText('Your past calculations')).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
        await page.getByRole('link', { name: 'Settings' }).click();
        await expect(page).toHaveURL(/\/settings/);
        await expect(page.getByText('Customize your experience')).toBeVisible();
    });
});
