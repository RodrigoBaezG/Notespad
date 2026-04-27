function List({ notesList, total = notesList.length, showing = notesList.length, hasQuery = false, onDeleteNote, onEditNote }) {
    const empty = notesList.length === 0;

    let counter;
    if (total === 0) {
        counter = '';
    } else if (hasQuery && showing !== total) {
        counter = ` (${showing} of ${total})`;
    } else {
        counter = ` (${total})`;
    }

    return (
        <section className="list-section" aria-label="Notes history">
            <h3 className="list-title">Notes history{counter}</h3>

            {empty ? (
                <p className="empty-state">
                    {hasQuery ? 'No notes match your search' : 'There are no notes yet'}
                </p>
            ) : (
                <ul className="notes-grid">
                    {notesList.map(note => (
                        <li className="form-list relative animate-in" key={note.id}>
                            <h3 className="font-semibold text-center">{note.title}</h3>
                            <p className="note-description">{note.description}</p>
                            <div className="card-actions">
                                {onEditNote && (
                                    <button
                                        type="button"
                                        className="edit-button"
                                        aria-label={`Edit note: ${note.title}`}
                                        onClick={() => onEditNote(note.id)}
                                    >
                                        ✎
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="delete-button"
                                    aria-label={`Delete note: ${note.title}`}
                                    onClick={() => onDeleteNote(note.id)}
                                >
                                    X
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default List;
