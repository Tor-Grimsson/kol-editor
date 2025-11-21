import React from 'react'

/**
 * Container Component
 * 
 * Max-width container with responsive padding
 * Uses design system spacing tokens
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Container content
 * @param {string} props.className - Additional classes
 */
const Container = ({ children, className = '' }) => {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  )
}

export default Container
