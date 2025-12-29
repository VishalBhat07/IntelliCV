import React, { useState } from "react";
import { FileText, UserPlus } from "lucide-react";

export default function RegisterPage({ onRegister, onShowLogin }) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState(""); // comma-separated
  const [profileSummary, setProfileSummary] = useState("");

  const handle = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) return;

    const contactArr = contact
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onRegister({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email,
      password,
      contact: contactArr,
      profile_summary: profileSummary,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-lg shadow-lg p-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IntelliCV</h1>
          <p className="text-gray-400 text-lg">Create your account</p>
        </div>

        <form className="space-y-4" onSubmit={handle}>
          <div className="grid grid-cols-3 gap-3">
            <input
              className="col-span-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              placeholder="First"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="col-span-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              placeholder="Middle"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <input
              className="col-span-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              placeholder="Last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Contact Numbers (comma separated)
            </label>
            <input
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all text-white placeholder-gray-400"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91-XXXXXXXXXX, +91-YYYYYYYYYY"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Profile Summary (optional)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all resize-none text-white placeholder-gray-400"
              rows={3}
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              placeholder="A brief summary about yourself"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create Account
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onShowLogin}
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
