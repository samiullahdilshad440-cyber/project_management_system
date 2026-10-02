export default function Line({ children, className = '' }) {
  return (
    <span className="block overflow-hidden">
      <span data-line className={`block ${className}`}>{children}</span>
    </span>
  );
}