import { test, expect } from '@playwright/test';

test.describe('Notespad – e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the app title and empty state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Notespad' })).toBeVisible();
    await expect(page.getByText(/there are no notes yet/i)).toBeVisible();
  });

  test('user can add a note', async ({ page }) => {
    await page.getByLabel(/^title$/i).fill('Groceries');
    await page.getByLabel(/^description$/i).fill('Milk, bread, eggs');
    await page.getByRole('button', { name: /add note/i }).click();

    await expect(page.getByText('Groceries')).toBeVisible();
    await expect(page.getByText('Milk, bread, eggs')).toBeVisible();
    await expect(page.getByText(/there are no notes yet/i)).not.toBeVisible();
    await expect(page.getByText(/notes history \(1\)/i)).toBeVisible();
  });

  test('user can add multiple notes and delete one', async ({ page }) => {
    const titleField = page.getByLabel(/^title$/i);
    const descField = page.getByLabel(/^description$/i);
    const submit = page.getByRole('button', { name: /add note/i });

    await titleField.fill('First');
    await descField.fill('one');
    await submit.click();

    await titleField.fill('Second');
    await descField.fill('two');
    await submit.click();

    await expect(page.getByText('First')).toBeVisible();
    await expect(page.getByText('Second')).toBeVisible();

    await page.getByRole('button', { name: /delete note: first/i }).click();

    await expect(page.getByText('First')).not.toBeVisible();
    await expect(page.getByText('Second')).toBeVisible();
  });

  test('does not submit when fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: /add note/i }).click();
    await expect(page.getByText(/there are no notes yet/i)).toBeVisible();
  });

  test('persists notes after reload', async ({ page }) => {
    await page.getByLabel(/^title$/i).fill('Persistent');
    await page.getByLabel(/^description$/i).fill('survives reload');
    await page.getByRole('button', { name: /add note/i }).click();

    await page.reload();

    await expect(page.getByText('Persistent')).toBeVisible();
    await expect(page.getByText('survives reload')).toBeVisible();
  });

  test('user can edit a note', async ({ page }) => {
    await page.getByLabel(/^title$/i).fill('Original');
    await page.getByLabel(/^description$/i).fill('body');
    await page.getByRole('button', { name: /add note/i }).click();

    await page.getByRole('button', { name: /edit note: original/i }).click();

    const titleField = page.getByLabel(/^title$/i);
    await titleField.fill('Updated title');
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText('Updated title')).toBeVisible();
    await expect(page.getByText('Original')).not.toBeVisible();
  });

  test('search filters notes', async ({ page }) => {
    const titleField = page.getByLabel(/^title$/i);
    const descField = page.getByLabel(/^description$/i);
    const submit = page.getByRole('button', { name: /add note/i });

    await titleField.fill('Groceries');
    await descField.fill('milk');
    await submit.click();

    await titleField.fill('Books');
    await descField.fill('react');
    await submit.click();

    await page.getByLabel(/search notes/i).fill('milk');

    await expect(page.getByText('Groceries')).toBeVisible();
    await expect(page.getByText('Books')).not.toBeVisible();
  });

  test('dark mode toggle adds .dark class on html', async ({ page }) => {
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
