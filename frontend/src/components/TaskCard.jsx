import { useState } from "react";

const STATUS_LABELS = {
  todo:        { label: "To Do",       cls: "badge-todo" },
  "in-progress":{ label: "In Progress", cls: "badge-in-progress" },
  done:        { label: "Done",        cls: "badge-done" },
};

const STATUS_OPTIONS = ["todo", "in-progress", "done"];

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing,  setEditing]  = useState(false);
  const [editData, setEditData] = useState({ title: task.title, description: task.description, status: task.status });
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(task._id, editData);
    setSaving(false);
    setEditing(false);
  };

  const handleStatusChange = (newStatus) => {
    onUpdate(task._id, { status: newStatus });
  };

  const { label, cls } = STATUS_LABELS[task.status] || STATUS_LABELS["todo"];
  const date = new Date(task.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (editing) {
    return (
      <div className="card p-4 animate-fade-in space-y-3">
        <input
          className="input-field"
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          placeholder="Task title"
        />
        <textarea
          className="input-field resize-none"
          rows={3}
          value={editData.description}
          onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
          placeholder="Description (optional)"
        />
        <select
          className="input-field"
          value={editData.status}
          onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value }))}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5 px-3">
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-1.5 px-3">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 hover:border-slate-700 transition-all duration-150 animate-slide-up group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cls}>{label}</span>
            <span className="text-xs text-slate-600">{date}</span>
          </div>
          <h3 className="text-slate-100 font-medium text-sm leading-snug truncate">{task.title}</h3>
          {task.description && (
            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Edit">
            <PencilIcon />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-md hover:bg-red-900/40 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Quick status change */}
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {STATUS_OPTIONS.filter((s) => s !== task.status).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className="text-xs text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-600 px-2 py-0.5 rounded-full transition-all"
          >
            → {STATUS_LABELS[s].label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
