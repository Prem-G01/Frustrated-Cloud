import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { initDB } from './db.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const db = initDB();
const SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(bodyParser.json());

// Helper middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No auth header' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// AUTH REGISTER
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const hash = bcrypt.hashSync(password, 8);
  try {
    const stmt = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)');
    const info = stmt.run(name || '', email, hash);
    const token = jwt.sign({ id: info.lastInsertRowid, email }, SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'User exists or DB error' });
  }
});

// AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET);
  res.json({ token });
});

// PROFILE
app.get('/api/profile', auth, (req, res) => {
  const user = db.prepare('SELECT id,name,email,created_at FROM users WHERE id=?').get(req.user.id);
  res.json(user);
});
app.put('/api/profile', auth, (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE users SET name=? WHERE id=?').run(name, req.user.id);
  res.json({ success: true });
});

// SERVICES
app.get('/api/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  res.json(services);
});

// CART
app.get('/api/cart', auth, (req, res) => {
  const items = db.prepare(`SELECT c.id, s.name, s.price_per_month, c.quantity, (s.price_per_month*c.quantity) AS subtotal
    FROM cart_items c JOIN services s ON c.service_id=s.id WHERE c.user_id=?`).all(req.user.id);
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);
  const discount = total * 0.9;
  const payable = total - discount;
  res.json({ items, total, discount, payable });
});

app.post('/api/cart', auth, (req, res) => {
  const { service_id, quantity } = req.body;
  db.prepare('INSERT INTO cart_items (user_id, service_id, quantity) VALUES (?,?,?)').run(req.user.id, service_id, quantity || 1);
  res.json({ success: true });
});

app.put('/api/cart/:id', auth, (req, res) => {
  const { quantity } = req.body;
  db.prepare('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?').run(quantity, req.params.id, req.user.id);
  res.json({ success: true });
});

app.delete('/api/cart/:id', auth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// PLACE ORDER
app.post('/api/orders', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM cart_items WHERE user_id=?').all(req.user.id);
  if (!items.length) return res.status(400).json({ error: 'Cart empty' });
  let total = 0;
  for (const i of items) {
    const s = db.prepare('SELECT * FROM services WHERE id=?').get(i.service_id);
    total += s.price_per_month * i.quantity;
  }
  const discount = total * 0.9;
  const payable = total - discount;
  const order = db.prepare('INSERT INTO orders (user_id,total_amount,discount_amount,payable_amount) VALUES (?,?,?,?)')
    .run(req.user.id, total, discount, payable);
  for (const i of items) {
    const s = db.prepare('SELECT * FROM services WHERE id=?').get(i.service_id);
    db.prepare('INSERT INTO order_items (order_id,service_id,quantity,unit_price) VALUES (?,?,?,?)')
      .run(order.lastInsertRowid, i.service_id, i.quantity, s.price_per_month);
  }
  db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  res.json({ success: true, order_id: order.lastInsertRowid, payable });
});

// VIEW ORDERS
app.get('/api/orders', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(orders);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
