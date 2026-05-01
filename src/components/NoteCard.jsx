export default function NoteCard({ note }) {
  return (
    <div style={{ padding: "12px", background: "#1a1a1a", borderRadius: "8px", color: "white" }}>
      <h3 style={{ margin: 0 }}>{note.title}</h3>
      <p style={{ color: "#666", fontSize: "13px" }}>{note.content?.slice(0, 100)}...</p>
    </div>
  );
}