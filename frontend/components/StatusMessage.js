export function LoadingState({ label = "Loading..." }) {
  return (
    <div
      className="border border-neutral-200 px-5 py-12 text-center text-sm text-neutral-500"
      role="status"
    >
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      className="border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800"
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          className="mt-4 border border-red-300 px-3 py-2 font-medium hover:border-red-800"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "No phones found." }) {
  return (
    <div className="border border-dashed border-neutral-300 px-5 py-16 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
