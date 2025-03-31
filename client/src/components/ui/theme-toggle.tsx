import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // Check initial theme
  useEffect(() => {
    // Check if user's OS prefers dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Check if theme was previously saved
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    if (darkMode) {
      // Switch to light mode
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
      
      // Apply additional theme-related changes
      document.body.style.backgroundColor = "var(--bg-color)";
      document.body.style.color = "var(--dark-text)";
    } else {
      // Switch to dark mode
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
      
      // Apply additional theme-related changes
      document.body.style.backgroundColor = "var(--bg-color)";
      document.body.style.color = "var(--dark-text)";
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="rounded-full p-2 transition-colors hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--card-border)]"
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Moon className="h-5 w-5 text-[var(--dark-text)]" />
      ) : (
        <Sun className="h-5 w-5 text-[var(--dark-text)]" />
      )}
    </button>
  );
}