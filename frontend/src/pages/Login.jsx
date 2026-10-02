import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Line from '../components/Line';
import { gsap, useGSAP, useHeadingReveal } from '../lib/gsap';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const root = useRef(null);

  useHeadingReveal(root);

  useGSAP(() => {
    gsap.from('[data-fade]', { opacity: 0, y: 24, duration: 0.8, stagger: 0.12, delay: 0.5, ease: 'power3.out' });
    gsap.to('[data-blob]', { x: 80, y: -50, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }, { scope: root });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <main ref={root} className="grid min-h-screen overflow-hidden lg:grid-cols-2">
      <section className="relative flex flex-col justify-between p-8 lg:p-14">
        <div data-blob className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-lime/20 blur-3xl" />
        <p data-fade className="label relative">Project control · since 2026</p>
        <h1 className="display relative text-[22vw] lg:text-[11vw]">
          <Line>Project</Line>
          <Line className="text-lime">Website</Line>
        </h1>
        <p data-fade className="relative max-w-sm text-neutral-400">
          Redefine your limits. Plan the projects, run the laps, take the win.
        </p>
      </section>

      <section className="flex items-center justify-center border-line p-8 lg:border-l">
        <form data-fade onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h2 className="display text-5xl">{mode === 'login' ? 'Sign in' : 'Join the Website'}</h2>

          {mode === 'register' && (
            <input className="input" placeholder="Name" value={form.name} onChange={set('name')} required />
          )}
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className="input" type="password" placeholder="Password (6+ chars)" value={form.password} onChange={set('password')} required />

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button className="btn w-full">{mode === 'login' ? 'Sign in' : 'Create account'}</button>

          <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="btn-ghost block w-full py-2.5 text-center">
            Continue with Google
          </a>

          <p className="label text-center">
            {mode === 'login' ? 'New here?' : 'Already racing?'}{' '}
            <button type="button" className="cursor-pointer text-lime"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}