import { useAuth } from '../../context/AuthContext';

export default function AssignmentDetailPage() {
  const { user } = useAuth();
  const student = user.role === 'student';

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-ink">React Task Manager</h2>
      <div className="card mt-6 p-6">
        <p className="leading-7 text-slate-600">
          Build a task manager using React components, state, and local storage. Submit a GitHub
          repository and optional live demo before the deadline.
        </p>
        <div className="mt-5 flex gap-6 text-sm">
          <span>
            <b>Deadline:</b> Aug 29, 2026
          </span>
          <span>
            <b>Maximum score:</b> 100
          </span>
        </div>
      </div>

      {student && (
        <form className="card mt-5 grid gap-4 p-6">
          <h3 className="font-bold">Submit assignment</h3>
          <label className="label">
            GitHub repository URL
            <input required type="url" className="field" placeholder="https://github.com/..." />
          </label>
          <label className="label">
            Live demo URL <span className="font-normal">(optional)</span>
            <input type="url" className="field" placeholder="https://..." />
          </label>
          <label className="label">
            Notes
            <textarea className="field" rows="3" />
          </label>
          <button className="btn-primary w-fit">Submit assignment</button>
        </form>
      )}
    </div>
  );
}
