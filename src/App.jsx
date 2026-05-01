import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainProvider } from "./context/BrainContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import NoteEditor from "./components/NoteEditor";
import GraphView from "./components/GraphView";
import AIChatPanel from "./components/AiChatPanel";
import CommandPalette from "./components/CommandPalette";

// Constant background animation with pure CSS orbs
function BackgroundAnimation() {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
    </div>
  );
}

function MainApp() {
  const [activeView, setActiveView] = useState("editor");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const viewVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      width: "100vw", 
      overflow: "hidden", 
      background: "var(--bg-primary)", 
      position: "relative",
      padding: "20px",
      gap: "20px"
    }}>
      <BackgroundAnimation />
      
      {/* Sidebar Island */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ rotateY: -5, rotateX: 2, scale: 1.01 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="island-card" 
        style={{ width: "280px", height: "100%", zIndex: 10, perspective: "1000px" }}
      >
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </motion.div>
      
      {/* Main Content Island */}
      <motion.main 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ rotateY: 2, rotateX: 1, scale: 1.002 }}
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
        className="island-card" 
        style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", zIndex: 1, perspective: "1000px" }}
      >
        <AnimatePresence mode="wait">
          {activeView === "editor" && (
            <motion.div key="editor" variants={viewVariants} initial="initial" animate="animate" exit="exit" style={{height: "100%", width: "100%"}}>
              <NoteEditor />
            </motion.div>
          )}
          {activeView === "graph" && (
            <motion.div key="graph" variants={viewVariants} initial="initial" animate="animate" exit="exit" style={{height: "100%", width: "100%"}}>
              <GraphView />
            </motion.div>
          )}
          {activeView === "ai" && (
            <motion.div key="ai" variants={viewVariants} initial="initial" animate="animate" exit="exit" style={{height: "100%", width: "100%"}}>
              <AIChatPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette 
            isOpen={isCommandPaletteOpen} 
            onClose={() => setIsCommandPaletteOpen(false)} 
            setActiveView={setActiveView}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrainProvider>
          <MainApp />
        </BrainProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}