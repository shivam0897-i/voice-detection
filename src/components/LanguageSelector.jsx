import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe, Check } from 'lucide-react';

const LANGUAGES = [
    { code: "English", native: "English" },
    { code: "Tamil", native: "à®¤à®®à®¿à®´à¯" },
    { code: "Hindi", native: "à¤¹à¤¿à¤¨à¥à¤¦à¥€" },
    { code: "Malayalam", native: "à´®à´²à´¯à´¾à´³à´‚" },
    { code: "Telugu", native: "à°¤à±†à°²à±à°—à±" }
];

// Inline styles for portal (ensures dark theme works outside React tree)
const portalStyles = {
    dropdown: {
        position: 'absolute',
        backgroundColor: '#000000',
        border: '1px solid #ccff00',
        boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(204, 255, 0, 0.1)',
        zIndex: 9999,
        fontFamily: "'JetBrains Mono', monospace",
        overflow: 'hidden',
    },
    option: {
        padding: '14px 16px',
        paddingLeft: '16px',
        cursor: 'pointer',
        color: '#888888',
        fontSize: '0.9rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #222',
        borderLeft: '3px solid transparent',
        transition: 'all 0.15s ease',
        backgroundColor: '#000000',
    },
    optionSelected: {
        backgroundColor: '#111111',
        color: '#ccff00',
        borderLeft: '3px solid #ccff00',
    },
    optionHover: {
        backgroundColor: '#ccff00',
        color: '#000000',
        borderLeft: '3px solid #ccff00',
    },
    langInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    langIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        fontFamily: "'JetBrains Mono', monospace",
    },
    native: {
        fontSize: '0.7rem',
        color: '#666',
        marginLeft: '8px',
    },
};

const LanguageSelector = ({ selectedLine, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredLang, setHoveredLang] = useState(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const currentLang = selectedLine || "English";
    const currentLangData = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    const toggleOpen = (e) => {
        e.stopPropagation();
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
                width: Math.max(rect.width, 280) // Minimum width for better display
            });
        }
    };

    // Close on Scroll/Resize
    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };
        window.addEventListener('scroll', handleScroll, { capture: true });
        window.addEventListener('resize', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                triggerRef.current && 
                !triggerRef.current.contains(e.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            
            const currentIndex = LANGUAGES.findIndex(l => l.code === (hoveredLang || currentLang));
            
            switch (e.key) {
                case 'ArrowDown': {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
                    setHoveredLang(LANGUAGES[nextIndex].code);
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + LANGUAGES.length) % LANGUAGES.length;
                    setHoveredLang(LANGUAGES[prevIndex].code);
                    break;
                }
                case 'Enter':
                    e.preventDefault();
                    if (hoveredLang) {
                        onSelect(hoveredLang);
                        setIsOpen(false);
                    }
                    break;
                case 'Escape':
                    setIsOpen(false);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hoveredLang, currentLang, onSelect]);

    const handleSelect = (lang) => {
        onSelect(lang);
        setIsOpen(false);
        setHoveredLang(null);
    };

    const getOptionStyle = (lang) => {
        const isSelected = lang.code === currentLang;
        const isHovered = lang.code === hoveredLang;
        
        return {
            ...portalStyles.option,
            ...(isSelected ? portalStyles.optionSelected : {}),
            ...(isHovered ? portalStyles.optionHover : {}),
            borderBottom: lang.code === LANGUAGES[LANGUAGES.length - 1].code ? 'none' : '1px solid #222',
        };
    };

    return (
        <div className="lang-selector-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#888', fontSize: '0.7rem' }}>
                <Globe size={12} aria-hidden="true" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Target_Language_Profile</span>
            </div>

            <button
                ref={triggerRef}
                onClick={toggleOpen}
                className="lang-trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={`Select language. Current: ${currentLang}`}
                style={{ 
                    borderColor: isOpen ? '#ccff00' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}
            >
                <span style={{ flex: 1, textAlign: 'left' }}>{currentLang}</span>
                <span style={{ fontSize: '0.7rem', color: '#666' }}>{currentLangData.native}</span>
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        marginLeft: '8px',
                    }}
                />
            </button>

            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    role="listbox"
                    aria-label="Select language"
                    style={{
                        ...portalStyles.dropdown,
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                    }}
                >
                    {LANGUAGES.map((lang) => (
                        <div
                            key={lang.code}
                            role="option"
                            aria-selected={lang.code === currentLang}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(lang.code);
                            }}
                            onMouseEnter={() => setHoveredLang(lang.code)}
                            onMouseLeave={() => setHoveredLang(null)}
                            style={getOptionStyle(lang)}
                        >
                            <div style={portalStyles.langInfo}>
                                <span>{lang.code}</span>
                                <span style={{
                                    ...portalStyles.native,
                                    color: hoveredLang === lang.code ? '#333' : '#666',
                                }}>{lang.native}</span>
                            </div>
                            {lang.code === currentLang && (
                                <Check size={16} style={{ color: hoveredLang === lang.code ? '#000' : '#ccff00' }} />
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


