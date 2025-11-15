import React from 'react'
import { FileText, Upload, Briefcase } from 'lucide-react'

export default function Sidebar({ user, current, setCurrent }) {
  const items = [
    { id: 'upload', label: 'Upload Documents', icon: Upload },
    { id: 'job', label: 'Job Description', icon: Briefcase },
    { id: 'resume', label: 'Generated Resume', icon: FileText },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">IntelliCV</h1>
            <p className="text-xs text-gray-600">Smart Resume Builder</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1">
        {items.map((it) => {
          const Icon = it.icon
          const active = current === it.id
          return (
            <button
              key={it.id}
              onClick={() => setCurrent(it.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{it.label}</span>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold">{user.name}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
