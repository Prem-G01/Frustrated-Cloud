// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000"; // Change to backend URL when deployed

// ---------- Helper Components ----------
const Navbar = ({ user, onLogout }) => (
  <nav className="navbar">
    <Link to="/">🏠 Frustrated Cloud</Link>
    {user ? (
      <>
        <Link to="/profile">Profile</Link>
        <Link to="/services">Services</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Orders</Link>
        <button onClick={onLogout}>Logout</button>
      </>
    ) : (
      <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </>
    )}
  </nav>
);

// ---------- Login ----------
const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/profile");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <form className="form" onSubmit={login}>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

// ---------- Register ----------
const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, form);
      alert("Registration successful!");
      navigate("/login");
    } catch {
      alert("Error registering");
    }
  };

  return (
    <form className="form" onSubmit={register}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Register</button>
    </form>
  );
};

// ---------- Profile ----------
const Profile = ({ user, setUser }) => {
  const [form, setForm] = useState(user || {});

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated");
      setUser(res.data);
    } catch {
      alert("Failed to update");
    }
  };

  return (
    <div className="profile">
      <h2>My Profile</h2>
      <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <button onClick={updateProfile}>Save</button>
    </div>
  );
};

// ---------- Services ----------
const Services = ({ addToCart }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/services`).then((res) => setServices(res.data));
  }, []);

  return (
    <div className="services">
      <h2>Available Services (90% OFF!)</h2>
      <ul>
        {services.map((s) => (
          <li key={s.id}>
            {s.name} — ₹{(s.price * 0.1).toFixed(2)} /month
            <button onClick={() => addToCart(s)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ---------- Cart ----------
const Cart = ({ cart, setCart }) => {
  const total = cart.reduce((acc, item) => acc + item.price * 0.1 * item.qty, 0);

  const updateQty = (id, delta) => {
    setCart(
      cart.map((c) =>
        c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
      )
    );
  };

  const removeItem = (id) => setCart(cart.filter((c) => c.id !== id));

  const placeOrder = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/orders`, { items: cart }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Order placed!");
      setCart([]);
    } catch {
      alert("Error placing order");
    }
  };

  return (
    <div className="cart">
      <h2>My Cart</h2>
      {cart.length === 0 ? (
        <p>No items added</p>
      ) : (
        <>
          <ul>
            {cart.map((c) => (
              <li key={c.id}>
                {c.name} — ₹{(c.price * 0.1).toFixed(2)} × {c.qty}
                <button onClick={() => updateQty(c.id, 1)}>+</button>
                <button onClick={() => updateQty(c.id, -1)}>-</button>
                <button onClick={() => removeItem(c.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ₹{total.toFixed(2)}</h3>
          <button onClick={placeOrder}>Place Order</button>
        </>
      )}
    </div>
  );
};

// ---------- Orders ----------
const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="orders">
      <h2>My Orders</h2>
      {orders.length === 0 ? <p>No orders yet</p> : null}
      {orders.map((o) => (
        <div key={o.id} className="order">
          <p>Order #{o.id}</p>
          <ul>
            {o.items.map((i) => (
              <li key={i.id}>
                {i.name} × {i.qty}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// ---------- Root App ----------
const App = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  const addToCart = (service) => {
    const existing = cart.find((c) => c.id === service.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === service.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { ...service, qty: 1 }]);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<h1>Welcome to Frustrated Cloud ☁️</h1>} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/services" element={<Services addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
};

export default App;
