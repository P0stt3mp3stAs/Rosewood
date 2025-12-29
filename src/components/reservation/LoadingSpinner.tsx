// src/components/reservation/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  text?: string;
}

export function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF8989] mx-auto" />
      <p className="text-gray-500 mt-3 text-sm">{text}</p>
    </div>
  );
}