import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Line from '../components/Line';
import { useHeadingReveal, useReveal } from '../lib/gsap';

const COLUMNS = [
  { key: 'todo', title: 'To do' },
  { key: 'in-progress', title: 'In progress' },
  { key: 'done', title: 'Done' },
];
const PRIORITY_COLOR = { low: 'text-neutral-400', medium: 'text-yellow-300', high: 'text-red-400' };
const empty = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const root = useRef(null);

  const load = async () => {
    const [p, t] = await Promise.all([api.get(`/projects/${id}`), api.get(`/tasks/project/${id}`)]);
    setProject(p.data);
    setTasks(t.data);
  };
  useEffect(() => { load(); }, [id]);

  // GSAP animations (hooks must stay above the early return below)
  useHeadingReveal(root, [!!project]);
  useReveal(root, '[data-card]', [tasks.length]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // CREATE or UPDATE task
  const submit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/tasks/${editId}`, form);
    else await api.post('/tasks', { ...form, project: id });
    setForm(empty);
    setEditId(null);
    load();
  };

  const edit = (t) => {
    setEditId(t._id);
    setForm({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Move between columns (UPDATE status)
  const move = async (t, status) => {
    await api.put(`/tasks/${t._id}`, { ...t, status });
    load();
  };

  // DELETE
  const remove = async (tid) => {
    await api.delete(`/tasks/${tid}`);
    load();
  };

  if (!project) return <p className="label p-10">Loading…</p>;

  return (
    <main ref={root} className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/dashboard" className="label hover:text-lime">← All projects</Link>
      <h1 className="display mt-3 text-6xl sm:text-8xl">
        <Line>{project.name}</Line>
      </h1>
      <p className="mt-3 max-w-2xl text-neutral-400">{project.description}</p>

      {/* CREATE / UPDATE task */}
      <form onSubmit={submit} className="card mt-8 grid gap-3 sm:grid-cols-4">
        <input className="input sm:col-span-2" placeholder="Task title" value={form.title} onChange={set('title')} required />
        <select className="input" value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} />
        <textarea className="input sm:col-span-3" rows={2} placeholder="Details" value={form.description} onChange={set('description')} />
        <div className="flex items-start gap-2">
          <button className="btn">{editId ? 'Save' : 'Add task'}</button>
          {editId && (
            <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setForm(empty); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* READ: board */}
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <section key={col.key}>
            <h2 className="display mb-3 text-3xl">
              {col.title}{' '}
              <span className="text-lime">{tasks.filter((t) => t.status === col.key).length}</span>
            </h2>
            <div className="space-y-3">
              {tasks.filter((t) => t.status === col.key).map((t) => (
                <div key={t._id} data-card className="card">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{t.title}</h3>
                    <span className={`label ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  </div>
                  {t.description && <p className="mt-1 text-sm text-neutral-400">{t.description}</p>}
                  {t.dueDate && <p className="label mt-2">Due {new Date(t.dueDate).toLocaleDateString()}</p>}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select className="input !w-auto !py-1 text-xs" value={t.status} onChange={(e) => move(t, e.target.value)}>
                      {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
                    </select>
                    <button className="btn-ghost" onClick={() => edit(t)}>Edit</button>
                    <button className="btn-ghost" onClick={() => remove(t._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}