/**
 * Table - Reusable data table molecule
 *
 * Structured table component with column configuration and row rendering.
 * Used for displaying structured data with semantic HTML and theme-aware styling.
 *
 * @param {Object} props
 * @param {string} props.caption - Accessible table caption (visually hidden)
 * @param {Array<Object>} props.columns - Column definitions
 * @param {string} props.columns[].header - Column header text
 * @param {string} props.columns[].accessor - Key to access data in row object
 * @param {Function} props.columns[].render - Optional custom render function
 * @param {string} props.columns[].className - Optional cell class
 * @param {string} props.columns[].headerClassName - Optional header class
 * @param {Object} props.columns[].style - Optional cell inline styles
 * @param {Array<Object>} props.rows - Array of data objects
 * @param {string} props.className - Additional classes for table wrapper
 */
const Table = ({ caption, columns, rows, className = '' }) => (
  <div className={`overflow-x-auto border border-auto rounded ${className}`.trim()}>
    <table className="min-w-full text-left text-auto">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <thead className="bg-container-primary text-auto border-b border-auto">
        <tr>
          {columns.map((column, idx) => (
            <th
              key={column.accessor}
              scope="col"
              className={`${column.headerClassName ?? 'dt-cell-title'} ${idx < columns.length - 1 ? 'border-r border-auto' : ''}`.trim()}
              style={column.style}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.id ?? row.token ?? rowIndex} className="align-top border-b border-auto last:border-none text-auto">
            {columns.map((column, idx) => (
              <td key={column.accessor} className={`${column.className ?? 'dt-cell-text'} ${idx < columns.length - 1 ? 'border-r border-auto' : ''}`.trim()} style={column.style}>
                {column.render ? column.render(row) : row[column.accessor] ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default Table
