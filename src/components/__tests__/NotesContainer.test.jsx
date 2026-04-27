import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotesContainer from '../NotesContainer.jsx';

async function addNote(user, title, description) {
  await user.clear(screen.getByLabelText(/^title$/i));
  await user.clear(screen.getByLabelText(/^description$/i));
  await user.type(screen.getByLabelText(/^title$/i), title);
  await user.type(screen.getByLabelText(/^description$/i), description);
  await user.click(screen.getByRole('button', { name: /add note/i }));
}

describe('NotesContainer – integration', () => {
  it('shows empty state on initial render', () => {
    render(<NotesContainer />);
    expect(screen.getByText(/there are no notes yet/i)).toBeInTheDocument();
  });

  it('adds a note end-to-end and removes the empty state', async () => {
    const user = userEvent.setup();
    render(<NotesContainer />);

    await addNote(user, 'Buy milk', '2 liters');

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('2 liters')).toBeInTheDocument();
    expect(screen.queryByText(/there are no notes yet/i)).not.toBeInTheDocument();
  });

  it('deletes the right note when its delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<NotesContainer />);

    await addNote(user, 'Note A', 'desc A');
    await addNote(user, 'Note B', 'desc B');

    expect(screen.getByText('Note A')).toBeInTheDocument();
    expect(screen.getByText('Note B')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete note: note a/i }));

    expect(screen.queryByText('Note A')).not.toBeInTheDocument();
    expect(screen.getByText('Note B')).toBeInTheDocument();
  });

  it('persists notes to localStorage and rehydrates on remount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<NotesContainer />);

    await addNote(user, 'Persist me', 'forever');

    const stored = JSON.parse(localStorage.getItem('notespad:notes'));
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Persist me');

    unmount();
    render(<NotesContainer />);

    expect(screen.getByText('Persist me')).toBeInTheDocument();
  });

  it('edits an existing note', async () => {
    const user = userEvent.setup();
    render(<NotesContainer />);

    await addNote(user, 'Original', 'body');

    await user.click(screen.getByRole('button', { name: /edit note: original/i }));

    const titleInput = screen.getByLabelText(/^title$/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.queryByText('Original')).not.toBeInTheDocument();
  });

  it('filters notes via the search input', async () => {
    const user = userEvent.setup();
    render(<NotesContainer />);

    await addNote(user, 'Groceries', 'milk');
    await addNote(user, 'Books', 'react');

    await user.type(screen.getByLabelText(/search notes/i), 'milk');

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Books')).not.toBeInTheDocument();
    expect(screen.getByText(/notes history \(1 of 2\)/i)).toBeInTheDocument();
  });

  it('toggles dark mode and persists the choice', async () => {
    const user = userEvent.setup();
    render(<NotesContainer />);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('notespad:theme')).toBe('dark');
  });

  it('newest note is rendered before older notes', async () => {
    const user = userEvent.setup();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    render(<NotesContainer />);

    await addNote(user, 'Older', 'first');
    now = 2000;
    await addNote(user, 'Newer', 'second');

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByText('Newer')).toBeInTheDocument();
    expect(within(cards[1]).getByText('Older')).toBeInTheDocument();
  });
});
