import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-ink">My profile</h2>
      <form className="card mt-6 grid gap-5 p-6 sm:grid-cols-2">
        <label className="label">
          Full name
          <input className="field" defaultValue={user.name} />
        </label>
        <label className="label">
          Email
          <input className="field" defaultValue={user.email} />
        </label>
        <label className="label">
          Phone
          <input className="field" placeholder="+251..." />
        </label>
        <label className="label">
          Department
          <input className="field" placeholder="Software Engineering" />
        </label>
        <button type="button" className="btn-primary sm:col-span-2 sm:w-fit">
          Save changes
        </button>
      </form>
    </div>
  );
}
