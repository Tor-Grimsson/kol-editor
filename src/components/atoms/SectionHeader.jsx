const SectionHeader = ({ title, description }) => {
  return (
    <div className="space-y-3">
      <h2 className="kol-heading-subsection" style={{ color: 'var(--kol-surface-on-primary)' }}>
        {title}
      </h2>
      {description ? (
        <p className="kol-text max-w-2xl" style={{ color: 'color-mix(in srgb, var(--kol-surface-on-primary) 64%, transparent)' }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default SectionHeader
