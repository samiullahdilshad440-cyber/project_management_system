import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Line from '../components/Line';
import { useHeadingReveal, useReveal, useBars } from '../lib/gsap';

const empty = { name: '', description: '', status: 'active', dueDate: '' };

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const root = useRef(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // GSAP animations
  useHeadingReveal(root);
  useReveal(root, '[data-card]', [projects.length]);
  useBars(root, [projects.length]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, form);
      } else {
        await api.post('/projects', form);
      }
      setForm(empty);
      setEditId(null);
      load(); // Reload to get updated data
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Failed to save project. Please check your input.');
    }
  };

  const edit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      status: p.status,
      dueDate: formatDateForInput(p.dueDate),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project.');
    }
  };

  if (isLoading) return <main className="mx-auto max-w-6xl px-6 py-10"><p className="label">Loading projects...</p></main>;
  if (error) return <main className="mx-auto max-w-6xl px-6 py-10"><p className="text-red-500">{error}</p></main>;

  return (
    <main ref={root} className="mx-auto max-w-6xl px-6 py-10">
      <p className="label">Your season</p>
      <h1 className="display text-7xl sm:text-9xl">
        <Line>My</Line>
        <Line className="text-lime">Projects</Line>
      </h1>

      {/* CREATE / UPDATE form */}
      <form onSubmit={submit} className="card mt-10 grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Project name" value={form.name} onChange={set('name')} required />
        <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} />
        <textarea className="input sm:col-span-2" rows={2} placeholder="Description" value={form.description} onChange={set('description')} />
        <select className="input" value={form.status} onChange={set('status')}>
          <option value="active">Active</option>
          <option value="on-hold">On hold</option>
          <option value="completed">Completed</option>
        </select>
        <div className="flex gap-2">
          <button className="btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : (editId ? 'Save changes' : 'Add project')}
          </button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setForm(empty); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* READ list */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
          return (
            <div key={p._id} data-card className="card flex flex-col">
              <span className="label text-lime">{p.status}</span>
              <Link to={`/projects/${p._id}`} className="display mt-2 text-4xl hover:text-lime transition-colors">
                {p.name}
              </Link>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-400">{p.description}</p>

              {/* Accessible Progress Bar */}
              <div 
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${pct}% complete`}
              >
                <div data-bar className="h-full origin-left bg-lime transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              
              <div className="label mt-2 flex justify-between">
                <span>{p.done}/{p.total} tasks done</span>
                <span>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No deadline'}</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="btn-ghost" onClick={() => edit(p)}>Edit</button>
                <button className="btn-ghost text-red-400 hover:text-red-500" onClick={() => remove(p._id)}>Delete</button>
              </div>
            </div>
          );
        })}
        {!projects.length && (
          <p className="label col-span-full text-center py-10">No projects yet — add your first one above.</p>
        )}
      </div>
    </main>
  );
}