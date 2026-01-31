import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe } from 'lucide-react';

const LANGUAGES = [
    "English",
    "Tamil",
    "Hindi",
    "Malayalam",
    "Telugu"
];

const LanguageSelector = ({ selectedLine, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const currentLang = selectedLine || "English";

    const toggleOpen = (e) => {
        e.stopPropagation(); // Prevent immediate close
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    // Close on Scroll/Resize to avoid floating dropdowns
    useEffect(() => {
        const handleScroll = () => {
             if (isOpen) setIsOpen(false);
        };
        window.addEventListener('scroll', handleScroll, { capture: true }); // Capture to detect all scrolls
        window.addEventListener('resize', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (triggerRef.current && !triggerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);


    const handleSelect = (lang) => {
        onSelect(lang);
        setIsOpen(false);
    };

    return (
        <div className="lang-selector-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-text-dim)', fontSize: '0.7rem' }}>
                <Globe size={12} />
                <span className="text-mono uppercase">Target_Language_Profile</span>
            </div>

            <button
                ref={triggerRef}
                onClick={toggleOpen}
                className="lang-trigger"
                style={{ borderColor: isOpen ? 'var(--color-accent)' : 'var(--color-border)' }}
            >
                {currentLang}
                <ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                />
            </button>

            {isOpen && createPortal(
                <div 
                    className="lang-dropdown"
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        zIndex: 9999 // Ensure it's on top of everything
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <div
                            key={lang}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(lang);
                            }}
                            className={`lang-option ${lang === currentLang ? 'selected' : ''}`}
                        >
                            {lang}
                            {lang === currentLang && (
                                <div style={{ width: '4px', height: '4px', background: 'var(--color-accent)' }} />
                            )}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default LanguageSelector;
