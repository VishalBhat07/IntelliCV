import React, { useEffect } from "react";
import {
  X,
  Home,
  Sparkles,
  Target,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function MobileSidebar({ isOpen, onClose, onGetStarted }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      onClose();
    }
  };

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      action: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        onClose();
      },
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: "Features",
      action: () => scrollToSection("features"),
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: "How It Works",
      action: () => scrollToSection("how-it-works"),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Benefits",
      action: () => scrollToSection("benefits"),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-900 to-black shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden border-l border-white/10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IntelliCV</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl font-medium transition-all duration-200 group"
            >
              <span className="text-gray-400 group-hover:text-white transition-colors">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* CTA Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gradient-to-r from-black/50 to-gray-900/50">
          <button
            onClick={() => {
              onGetStarted();
              onClose();
            }}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Free forever. No credit card needed.
          </p>
        </div>
      </div>
    </>
  );
}
