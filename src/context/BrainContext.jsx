import { createContext, useContext, useState, useMemo } from "react";
import { getNotes, saveNotes } from "../utils/storage";

const BrainContext = createContext();

export function BrainProvider({ children }) {
  const [notes, setNotes] = useState(getNotes());
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "",
      content: "",
      tags: [],
      links: [],
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setActiveNote(newNote);
  };

  const updateNote = (id, changes) => {
    const updated = notes.map((n) => 
      n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updated);
    saveNotes(updated);
    setActiveNote((prev) => prev?.id === id ? { ...prev, ...changes, updatedAt: new Date().toISOString() } : prev);
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (activeNote?.id === id) setActiveNote(null);
  };

  const toggleFavorite = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { favorite: !note.favorite });
    }
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(n => 
      (n.title && n.title.toLowerCase().includes(query)) || 
      (n.content && n.content.toLowerCase().includes(query)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(query)))
    );
  }, [notes, searchQuery]);

  return (
    <BrainContext.Provider value={{ 
      notes, 
      filteredNotes,
      activeNote, 
      searchQuery,
      setSearchQuery,
      setActiveNote, 
      addNote, 
      updateNote, 
      deleteNote,
      toggleFavorite
    }}>
      {children}
    </BrainContext.Provider>
  );
}

export const useBrain = () => useContext(BrainContext);