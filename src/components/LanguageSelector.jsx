import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'Auto', native: 'Auto-detect' },
  { code: 'English', native: 'English' },
  { code: 'Hinglish', native: 'Hinglish' },
  { code: 'Mixed', native: 'Mixed' },
  { code: 'Tamil', native: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD' },
  { code: 'Hindi', native: '\u0939\u093F\u0928\u094D\u0926\u0940' },
  { code: 'Malayalam', native: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02' },
  { code: 'Telugu', native: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41' },
];

const LanguageSelector = ({ selectedLine, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentLang = selectedLine || 'English';
  const currentData = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: r.bottom + window.scrollY + 4,
      left: r.left + window.scrollX,
      width: Math.max(r.width, 260),
    });
  };

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen) updateCoords();
    setIsOpen((v) => !v);
    setHoveredIndex(-1);
  };

  const handleSelect = (code) => {
    onSelect(code);
    setIsOpen(false);
    setHoveredIndex(-1);
  };

  // Close on scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, { capture: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHoveredIndex((i) => (i + 1) % LANGUAGES.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHoveredIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (hoveredIndex >= 0) handleSelect(LANGUAGES[hoveredIndex].code);
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, hoveredIndex]);

  return (
    <div className="lang-selector-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Globe size={12} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
        <span className="card-label" style={{ margin: 0 }}>Language</span>
      </div>

      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current: ${currentLang}`}
      >
        <span>{currentLang}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{currentData.native}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            marginLeft: 'auto',
          }}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label="Select language"
            className="lang-dropdown"
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
          >
            {LANGUAGES.map((lang, idx) => {
              const isSelected = lang.code === currentLang;
              const isHovered = idx === hoveredIndex;
              return (
                <div
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  className={`lang-option${isSelected ? ' selected' : ''}${isHovered ? ' selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.code);
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    {lang.code}
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.6 }}>{lang.native}</span>
                  </span>
                  {isSelected && <Check size={14} aria-hidden="true" />}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default LanguageSelector;
