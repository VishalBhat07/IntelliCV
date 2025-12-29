import React from "react";
import { FileText, Upload, Briefcase } from "lucide-react";

export default function Sidebar({
  user,
  current,
  setCurrent,
  collapsed = false,
}) {
  const items = [
    { id: "upload", label: "Upload Documents", icon: Upload },
    { id: "job", label: "Job Description", icon: Briefcase },
    { id: "resume", label: "Generated Resume", icon: FileText },
  ];

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.name || "";
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gradient-to-b from-gray-900 to-black shadow-sm border-r border-white/10 flex flex-col transition-all`}
    >
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-white">IntelliCV</h1>
            <p className="text-xs text-gray-400">Resume Builder</p>
          </div>
        )}
      </div>

      <nav
        className={`p-2 ${collapsed ? "space-y-2" : "p-4 space-y-2"} flex-1`}
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = current === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setCurrent(it.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {collapsed ? initials : initials}
            </span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold text-white text-sm">{name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
