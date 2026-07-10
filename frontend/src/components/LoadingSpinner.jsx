export const LoadingSpinner = ({ size = 'h-8 w-8' }) => (
  <div className="flex items-center justify-center">
    <div className={`${size} animate-spin rounded-full border-4 border-blue-600 border-t-transparent`}></div>
  </div>
);