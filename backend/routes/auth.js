import { Router } from 'express';
import passport from 'passport';
import User from '../models/User.js';
import { protect, signToken, setAuthCookie } from '../middleware/auth.js';

const router = Router();


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: 'Name, email and a 6+ char password are required' });
  if (await User.findOne({ email }))
    return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  setAuthCookie(res, signToken(user.id));
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  setAuthCookie(res, signToken(user.id));
  res.json({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });
});

router.get('/me', protect, (req, res) => {
  const { id, name, email, avatar } = req.user;
  res.json({ id, name, email, avatar });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
       secure: process.env.NODE_ENV === 'production',
     });;
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// ---- Google OAuth ----
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));


router.get(
  '/callback/google',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/`,
  }),
  (req, res) => {
    setAuthCookie(res, signToken(req.user.id));
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

export default router;