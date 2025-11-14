import React from 'react'
import { Home } from 'lucide-react'

export default function Topbar({ user }) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-gray-500" />
          <div className="text-sm text-gray-600">Welcome, <span className="font-medium text-gray-900">{user.name}</span></div>
        </div>
        <div className="text-sm text-gray-500">IntelliCV</div>
      </div>
    </div>
  )
}
