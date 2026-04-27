import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Form from '../Form.jsx';

function renderForm(props = {}) {
  const onSubmit = vi.fn();
  const onCancelEdit = vi.fn();
  const utils = render(
    <Form onSubmit={onSubmit} onCancelEdit={onCancelEdit} editing={null} {...props} />
  );
  return {
    ...utils,
    onSubmit,
    onCancelEdit,
    title: screen.getByLabelText(/title/i),
    description: screen.getByLabelText(/description/i),
    submit: screen.getByRole('button', { name: /add note/i }),
  };
}

describe('Form – add mode', () => {
  it('renders title, description and submit button', () => {
    renderForm();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
  });

  it('calls onSubmit with the entered title and description', async () => {
    const user = userEvent.setup();
    const { onSubmit, title, description, submit } = renderForm();

    await user.type(title, 'My title');
    await user.type(description, 'Some description');
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My title',
      description: 'Some description',
    });
  });

  it('clears inputs after a successful submit', async () => {
    const user = userEvent.setup();
    const { title, description, submit } = renderForm();

    await user.type(title, 'A');
    await user.type(description, 'B');
    await user.click(submit);

    expect(title).toHaveValue('');
    expect(description).toHaveValue('');
  });

  it('does not call onSubmit when fields are empty', async () => {
    const user = userEvent.setup();
    const { onSubmit, submit } = renderForm();

    await user.click(submit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only inputs', async () => {
    const user = userEvent.setup();
    const { onSubmit, title, description, submit } = renderForm();

    await user.type(title, '   ');
    await user.type(description, '   ');
    await user.click(submit);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace before submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit, title, description, submit } = renderForm();

    await user.type(title, '  Hi  ');
    await user.type(description, '  body  ');
    await user.click(submit);

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Hi', description: 'body' });
  });

  it('submits via Ctrl+Enter shortcut', async () => {
    const user = userEvent.setup();
    const { onSubmit, title, description } = renderForm();

    await user.type(title, 'Quick');
    await user.type(description, 'note');
    await user.keyboard('{Control>}{Enter}{/Control}');

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Quick', description: 'note' });
  });
});

describe('Form – edit mode', () => {
  const editing = { id: 'abc', title: 'Old title', description: 'Old body' };

  it('preloads inputs and shows save / cancel buttons', () => {
    render(<Form onSubmit={() => {}} onCancelEdit={() => {}} editing={editing} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Old title');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Old body');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onCancelEdit when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();
    render(<Form onSubmit={() => {}} onCancelEdit={onCancelEdit} editing={editing} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onCancelEdit when pressing Escape while editing', async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();
    render(<Form onSubmit={() => {}} onCancelEdit={onCancelEdit} editing={editing} />);

    await user.click(screen.getByLabelText(/title/i));
    await user.keyboard('{Escape}');

    expect(onCancelEdit).toHaveBeenCalled();
  });
});
