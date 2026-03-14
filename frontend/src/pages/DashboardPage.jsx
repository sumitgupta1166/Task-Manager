import { useState, useEffect, useCallback } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import { useAuth } from "../context/AuthContext";

const STATUS_FILTERS = [
  { value: "",           label: "All" },
  { value: "todo",       label: "To Do" },
  { value: "in-progress",label: "In Progress" },
  { value: "done",       label: "Done" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const [tasks,      setTasks]      = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);

  // Filter / search / pagination state
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [page,    setPage]    = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (status)          params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get("/tasks", { params });
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── CRUD handlers ────────────────────────────────────────────────────────────

  const handleCreate = async (data) => {
    const res = await api.post("/tasks", data);
    toast.success("Task created!");
    fetchTasks();
    return res.data;
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.patch(`/tasks/${id}`, data);
      toast.success("Task updated");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inpCount  = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Hey, {user?.username} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your tasks below</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <PlusIcon /> New Task
          </button>
        </div>

        {/* Stats bar */}
        {pagination && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="To Do"       count={todoCount} color="text-slate-400" />
            <StatCard label="In Progress" count={inpCount}  color="text-amber-400" />
            <StatCard label="Done"        count={doneCount} color="text-emerald-400" />
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon />
            </span>
            <input
              className="input-field pl-9"
              placeholder="Search tasks by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === f.value
                    ? "bg-brand-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-500">No tasks found</p>
            {!status && !debouncedSearch && (
              <button onClick={() => setShowModal(true)} className="btn-primary mt-4 text-sm">
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <CreateTaskModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

function StatCard({ label, count, color }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <span className={`text-2xl font-bold font-mono ${color}`}>{count}</span>
      <span className="text-slate-500 text-sm">{label}</span>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
