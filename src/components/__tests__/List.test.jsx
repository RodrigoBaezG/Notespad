import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import List from '../List.jsx';

describe('List', () => {
  it('shows empty state when no notes', () => {
    render(<List notesList={[]} onDeleteNote={() => {}} />);
    expect(screen.getByText(/there are no notes yet/i)).toBeInTheDocument();
  });

  it('shows search-specific empty state when query has no matches', () => {
    render(
      <List
        notesList={[]}
        total={3}
        showing={0}
        hasQuery
        onDeleteNote={() => {}}
      />
    );
    expect(screen.getByText(/no notes match your search/i)).toBeInTheDocument();
  });

  it('renders one card per note and a counter', () => {
    const notes = [
      { id: 1, title: 'First', description: 'Foo' },
      { id: 2, title: 'Second', description: 'Bar' },
    ];
    render(<List notesList={notes} onDeleteNote={() => {}} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText(/notes history \(2\)/i)).toBeInTheDocument();
  });

  it('shows "showing of total" counter when filtered', () => {
    const notes = [{ id: 1, title: 'Only', description: 'x' }];
    render(
      <List
        notesList={notes}
        total={3}
        showing={1}
        hasQuery
        onDeleteNote={() => {}}
      />
    );

    expect(screen.getByText(/notes history \(1 of 3\)/i)).toBeInTheDocument();
  });

  it('calls onDeleteNote with the correct id', async () => {
    const user = userEvent.setup();
    const onDeleteNote = vi.fn();
    const notes = [
      { id: 11, title: 'Keep', description: 'k' },
      { id: 22, title: 'Drop', description: 'd' },
    ];

    render(<List notesList={notes} onDeleteNote={onDeleteNote} />);

    await user.click(
      screen.getByRole('button', { name: /delete note: drop/i })
    );

    expect(onDeleteNote).toHaveBeenCalledTimes(1);
    expect(onDeleteNote).toHaveBeenCalledWith(22);
  });

  it('calls onEditNote with the correct id when edit is provided', async () => {
    const user = userEvent.setup();
    const onEditNote = vi.fn();
    const notes = [{ id: 7, title: 'Hello', description: 'world' }];

    render(
      <List
        notesList={notes}
        onDeleteNote={() => {}}
        onEditNote={onEditNote}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /edit note: hello/i })
    );

    expect(onEditNote).toHaveBeenCalledWith(7);
  });

  it('omits edit buttons when onEditNote is not provided', () => {
    const notes = [{ id: 1, title: 'Only', description: 'x' }];
    render(<List notesList={notes} onDeleteNote={() => {}} />);

    expect(screen.queryByRole('button', { name: /edit note/i })).toBeNull();
    expect(screen.getByRole('button', { name: /delete note/i })).toBeInTheDocument();
  });
});
