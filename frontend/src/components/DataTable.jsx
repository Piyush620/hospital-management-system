export function DataTable({ columns, rows, emptyText, renderActions }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {renderActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="table-empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row._id}>
                {columns.map((column) => (
                  <td key={`${row._id}-${column.key}`}>
                    {column.render ? column.render(row) : row[column.key] ?? "-"}
                  </td>
                ))}
                {renderActions ? <td className="table-actions">{renderActions(row)}</td> : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
