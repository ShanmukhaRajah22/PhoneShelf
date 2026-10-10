export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-4 pt-8"
      aria-label="Pagination"
    >
      <button
        className="button-secondary"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm text-neutral-600">
        Page {page} of {totalPages}
      </span>
      <button
        className="button-secondary"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
