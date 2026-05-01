import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Command, X } from "lucide-react";
import { useBrain } from "../context/BrainContext";

export default function CommandPalette({ isOpen, onClose, setActiveView }) {
  const { notes, setActiveNote, addNote } = useBrain();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(query.toLowerCase()) || 
    n.content?.toLowerCase().includes(query.toLowerCase())
  );

  const actions = [
    { id: "new-note", title: "Create new note", icon: <FileText size={16} />, action: () => { addNote(); setActiveView("editor"); onClose(); } },
    { id: "go-editor", title: "Go to Editor", icon: <FileText size={16} />, action: () => { setActiveView("editor"); onClose(); } },
    { id: "go-graph", title: "Go to Graph View", icon: <Command size={16} />, action: () => { setActiveView("graph"); onClose(); } },
    { id: "go-ai", title: "Go to AI Assistant", icon: <Command size={16} />, action: () => { setActiveView("ai"); onClose(); } },
  ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  const allItems = [...(query ? [] : actions), ...filteredNotes];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault();
        const item = allItems[selectedIndex];
        if (item.action) {
          item.action();
        } else {
          setActiveNote(item);
          setActiveView("editor");
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose, setActiveNote, setActiveView]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0, 0, 0, 0.4)", backdropFilter: "var(--blur-md)",
        zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "10vh",
      }} 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-panel" 
        style={{
          width: "100%", maxWidth: "600px", borderRadius: "12px", overflow: "hidden",
          boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column"
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid var(--border-color)" }}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: "12px" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes or type a command..."
            className="input-base"
            style={{ flex: 1, fontSize: "16px" }}
          />
          <button className="button-base" onClick={onClose} style={{ display: "flex", color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Results list */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          style={{ maxHeight: "400px", overflowY: "auto", padding: "8px" }}
        >
          {allItems.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
              No results found for "{query}"
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isAction = !!item.action;
              const isSelected = idx === selectedIndex;
              
              return (
                <motion.div 
                  key={item.id || item.title}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    background: isSelected ? "var(--bg-glass-active)" : "transparent",
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    if (isAction) item.action();
                    else {
                      setActiveNote(item);
                      setActiveView("editor");
                      onClose();
                    }
                  }}
                >
                  {isAction ? item.icon : <FileText size={16} color="var(--accent-primary)" />}
                  <span style={{ fontSize: "14px", fontWeight: isSelected ? "500" : "400" }}>
                    {item.title || "Untitled Note"}
                  </span>
                  {!isAction && item.tags?.length > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px" }}>
                      {item.tags[0]}
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
        
        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-color)", fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "16px", background: "var(--bg-secondary)" }}>
          <span><kbd style={{ background: "var(--bg-glass)", padding: "2px 4px", borderRadius: "4px" }}>↑</kbd> <kbd style={{ background: "var(--bg-glass)", padding: "2px 4px", borderRadius: "4px" }}>↓</kbd> to navigate</span>
          <span><kbd style={{ background: "var(--bg-glass)", padding: "2px 4px", borderRadius: "4px" }}>Enter</kbd> to select</span>
          <span><kbd style={{ background: "var(--bg-glass)", padding: "2px 4px", borderRadius: "4px" }}>Esc</kbd> to close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
