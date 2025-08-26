// src/components/FormSection.jsx
export function FormSection({ title, children }) {
  return (
    <div className="mb-6">
      {title && (
        <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
          {title}
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
