export function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  multiline = false,
  required = false,
  min,
  disabled = false,
  error = ""
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          disabled={disabled}
        />
      ) : options ? (
        <select name={name} value={value} onChange={onChange} disabled={disabled}>
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((option) => {
            const resolved = typeof option === "string" ? { label: option, value: option } : option;

            return (
              <option key={resolved.value} value={resolved.value}>
                {resolved.label}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          disabled={disabled}
        />
      )}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}
