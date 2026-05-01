import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEMES = [
  { id: "midnight", name: "Midnight Purple" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "oceanic", name: "Oceanic" },
  { id: "aurora", name: "Aurora" },
  { id: "sunset", name: "Sunset" },
  { id: "hacker", name: "Terminal" },
  { id: "light", name: "Light Mode" }
];

export function ThemeProvider({ children }) {
  // Check local storage or default to midnight
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'midnight';
  });

  useEffect(() => {
    // Apply theme to document
    if (theme === 'midnight') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    // Save to local storage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Backwards compatibility for components expecting toggleTheme
  const isDark = theme !== 'light';
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'midnight' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
