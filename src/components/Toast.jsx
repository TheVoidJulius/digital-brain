import { useEffect, useState, createContext, useContext } from "react";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 9999,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle size={18} color="var(--success-color)" />,
    info: <Info size={18} color="var(--accent-primary)" />,
    error: <AlertTriangle size={18} color="var(--danger-color)" />
  };

  return (
    <div className="glass-panel animate-slide-up" style={{
      pointerEvents: "auto",
      padding: "12px 16px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "var(--shadow-md)",
      minWidth: "250px",
    }}>
      {icons[toast.type] || icons.info}
      <span style={{ fontSize: "14px", fontWeight: "500", flex: 1 }}>{toast.message}</span>
      <button className="button-base" onClick={onRemove} style={{ display: "flex", color: "var(--text-muted)" }}>
        <X size={16} />
      </button>
    </div>
  );
}
