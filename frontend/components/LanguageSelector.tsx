import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const languages = [
    {
        code: 'it',
        label: 'IT',
        src: "https://flagcdn.com/it.svg"
    },
    {
        code: 'de',
        label: 'DE',
        src: "https://flagcdn.com/de.svg"
    },
    {
        code: 'en',
        label: 'EN',
        src: "https://flagcdn.com/gb.svg"
    },
];

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export default function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to the component

  const selectedLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown if clicking outside of the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Only add listener when menu is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        type="button"
      >
        <img 
            src={selectedLang.src} 
            alt={selectedLang.label} 
            className="h-3.5 w-5 object-cover" 
        />
        <span className="text-foreground">{selectedLang.label}</span>
        
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-[120px] origin-top-right rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div className="flex flex-col"> 
                {languages.map((lang) => (
                <div
                    key={lang.code}
                    onClick={() => {
                        onLanguageChange(lang.code);
                        setIsOpen(false);
                    }}
                    className={cn(
                        "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md",
                        language === lang.code && "bg-accent/50 font-medium"
                    )}
                >
                    <img 
                        src={lang.src} 
                        alt={lang.label} 
                        className="h-3.5 w-5 object-cover shadow-sm" 
                    />
                    <span>{lang.label}</span>
                </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}