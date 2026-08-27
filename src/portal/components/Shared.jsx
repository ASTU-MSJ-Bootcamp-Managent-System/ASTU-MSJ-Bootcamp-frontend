import { useState } from "react";
import { Plus, X } from "lucide-react";

export function Toolbar({ title, action, onAction }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep your bootcamp work organised and up to date.
        </p>
      </div>
      {action && (
        <button
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={onAction}
        >
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}

export function Modal({ title, close, children }) {
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4"
      onMouseDown={close}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            {title}
          </h2>
          <button
            className="text-slate-500 hover:text-slate-900"
            onClick={close}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Profile({ x, close, update }) {
  const [progress, setProgress] = useState(x.progress);
  return (
    <Modal title="Student profile" close={close}>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
          {x.name.slice(0, 2)}
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{x.name}</h3>
          <p className="text-sm text-slate-500">{x.email}</p>
        </div>
      </div>
      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          <b className="block text-slate-900">Batch</b>
          {x.batch}
        </p>
        <p>
          <b className="block text-slate-900">Mentor</b>
          {x.mentor}
        </p>
        <p>
          <b className="block text-slate-900">Attendance</b>
          {x.attendance}%
        </p>
        <p>
          <b className="block text-slate-900">Course progress</b>
          {x.progress}%
        </p>
      </div>
      <div className="mt-6">
        <label className="text-sm font-semibold text-slate-800">
          Update course progress: {progress}%
          <input
            className="mt-3 w-full accent-emerald-700"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => setProgress(+event.target.value)}
          />
        </label>
        <button
          className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => update({ progress })}
        >
          Save progress
        </button>
      </div>
    </Modal>
  );
}
