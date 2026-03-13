export function FormActions({ isEditing, onCancel, submitting }) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : isEditing ? "Update" : "Create"}
      </button>
      {isEditing ? (
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      ) : null}
    </div>
  );
}
