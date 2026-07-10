export const WaveDivider = ({ fill = "fill-white", className = "" }) => {
  return (
    <div className={`relative w-full overflow-hidden leading-none ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full h-[40px] md:h-[60px] ${fill}`}
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0c26.9,8.75,55.05,16.18,83.82,22.19,77.73,16.22,159.26,20.67,237.57,14.25Z"></path>
      </svg>
    </div>
  );
};
