"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/api/dashboard/summary")
      .then((res) => setStats(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Something went wrong")
      );
  }, []);

  return (
    <div className="min-h-screen bg-surface-soft flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <Header />

        {error && (
          <p className="text-red-600 bg-red-100 px-4 py-2 rounded-md w-fit mb-4">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <StatCard title="Users" value={stats?.users} />
          <StatCard title="Orders" value={stats?.orders} />
          <StatCard title="Revenue" value={`₹${stats?.revenue}`} />
        </div>

        <div className="mt-10 bg-white p-6 rounded-lg shadow-soft">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Activity
          </h2>
          <p className="text-neutral-500">Charts and logs will be added here.</p>
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="w-64 bg-primary-dark text-white p-6 flex flex-col gap-6">
      <div className="text-2xl font-bold">NeoElect</div>
      <nav className="flex flex-col gap-3 text-yellow-100">
        <a className="hover:text-white transition">Dashboard</a>
        <a className="hover:text-white transition">Orders</a>
        <a className="hover:text-white transition">Products</a>
        <a className="hover:text-white transition">Support</a>
      </nav>
    </div>
  );
}

function Header() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-semibold text-neutral-800">Dashboard</h1>
      <button className="px-4 py-2 bg-primary text-white rounded-md shadow-soft hover:bg-primary-dark transition">
        Add New
      </button>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-soft">
      <h3 className="text-neutral-600">{title}</h3>
      <p className="text-3xl font-bold text-primary mt-2">{value ?? "—"}</p>
    </div>
  );
}