import { createContext, useState } from "react";
import Form from "./Form";
import List from "./List";
import './styles/Components.css';

function Context() {

    const [notes, setNotes] = useState([]);

    function addNote(note) {
        setNotes([...notes, { ...note, id: Date.now() }]);
    };

    function deleteNote(noteId){
        setNotes(notes.filter(note => note.id !== noteId));
    };

    return (
        <div>
            <div className="notespad-title">
                <h1>Notespad</h1>
                <span>📝</span>
            </div>
            <Form onAddNote={addNote} />
            <List notesList={notes} onDeleteNote={deleteNote} />
        </div>
    );
}

export default Context;