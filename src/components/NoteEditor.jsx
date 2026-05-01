import { useState, useEffect, useRef } from "react";
import { useBrain } from "../context/BrainContext";
import { useToast } from "./Toast";
import { Clock, Eye, Edit2, Tag, X, FileText } from "lucide-react";

export default function NoteEditor() {
  const { activeNote, updateNote } = useBrain();
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // saved, saving, unsaved
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || "");
      setContent(activeNote.content || "");
      setTags(activeNote.tags || []);
      setSaveStatus("saved");
      setIsPreview(false);
    }
  }, [activeNote?.id]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setSaveStatus("unsaved");
    scheduleAutoSave(title, e.target.value, tags);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSaveStatus("unsaved");
    scheduleAutoSave(e.target.value, content, tags);
  };

  const scheduleAutoSave = (t, c, tg) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      if (activeNote) {
        updateNote(activeNote.id, { title: t, content: c, tags: tg });
        setTimeout(() => setSaveStatus("saved"), 500); // Visual feedback
      }
    }, 800);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...new Set([...tags, tagInput.trim().toLowerCase()])];
      setTags(newTags);
      setTagInput("");
      setSaveStatus("unsaved");
      scheduleAutoSave(title, content, newTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    setSaveStatus("unsaved");
    scheduleAutoSave(title, content, newTags);
  };

  if (!activeNote) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }} className="animate-fade-in">
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--bg-glass)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
          <FileText size={40} color="var(--accent-primary)" style={{ opacity: 0.5 }} />
        </div>
        <div>
          <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: "500", marginBottom: "8px" }}>No Note Selected</h3>
          <p style={{ fontSize: "14px" }}>Select a note from the sidebar or create a new one.</p>
        </div>
      </div>
    </div>
  );

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Extremely basic markdown renderer for preview
  const renderMarkdown = (text) => {
    if (!text) return "Nothing to preview";
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // escape HTML
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\[\[(.*?)\]\]/gim, '<span style="color:var(--accent-primary); background:var(--accent-glow); padding:2px 6px; border-radius:4px; cursor:pointer;">$1</span>') // Note Links
      .replace(/\n$/gim, '<br />')
      .replace(/\n/gim, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="animate-fade-in" style={{ padding: "0", height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* Top Header */}
      <div style={{ padding: "16px 32px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Clock size={12} /> 
            Last edited {new Date(activeNote.updatedAt || activeNote.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {saveStatus === "saving" && <span style={{ color: "var(--accent-primary)" }}>Saving...</span>}
          {saveStatus === "saved" && <span style={{ color: "var(--success-color)" }}>Saved ✓</span>}
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            className="button-base glass-panel"
            onClick={() => setIsPreview(!isPreview)}
            style={{ padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "500", background: isPreview ? "var(--accent-primary)" : "var(--bg-glass)", color: isPreview ? "white" : "var(--text-primary)" }}
          >
            {isPreview ? <><Edit2 size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        
        {/* Title Input */}
        <input 
          value={title} 
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="input-base"
          readOnly={isPreview}
          style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-primary)", padding: "0 0 8px 0", borderBottom: isPreview ? "none" : "1px solid var(--border-color)", transition: "border-color var(--transition-fast)" }}
          onFocus={(e) => { if(!isPreview) e.target.style.borderBottomColor = "var(--accent-primary)" }}
          onBlur={(e) => { if(!isPreview) e.target.style.borderBottomColor = "var(--border-color)" }}
        />

        {/* Tags Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Tag size={16} color="var(--text-muted)" style={{ marginRight: "4px" }} />
          {tags.map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-glass)", padding: "4px 10px", borderRadius: "100px", fontSize: "12px", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
              {t}
              {!isPreview && <X size={12} style={{ cursor: "pointer", opacity: 0.5 }} onClick={() => removeTag(t)} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.5}/>}
            </div>
          ))}
          {!isPreview && (
            <input 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag..."
              className="input-base"
              style={{ fontSize: "12px", padding: "4px 8px", background: "transparent", width: "100px" }}
            />
          )}
        </div>

        {/* Editor / Preview Area */}
        {isPreview ? (
          <div style={{ flex: 1, fontSize: "16px", lineHeight: "1.7", color: "var(--text-primary)" }}>
            {renderMarkdown(content)}
          </div>
        ) : (
          <textarea 
            value={content} 
            onChange={handleContentChange}
            placeholder="Start typing... use [[title]] to link notes, or markdown for formatting."
            className="input-base"
            style={{ flex: 1, fontSize: "16px", lineHeight: "1.7", resize: "none", width: "100%", padding: "16px", borderRadius: "12px", background: "var(--bg-glass)", border: "1px solid var(--border-color)", transition: "border-color var(--transition-fast)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--border-color-active)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <div style={{ padding: "8px 32px", borderTop: "1px solid var(--border-color)", fontSize: "11px", color: "var(--text-muted)", display: "flex", justifyContent: "flex-end", gap: "16px", background: "var(--bg-secondary)" }}>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  );
}
