import { useEffect } from "react";

const CurtainTransition = ({ isOpen, onComplete }) => {
  useEffect(() => {
    if (!isOpen) {
      // When curtain starts closing, wait for animation to complete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none ${
        isOpen ? "" : "pointer-events-auto"
      }`}
    >
      {/* Left Curtain */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-r-4 border-blue-500/50 shadow-[20px_0_60px_rgba(59,130,246,0.3)] transition-transform duration-[1.5s] ease-in-out ${
          isOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
            }}
          ></div>
        </div>
        {/* Glow Effect */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-500/20 to-transparent"></div>
      </div>

      {/* Right Curtain */}
      <div
        className={`absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border-l-4 border-blue-500/50 shadow-[-20px_0_60px_rgba(59,130,246,0.3)] transition-transform duration-[1.5s] ease-in-out ${
          isOpen ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
            }}
          ></div>
        </div>
        {/* Glow Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
      </div>

      {/* Center Logo/Icon (visible when curtain is closed) */}
      {!isOpen && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.6)]">
              <span className="material-symbols-outlined text-white text-5xl">
                auto_awesome
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurtainTransition;
