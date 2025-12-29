import React from "react";
import { Home, LogOut, Menu } from "lucide-react";

export default function Topbar({
  user,
  onLogout,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.name || "";

  const toggleSidebar = () => {
    if (typeof setSidebarCollapsed === "function") {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black border-b border-white/10">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-white/10"
          >
            <Menu className="w-5 h-5 text-gray-300" />
          </button>
          <Home className="w-5 h-5 text-gray-300" />
          <div className="text-sm text-gray-400">
            Welcome, <span className="font-medium text-white">{name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">IntelliCV</div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
