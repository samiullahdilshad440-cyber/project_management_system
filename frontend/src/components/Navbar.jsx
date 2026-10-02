import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap, useGSAP } from '../lib/gsap';

export default function Navbar() {
  const { user, logout } = useAuth();
  const ref = useRef(null);

  useGSAP(() => {
    gsap.from(ref.current, { yPercent: -100, duration: 0.8, ease: 'power3.out' });
  }, { scope: ref });

  return (
    <header ref={ref} className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink/90 px-6 py-4 backdrop-blur">
      <Link to="/dashboard" className="display text-2xl">
        Project<span className="text-lime">Website</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="label hidden sm:block">User · {user.name}</span>
        {user.avatar && <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />}
        <button onClick={logout} className="btn-ghost">Log out</button>
      </div>
    </header>
  );
}