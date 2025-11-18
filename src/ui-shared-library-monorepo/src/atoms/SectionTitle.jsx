import React from 'react'

/**
 * SectionTitle Component
 * 
 * Large section heading using kol-heading-section class
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Title content
 * @param {string} props.className - Additional classes
 */
const SectionTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`kol-heading-section ${className}`}>
      {children}
    </h2>
  )
}

export default SectionTitle
