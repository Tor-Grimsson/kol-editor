import Icon from './icons/Icon'

export default function LanguageToggle({
  language = 'en',
  onLanguageChange,
  className = ''
}) {
  const handleToggle = () => {
    onLanguageChange(language === 'en' ? 'is' : 'en')
  }

  const ariaLabel = language === 'is' ? 'Switch to English' : 'Skipta yfir í íslensku'

  return (
    <button
      onClick={handleToggle}
      className={`language-toggle p-1 rounded transition-all hover:scale-110 ${language === 'is' ? 'toggled' : ''} ${className}`}
      aria-label={ariaLabel}
    >
      <span
        className="icon-swap-container"
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: '16px',
          height: '16px',
          overflow: 'hidden'
        }}
      >
        <Icon
          name="flag-gb"
          size={16}
          style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
        />
        <Icon
          name="flag-is"
          size={16}
          style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
        />
      </span>
    </button>
  )
}
