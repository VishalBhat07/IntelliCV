import React, { useState } from "react";
import { FileText, LogIn } from "lucide-react";

export default function LoginPage({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IntelliCV</h1>
          <p className="text-gray-400 text-lg">AI-Powered Resume Builder</p>
        </div>

        <form className="space-y-6" onSubmit={handle}>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onShowRegister}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
