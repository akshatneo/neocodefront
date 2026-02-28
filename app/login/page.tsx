"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";

import {constants} from '../../utils/constants'

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      axios.defaults.withCredentials = true
      const res = await axios.post(`${constants.API_URL}/auth/login`, {
        email,
        password,
      });

      setSuccess("Login successful");
      // Redirect:
      // window.location.href = "/dashboard";
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Unable to reach server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-yellow-300 backdrop-blur-xl">

        <div className="flex flex-col items-center mb-6">
          <Image
            src="/neoelect-logo.jpg"
            width={70}
            height={70}
            alt="NeoElect Logo"
            className="rounded-full shadow-md"
          />

          <h1 className="text-2xl font-semibold text-gray-800 mt-3">
            NeoElect Admin
          </h1>

          <p className="text-gray-500 text-sm">
            Login to access your dashboard
          </p>
        </div>

        {error && (
          <div className="mb-3 p-3 text-sm rounded-xl bg-red-200 text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 text-sm rounded-xl bg-green-200 text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-yellow-400 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-yellow-400 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white rounded-xl bg-yellow-500 hover:bg-yellow-600 shadow-md transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}