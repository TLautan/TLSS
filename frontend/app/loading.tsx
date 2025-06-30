// This component will be automatically displayed by Next.js during page transitions
// and while data is being fetched for Server Components.

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
        <span className="ml-4 text-gray-500">Loading...</span>
      </div>
    </div>
  );
}
