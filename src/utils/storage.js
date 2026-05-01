const NOTES_KEY = "digital-brain-notes";

export const getNotes = () => {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = (notes) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};