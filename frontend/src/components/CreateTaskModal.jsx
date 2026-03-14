import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "todo",        label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done",        label: "Done" },
];

export default function CreateTaskModal({ onClose, onCreate }) {
  const [form,    setForm]    = useState({ title: "", description: "", status: "todo" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-100">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Title *</label>
            <input
              className="input-field"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Add details (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Creating…" : "Create Task"}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost px-4">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
