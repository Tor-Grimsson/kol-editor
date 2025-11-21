import { SourcesItem } from '../atoms/index.js';

const SourcesSection = ({
  title = 'Sources & References',
  sources = [],
  dense = false,
  className = ''
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  const wrapperClasses = ['sources-section'];
  if (dense) {
    wrapperClasses.push('sources-section--dense');
  }
  if (className) {
    wrapperClasses.push(className);
  }

  return (
    <div className={wrapperClasses.join(' ')}>
      <h3>{title}</h3>
      <ul className="sources-list">
        {sources.map((source, index) => (
          <SourcesItem
            key={index}
            number={source.number}
            title={source.title}
            href={source.href}
            meta={source.meta}
          />
        ))}
      </ul>
    </div>
  );
};

export default SourcesSection;
