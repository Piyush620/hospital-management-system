export function ListToolbar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  extraActions
}) {
  return (
    <div className="list-toolbar">
      <input
        className="toolbar-search"
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
      />
      {extraActions ? <div className="page-header-actions">{extraActions}</div> : null}
    </div>
  );
}
