import Icon from '../atoms/icons/Icon'

/**
 * CarouselNavigation - Molecule
 *
 * Navigation controls for carousel components with previous/next buttons.
 * Uses chevron icons to indicate directional navigation.
 *
 * @param {Object} props
 * @param {Function} props.onPrevious - Callback for previous button click
 * @param {Function} props.onNext - Callback for next button click
 * @param {number} [props.iconSize=20] - Size of chevron icons in pixels
 * @param {string} [props.className] - Additional CSS classes for the container
 * @param {Object} [props.buttonProps] - Additional props to pass to both buttons
 *
 * @example
 * <CarouselNavigation
 *   onPrevious={() => setSlide(prev => prev - 1)}
 *   onNext={() => setSlide(prev => prev + 1)}
 *   iconSize={20}
 * />
 */
const CarouselNavigation = ({
  onPrevious,
  onNext,
  iconSize = 20,
  className = '',
  buttonProps = {}
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={onPrevious}
        className="p-2 bg-container-primary hover:bg-container-secondary rounded-sm transition-colors leading-none"
        aria-label="Previous slide"
        {...buttonProps}
      >
        <Icon name="chevron-left" size={iconSize} className="text-auto" />
      </button>
      <button
        onClick={onNext}
        className="p-2 bg-container-primary hover:bg-container-secondary rounded-sm transition-colors leading-none"
        aria-label="Next slide"
        {...buttonProps}
      >
        <Icon name="chevron-right" size={iconSize} className="text-auto" />
      </button>
    </div>
  )
}

export default CarouselNavigation
