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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">IntelliCV</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <form className="space-y-4" onSubmit={handle}>
          <div className="grid grid-cols-3 gap-3">
            <input
              className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="First"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Middle"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <input
              className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact (comma separated)
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+91-XXXXXXXXXX, +91-YYYYYYYYYY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile summary (optional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              value={profileSummary}
              onChange={(e) => setProfileSummary(e.target.value)}
              placeholder="A short summary about you"
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create account
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onShowLogin}
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
