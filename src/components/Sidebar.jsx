import { useState } from "react";
import { motion } from "framer-motion";
import { useBrain } from "../context/BrainContext";
import { useTheme, THEMES } from "../context/ThemeContext";
import { Search, Plus, Trash2, Star, Clock, BrainCircuit, ChevronDown, ChevronRight, Settings, Palette } from "lucide-react";

export default function Sidebar({ activeView, setActiveView }) {
  const { filteredNotes, activeNote, setActiveNote, addNote, deleteNote, searchQuery, setSearchQuery, toggleFavorite } = useBrain();
  const { theme, setTheme } = useTheme();
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isAllOpen, setIsAllOpen] = useState(true);

  const favorites = filteredNotes.filter(n => n.favorite);
  const others = filteredNotes.filter(n => !n.favorite);

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now - date) / 1000 / 60; // diff in minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const NoteItem = ({ note }) => {
    const isActive = activeNote?.id === note.id;
    return (
      <motion.div 
        onClick={() => { setActiveNote(note); setActiveView("editor"); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: "10px 12px",
          borderRadius: "8px",
          marginBottom: "4px",
          cursor: "pointer",
          background: isActive ? "var(--bg-glass-active)" : "transparent",
          border: "1px solid",
          borderColor: isActive ? "var(--border-color-active)" : "transparent",
          transition: "background var(--transition-fast), border-color var(--transition-fast)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          position: "relative",
          overflow: "hidden"
        }}
        className="note-item hover-glow"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: "14px", fontWeight: isActive ? "600" : "500", color: isActive ? "var(--text-primary)" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
            {note.title || "Untitled Note"}
          </span>
          <motion.button 
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="button-base"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
            style={{ color: note.favorite ? "#f59e0b" : "var(--text-muted)", opacity: note.favorite ? 1 : 0.4 }}
          >
            <Star size={14} fill={note.favorite ? "#f59e0b" : "none"} />
          </motion.button>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={10} /> {formatTime(note.updatedAt || note.createdAt)}</span>
          <motion.button 
            whileHover={{ scale: 1.2, color: "var(--danger-color)", opacity: 1 }}
            className="button-base delete-btn"
            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
            style={{ opacity: 0.5, padding: "2px" }}
          >
            <Trash2 size={12} />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ 
      width: "100%", 
      display: "flex", 
      flexDirection: "column", 
      height: "100%",
      position: "relative",
      zIndex: 10
    }}>
      
      {/* Header & Logo */}
      <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ 
          width: "32px", height: "32px", borderRadius: "8px", 
          background: "linear-gradient(135deg, var(--accent-primary), #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px var(--accent-glow)"
        }}>
          <BrainCircuit size={20} color="white" />
        </div>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600", letterSpacing: "-0.02em" }}>Digital Brain</h2>
      </div>

      {/* Nav Pills */}
      <div style={{ padding: "0 12px 16px", display: "flex", gap: "4px", position: "relative" }}>
        {["editor", "graph", "ai"].map((view) => (
          <button key={view} onClick={() => setActiveView(view)}
            className="button-base"
            style={{ 
              flex: 1, padding: "8px 0", borderRadius: "8px", fontSize: "12px", fontWeight: "500",
              color: activeView === view ? "var(--text-primary)" : "var(--text-muted)",
              position: "relative",
              zIndex: 1
            }}>
            {activeView === view && (
              <motion.div
                layoutId="active-nav-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--bg-glass-active)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-sm)",
                  zIndex: -1
                }}
              />
            )}
            {view === "editor" ? "Notes" : view === "graph" ? "Graph" : "AI Chat"}
          </button>
        ))}
      </div>

      {/* Search & Actions */}
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="input-base glass-panel"
            style={{ 
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px", fontSize: "13px",
              transition: "box-shadow var(--transition-fast)"
            }}
            onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--accent-glow)"}
            onBlur={(e) => e.target.style.boxShadow = "none"}
          />
        </div>
        
        <motion.button 
          onClick={() => { addNote(); setActiveView("editor"); }}
          whileHover={{ scale: 1.02, background: "var(--accent-hover)" }}
          whileTap={{ scale: 0.98 }}
          className="button-base"
          style={{ 
            width: "100%", padding: "10px", borderRadius: "8px", 
            background: "var(--accent-primary)", color: "#fff", fontWeight: "600", fontSize: "13px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            boxShadow: "0 4px 12px var(--accent-glow)",
            transition: "box-shadow var(--transition-fast)"
          }}
        >
          <Plus size={16} /> New Note
        </motion.button>
      </div>

      {/* Notes List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>
        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "13px" }}>
            {searchQuery ? "No matches found" : "No notes yet. Create one!"}
          </div>
        ) : (
          <>
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div 
                  onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", marginBottom: "4px" }}
                >
                  {isFavoritesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  Favorites
                </div>
                {isFavoritesOpen && favorites.map(note => <NoteItem key={note.id} note={note} />)}
              </div>
            )}

            {/* All Notes Section */}
            {others.length > 0 && (
              <div>
                <div 
                  onClick={() => setIsAllOpen(!isAllOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", marginBottom: "4px" }}
                >
                  {isAllOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  Notes
                </div>
                {isAllOpen && others.map(note => <NoteItem key={note.id} note={note} />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info & Theme Switcher */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {filteredNotes.length} notes
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="button-base"
          onClick={() => {
            const currentIndex = THEMES.findIndex(t => t.id === theme);
            const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
            setTheme(nextTheme.id);
          }}
          title="Cycle Theme"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)" }}
        >
          <Palette size={12} /> {THEMES.find(t => t.id === theme)?.name}
        </motion.button>
      </div>
    </div>
  );
}