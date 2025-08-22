function List({ notesList, onDeleteNote }) {
    return (
        <div>
            <h3 className="text-center uppercase font-semibold text-sky-800">Notes history</h3>

            <div className="flex flex-wrap justify-center">
                {notesList.length === 0 ? (
                    <p>There are no notes yet</p>
                ) : (notesList.map(note => (
                    <div className="form-list relative" key={note.title}>
                        <h3 className="font-semibold text-center">{note.title}</h3>
                        <p className="text-center">{note.description}</p>
                        <button
                            className="delete-button"
                            onClick={() => onDeleteNote(note.id)}>X</button>
                    </div>
                )))}
            </div>

        </div>
    );
}

export default List;