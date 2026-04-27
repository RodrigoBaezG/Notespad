import { useEffect, useMemo, useState } from "react";
import Form from "./Form";
import List from "./List";
import './styles/Components.css';

const STORAGE_KEY = 'notespad:notes';
const THEME_KEY = 'notespad:theme';

function loadNotes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function loadTheme() {
    try {
        return localStorage.getItem(THEME_KEY) ?? 'light';
    } catch {
        return 'light';
    }
}

function newId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function NotesContainer() {
    const [notes, setNotes] = useState(loadNotes);
    const [editingId, setEditingId] = useState(null);
    const [query, setQuery] = useState('');
    const [theme, setTheme] = useState(loadTheme);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        } catch {
            /* storage unavailable */
        }
    }, [notes]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch {
            /* storage unavailable */
        }
    }, [theme]);

    const editing = editingId
        ? notes.find(n => n.id === editingId) ?? null
        : null;

    function handleSubmit({ title, description }) {
        if (editingId) {
            setNotes(prev => prev.map(n =>
                n.id === editingId ? { ...n, title, description } : n
            ));
            setEditingId(null);
            return;
        }
        const note = { id: newId(), title, description, createdAt: Date.now() };
        setNotes(prev => [...prev, note]);
    }

    function handleDelete(id) {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (editingId === id) setEditingId(null);
    }

    const visibleNotes = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? notes.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.description.toLowerCase().includes(q))
            : notes;
        return [...filtered].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }, [notes, query]);

    const total = notes.length;
    const showing = visibleNotes.length;

    return (
        <div className="page">
            <header className="notespad-header">
                <div className="notespad-title">
                    <h1>Notespad</h1>
                    <span aria-hidden="true">📝</span>
                </div>
                <button
                    type="button"
                    className="theme-toggle"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </header>

            <Form
                onSubmit={handleSubmit}
                editing={editing}
                onCancelEdit={() => setEditingId(null)}
            />

            <div className="search-row">
                <input
                    type="search"
                    className="form-input search-input"
                    placeholder="Search notes…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search notes"
                />
            </div>

            <List
                notesList={visibleNotes}
                total={total}
                showing={showing}
                hasQuery={query.trim().length > 0}
                onDeleteNote={handleDelete}
                onEditNote={(id) => setEditingId(id)}
            />
        </div>
    );
}

export default NotesContainer;
