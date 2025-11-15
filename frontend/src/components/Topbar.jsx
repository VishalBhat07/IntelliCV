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
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <Home className="w-5 h-5 text-gray-500" />
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium text-gray-900">{name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">IntelliCV</div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
