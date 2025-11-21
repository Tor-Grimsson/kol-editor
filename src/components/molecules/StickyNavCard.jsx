const StickyNavCard = ({
  heading,
  body,
  bullets = [],
  index,
  isActive = false,
  collapsed = false,
  variant = 'default',
  onClick,
  className = ''
}) => {
  const effectiveCollapsed = collapsed || variant === 'collapsed';

  // Unified component with smooth transitions
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
    >
      <article
        className={`rounded border transition-all duration-300 ease-in-out ${
          isActive ? 'border-auto p-6 space-y-3' : 'border-fg-08 bg-surface-primary/90 p-6'
        } ${className}`}
        style={{
          maxHeight: isActive ? '500px' : (effectiveCollapsed ? '64px' : '500px'),
          overflow: 'hidden',
          backgroundColor: isActive
            ? 'color-mix(in srgb, var(--kol-surface-on-primary) 2%, transparent)'
            : undefined
        }}
      >
        <div className="sticky-nav-card-content">

        {/* HEADING ROW */}

        <div className="flex items-start justify-between gap-3">


          {/* TITLE - WRAPPED */}

          <div className="pb-2">
            <h3
              className={`kol-helper-md uppercase ${
                effectiveCollapsed ? 'line-clamp-1' : ''
              } ${
                isActive ? 'text-auto' : effectiveCollapsed ? 'text-fg-16' : 'text-fg-48'
              }`}
            >
              {heading}
            </h3>
          </div>


          {/* SUBTITLE --- INDEX NUMBER - WRAPPED */}

          <div className="pt-1">
            <span className={`kol-mono-xs uppercase ${isActive ? 'text-fg-80' : 'text-fg-48'}`}>
              #{index + 1}
            </span>
          </div>
        </div>


        {/* BODY & BULLETS */}

        <div
          className={`transition-all duration-300 ease-in-out ${
            isActive || !effectiveCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ overflow: 'hidden' }}
        >


          {/* BODY TEXT - WRAPPED */}
         
          <div>
            {body && (
              <p
                className={`kol-mono-sm-fine ${
                  isActive ? 'text-fg-64' : effectiveCollapsed ? 'text-fg-24' : 'text-fg-32'
                }`}
              >
                {body}
              </p>
            )}
          </div>

          {/* BULLETS LIST - WRAPPED */}
          <div className="pt-4">
            {Array.isArray(bullets) && bullets.length > 0 && (
              <ul className="space-y-2">
                {bullets.map((item, bulletIndex) => (
                  <li
                    key={bulletIndex}
                    className={`kol-mono-xs ${
                      isActive ? 'text-fg-64' : effectiveCollapsed ? 'text-fg-32' : 'text-fg-64'
                    } flex gap-2`}
                  >
                    <span className={isActive ? 'text-fg-48' : 'text-fg-32'}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      </article>
    </button>
  );
};

export default StickyNavCard;
