import { useEffect, useRef, useState } from "react";

const TITLE_MAX = 80;
const DESC_MAX = 500;

function Form({ onSubmit, editing, onCancelEdit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const titleRef = useRef(null);

    useEffect(() => {
        if (editing) {
            setTitle(editing.title);
            setDescription(editing.description);
            titleRef.current?.focus();
        }
    }, [editing]);

    function reset() {
        setTitle('');
        setDescription('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        const t = title.trim();
        const d = description.trim();
        if (!t || !d) return;
        onSubmit({ title: t.slice(0, TITLE_MAX), description: d.slice(0, DESC_MAX) });
        reset();
    }

    function handleKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit(e);
        } else if (e.key === 'Escape') {
            if (editing) {
                onCancelEdit();
            }
            reset();
        }
    }

    function handleCancel() {
        onCancelEdit();
        reset();
    }

    const isEditing = Boolean(editing);

    return (
        <div className="form-container">
            <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="form-card"
                aria-label={isEditing ? 'Edit note' : 'Add note'}
            >
                <label className="label" htmlFor="note-title">Title
                    <input
                        id="note-title"
                        ref={titleRef}
                        className="form-input"
                        type="text"
                        value={title}
                        required
                        maxLength={TITLE_MAX}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>
                <label className="label" htmlFor="note-description">Description
                    <textarea
                        id="note-description"
                        className="form-input"
                        value={description}
                        required
                        maxLength={DESC_MAX}
                        rows={4}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <div className="form-actions">
                    <button type="submit" className="form-button">
                        {isEditing ? 'Save changes' : 'Add note'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            className="form-button-secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Form;
