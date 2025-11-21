const SourcesItem = ({ number, title, href, meta }) => {
  return (
    <li>
      <span className="source-number">{number}</span>
      <div className="source-content">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
        <span className="source-meta">{meta}</span>
      </div>
    </li>
  );
};

export default SourcesItem;
