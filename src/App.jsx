import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, UserRound, Menu, X, ArrowUpRight, Plus, Minus, Trash2, Package, LayoutDashboard, LogOut, Sparkles, CheckCircle2 } from 'lucide-react';
import { categories, starterProducts } from './data';

const StoreContext = createContext(null);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };

function StoreProvider({ children }) {
  const [user, setUser] = useState(() => read('nova-user', null));
  const [products, setProducts] = useState(() => read('nova-products', starterProducts));
  const [cart, setCart] = useState(() => read('nova-cart', []));
  useEffect(() => localStorage.setItem('nova-user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('nova-products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('nova-cart', JSON.stringify(cart)), [cart]);
  const addToCart = product => setCart(old => {
    const found = old.find(item => item.id === product.id);
    return found ? old.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...old, { ...product, qty: 1 }];
  });
  // Clear the persisted session immediately as well as updating React state.
  const logout = () => {
    localStorage.removeItem('nova-user');
    setUser(null);
  };
  const value = { user, setUser, logout, products, setProducts, cart, setCart, addToCart };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
const useStore = () => useContext(StoreContext);

function Header() {
  const { user, cart, logout } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const submit = e => { e.preventDefault(); navigate('/products?q=' + encodeURIComponent(query.trim())); setSearchOpen(false); setMobileOpen(false); };
  return <header className="header">
    <div className="header-inner">
      <Link to="/" className="brand"><span className="brand-mark">n.</span> nova<span className="brand-dot">.</span></Link>
      <nav className={mobileOpen ? 'nav nav-open' : 'nav'}>
        <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/products" onClick={() => setMobileOpen(false)}>Products</NavLink>
        <a href="/#story" onClick={() => setMobileOpen(false)}>Our story</a>
      </nav>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={19}/></button>
        <Link className="icon-btn account-btn" to={user ? (user.role === 'admin' ? '/admin' : '/') : '/login'} aria-label="Account"><UserRound size={19}/></Link>
        {user && <button type="button" className="header-logout" onClick={() => { logout(); setSearchOpen(false); setMobileOpen(false); navigate('/'); }}><LogOut size={15}/> <span>Logout</span></button>}
        <Link className="icon-btn bag-btn" to="/cart" aria-label="Shopping cart"><ShoppingBag size={19}/>{count > 0 && <span className="bag-count">{count}</span>}</Link>
        <button className="icon-btn mobile-menu" aria-label="Menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
    </div>
    {searchOpen && <form className="search-bar" onSubmit={submit}><Search size={18}/><input autoFocus placeholder="Search the collection..." value={query} onChange={e => setQuery(e.target.value)}/><button className="text-btn">Search</button></form>}
  </header>;
}

function ProductCard({ product }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  return <article className="product-card">
    <div className="product-image-wrap product-image-click" onClick={() => navigate('/products/' + product.id)} role="link" tabIndex="0" onKeyDown={e => {if(e.key === 'Enter') navigate('/products/' + product.id);}}>
      <img src={product.image} alt={product.name} onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85'; }}/>
      {product.tag && <span className="product-tag">{product.tag}</span>}
      <button className="quick-add" onClick={e => {e.stopPropagation(); addToCart(product);}} aria-label={'Add ' + product.name + ' to cart'}><Plus size={18}/></button>
    </div>
    <div className="product-meta"><span>{product.category}</span><span className="rating">★ {product.rating || '4.8'}</span></div>
    <div className="product-title-row"><h3><Link to={"/products/" + product.id}>{product.name}</Link></h3><strong>${Number(product.price).toFixed(2)}</strong></div>
    {product.oldPrice && <p className="old-price">${Number(product.oldPrice).toFixed(2)}</p>}
  </article>;
}

function Home() {
  const { products, user } = useStore();
  const [category, setCategory] = useState('All');
  const params = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(params.get('q') || '');
  const filtered = useMemo(() => products.filter(p => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [products, category, query]);
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"></span> THE EVERYDAY, ELEVATED</div>
          <h1>Find your<br/><em>new</em> favourite.</h1>
          <p>Good things, thoughtfully selected. Discover pieces that bring a little more joy to your everyday.</p>
          <div className="hero-actions"><a className="btn btn-dark" href="#products">Explore collection <ArrowUpRight size={17}/></a><span className="hero-note">Curated for the curious.</span></div>
          {user && <div className="welcome-note"><CheckCircle2 size={16}/> Welcome back, {user.name}.</div>}
        </div>
        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=1300&q=90" alt="Carefully curated modern lifestyle objects"/>
          <div className="hero-sticker"><Sparkles size={17}/><span>Little things.<br/>Big feeling.</span></div>
          <div className="hero-index">01 — 04</div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span>EST. 2024&nbsp; · &nbsp;MADE FOR EVERY DAY</span></div>
      </section>

      <section className="category-section section-wrap">
        <div className="section-heading"><div><div className="eyebrow">A LITTLE BIT OF EVERYTHING</div><h2>Shop by <em>mood.</em></h2></div><span className="muted-copy">Find your kind of good.</span></div>
        <div className="category-grid">
          {categories.filter(c => c.name !== 'All').map((c, i) => <button key={c.name} className={'category-tile tile-' + i + (category === c.name ? ' selected' : '')} onClick={() => {setCategory(c.name); document.getElementById('products')?.scrollIntoView({behavior:'smooth'});}}>
            <span className="category-icon">{c.icon}</span><span className="category-name">{c.name}</span><span className="category-desc">{c.description}</span><ArrowUpRight className="category-arrow" size={18}/>
          </button>)}
        </div>
      </section>

      <section className="products-section section-wrap" id="products">
        <div className="section-heading"><div><div className="eyebrow">THE GOOD STUFF</div><h2>Made to be <em>loved.</em></h2></div><a className="under-link" href="#products">Explore all <ArrowUpRight size={16}/></a></div>
        <div className="filter-row">
          <div className="filter-pills">{categories.map(c => <button key={c.name} onClick={() => setCategory(c.name)} className={category === c.name ? 'filter-pill active' : 'filter-pill'}>{c.name}</button>)}</div>
          <label className="inline-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find something..."/></label>
        </div>
        {filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty-state"><Package size={30}/><h3>No products found</h3><p>Try another search or category.</p><button className="btn btn-outline" onClick={() => {setCategory('All');setQuery('');}}>Clear filters</button></div>}
      </section>

      <section className="story-section" id="story"><div className="story-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85" alt="A thoughtfully designed retail space"/></div><div className="story-copy"><div className="eyebrow">LESS, BUT BETTER</div><h2>Keep the things<br/>that make you <em>feel good.</em></h2><p>Nova is a little corner of the internet for useful, beautiful things. We believe the best finds are the ones that become part of your everyday.</p><a className="under-link" href="#products">Find your next favourite <ArrowUpRight size={16}/></a></div></section>
    </main>
    <Footer/>
  </>;
}


function ProductsPage() {
  const { products } = useStore();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState(() => searchParams.get('q') || '');

  // Keep the search field in sync when a new search is submitted from the header.
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setCategory('All');
  }, [searchParams]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    const searchableText = [p.name, p.category, p.description, p.tag].filter(Boolean).join(' ').toLowerCase();
    return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
  return <main className="products-page section-wrap">
    <div className="eyebrow">THE NOVA COLLECTION</div>
    <div className="section-heading"><div><h2>All the good <em>stuff.</em></h2><p className="page-intro">Thoughtfully selected pieces for your everyday.</p></div><span className="muted-copy">{filtered.length} products</span></div>
    <div className="filter-row">
      <div className="filter-pills">{categories.map(c => <button key={c.name} onClick={() => setCategory(c.name)} className={category === c.name ? 'filter-pill active' : 'filter-pill'}>{c.name}</button>)}</div>
      <label className="inline-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find something..."/></label>
    </div>
    {filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <div className="empty-state"><Package size={30}/><h3>No products found</h3><p>Try another search or category.</p><button className="btn btn-outline" onClick={() => {setCategory('All');setQuery('');}}>Clear filters</button></div>}
  </main>;
}

function ProductDetails() {
  const { products, addToCart } = useStore();
  const { id } = useParams();
  const product = products.find(p => String(p.id) === id);
  if (!product) return <div className="empty-state not-found"><h1>Product not found</h1><Link className="btn btn-dark" to="/products">Browse products</Link></div>;
  return <main className="product-detail-page">
    <Link to="/products" className="back-link-inline">← Back to products</Link>
    <div className="detail-layout">
      <div className="detail-image"><img src={product.image} alt={product.name} onError={e => {e.currentTarget.src='https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85';}}/></div>
      <div className="detail-copy">
        <div className="eyebrow">{product.category.toUpperCase()} / NOVA EDIT</div>
        <h1>{product.name}</h1>
        <div className="detail-rating">★ {product.rating || '4.8'} <span>·</span> Thoughtfully selected</div>
        <div className="detail-price">${Number(product.price).toFixed(2)} {product.oldPrice && <del>${Number(product.oldPrice).toFixed(2)}</del>}</div>
        <p>{product.description || 'A thoughtfully selected piece, made to bring a little more joy to your everyday.'}</p>
        <button className="btn btn-dark detail-add" onClick={() => addToCart(product)}>Add to bag <ShoppingBag size={17}/></button>
        <div className="detail-perks"><span>✳ Carefully selected</span><span>✳ Cash on delivery available</span><span>✳ Easy order support</span></div>
      </div>
    </div>
  </main>;
}

function Login() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const validate = () => {
    const next = {};
    if (mode === 'register' && form.name.trim().length < 2) next.name = 'Please enter your name (at least 2 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    setErrors(next); return Object.keys(next).length === 0;
  };
  const submit = e => {
    e.preventDefault(); setNotice('');
    if (!validate()) return;
    const email = form.email.trim().toLowerCase();
    if (email === 'admin@nova.com' && form.password === 'Admin@123') {
      setUser({ name: 'Admin', email, role: 'admin' }); navigate('/admin'); return;
    }
    if (mode === 'register') {
      const account = { name: form.name.trim(), email, password: form.password };
      const users = JSON.parse(localStorage.getItem('nova-accounts') || '[]');
      if (users.some(u => u.email === email)) { setErrors({ email: 'An account with this email already exists.' }); return; }
      localStorage.setItem('nova-accounts', JSON.stringify([...users, account]));
      setUser({ name: account.name, email, role: 'customer' }); navigate('/'); return;
    }
    const users = JSON.parse(localStorage.getItem('nova-accounts') || '[]');
    const account = users.find(u => u.email === email && u.password === form.password);
    if (email === 'user@demo.com' && form.password === 'User@123') {
      setUser({ name: 'Alex', email, role: 'customer' }); navigate('/');
    } else if (account) { setUser({ name: account.name, email, role: 'customer' }); navigate('/'); }
    else setNotice('Email or password is incorrect. Try the demo account below.');
  };
  return <div className="auth-page"><div className="auth-art"><div className="auth-art-content"><span className="brand brand-light"><span className="brand-mark">n.</span> nova<span className="brand-dot">.</span></span><h2>Good finds.<br/><em>Good days.</em></h2><p>A more considered way to shop the everyday.</p><div className="auth-art-caption">OBJECTS WITH A LITTLE MORE SOUL&nbsp; · &nbsp;NOVA STUDIO</div></div></div>
    <div className="auth-panel"><Link to="/" className="back-link">← Back to store</Link><div className="auth-form-wrap"><div className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN THE COMMUNITY'}</div><h1>{mode === 'login' ? 'Sign in to your' : 'Create your'}<br/><em>good place.</em></h1><p className="auth-sub">{mode === 'login' ? 'Your next favourite find is just around the corner.' : 'Create an account and make yourself at home.'}</p>
      <form onSubmit={submit} noValidate>
        {mode === 'register' && <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan"/>{errors.name && <small className="error">{errors.name}</small>}</div>}
        <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email"/>{errors.email && <small className="error">{errors.email}</small>}</div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/>{errors.password && <small className="error">{errors.password}</small>}</div>
        {notice && <div className="form-notice">{notice}</div>}
        <button className="btn btn-dark auth-submit" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17}/></button>
      </form>
      <p className="switch-auth">{mode === 'login' ? 'New around here?' : 'Already have an account?'} <button onClick={() => {setMode(mode === 'login' ? 'register' : 'login');setErrors({});setNotice('');}}> {mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
    </div></div></div>;
}

function Admin() {
  const { user, products, setProducts, logout } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: 'Tech', price: '', image: '', description: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { if (!user || user.role !== 'admin') navigate('/login'); }, [user, navigate]);
  if (!user || user.role !== 'admin') return null;
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const addProduct = e => {
    e.preventDefault(); setMessage('');
    if (form.name.trim().length < 2 || !form.price || Number(form.price) <= 0 || !form.image.trim()) { setMessage('Please add a product name, a valid price and an image URL.'); return; }
    if (form.image && !/^https?:\/\/.+/i.test(form.image)) { setMessage('Image must be a valid http or https URL.'); return; }
    const item = { ...form, id: Date.now(), price: Number(form.price), oldPrice: null, rating: 4.8, tag: 'NEW' };
    setProducts([item, ...products]); setForm({ name: '', category: 'Tech', price: '', image: '', description: '' }); setMessage('Product added successfully.');
  };
  const remove = id => setProducts(products.filter(p => p.id !== id));
  return <div className="admin-page"><div className="admin-top"><div><div className="eyebrow">NOVA CONTROL ROOM</div><h1>Good morning, <em>{user.name}.</em></h1><p>Manage your collection and keep the good stuff coming.</p></div><button type="button" className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}><LogOut size={16}/> Sign out</button></div>
    <div className="admin-stats"><div className="stat-card"><span>LIVE PRODUCTS</span><strong>{products.length}</strong><small>In your collection</small></div><div className="stat-card"><span>CATEGORIES</span><strong>{categories.length - 1}</strong><small>Curated collections</small></div><div className="stat-card"><span>STORE STATUS</span><strong className="live-status">● Live</strong><small>Your storefront is ready</small></div></div>
    <div className="admin-layout"><section className="admin-card"><div className="admin-card-heading"><div><span className="eyebrow">ADD SOMETHING GOOD</span><h2>New product</h2></div><span className="admin-icon"><Plus/></span></div>
      <form onSubmit={addProduct} className="admin-form"><div className="field"><label>Product name</label><input name="name" value={form.name} onChange={update} placeholder="e.g. Everyday tote"/></div><div className="form-two"><div className="field"><label>Category</label><select name="category" value={form.category} onChange={update}>{categories.filter(c => c.name !== 'All').map(c => <option key={c.name}>{c.name}</option>)}</select></div><div className="field"><label>Price (USD)</label><input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={update} placeholder="49.00"/></div></div><div className="field"><label>Image URL</label><input name="image" value={form.image} onChange={update} placeholder="https://example.com/image.jpg"/></div><div className="field"><label>Description <span className="optional">OPTIONAL</span></label><textarea name="description" value={form.description} onChange={update} placeholder="A few words about your product..." rows="3"/></div>{message && <div className={message.includes('successfully') ? 'success-message' : 'form-notice'}>{message}</div>}<button className="btn btn-dark" type="submit"><Plus size={17}/> Add product</button></form>
    </section><section className="admin-card inventory-card"><div className="admin-card-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h2>Inventory <span className="count-bubble">{products.length}</span></h2></div><Package className="inventory-icon"/></div><div className="inventory-list">{products.map(p => <div className="inventory-item" key={p.id}><img src={p.image} alt="" onError={e => e.currentTarget.style.visibility='hidden'}/><div className="inventory-info"><strong>{p.name}</strong><span>{p.category} · ${Number(p.price).toFixed(2)}</span></div><button className="delete-btn" onClick={() => remove(p.id)} aria-label={'Delete ' + p.name}><Trash2 size={17}/></button></div>)}</div></section></div>
  </div>;
}

function Cart() {
  const { cart, setCart, addToCart } = useStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const change = (id, delta) => setCart(cart.map(i => i.id === id ? {...i, qty: i.qty + delta} : i).filter(i => i.qty > 0));
  return <><div className="cart-page"><div className="eyebrow">YOUR LITTLE FINDS</div><h1>Shopping <em>bag.</em></h1>{cart.length ? <div className="cart-layout"><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><span>{item.category}</span><h3>{item.name}</h3><strong>${Number(item.price).toFixed(2)}</strong><div className="qty-control"><button onClick={() => change(item.id,-1)} aria-label="Decrease quantity"><Minus size={14}/></button><span>{item.qty}</span><button onClick={() => change(item.id,1)} aria-label="Increase quantity"><Plus size={14}/></button></div></div><button className="delete-btn" onClick={() => setCart(cart.filter(i => i.id !== item.id))} aria-label="Remove item"><Trash2 size={17}/></button></div>)}</div><aside className="cart-summary"><span className="eyebrow">THE TOTAL</span><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><div className="summary-line"><span>Shipping</span><strong>Free</strong></div><div className="summary-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div><Link className="btn btn-dark checkout-btn" to="/checkout">Continue to checkout <ArrowUpRight size={17}/></Link><p className="checkout-note">Pay in cash when your order arrives.</p></aside></div> : <div className="empty-state"><ShoppingBag size={32}/><h3>Your bag is taking a little break.</h3><p>There are plenty of good finds waiting for you.</p><Link to="/" className="btn btn-dark">Explore the store <ArrowUpRight size={17}/></Link></div>}</div><Footer/></>;
}


function Checkout() {
  const { cart, setCart, user } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = e => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[+0-9 ()-]{7,18}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number.';
    if (form.address.trim().length < 8) next.address = 'Please enter your complete delivery address.';
    if (form.city.trim().length < 2) next.city = 'Enter your city.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const orders = JSON.parse(localStorage.getItem('nova-orders') || '[]');
    const order = { id: 'NV' + Date.now().toString().slice(-7), customer: form, items: cart, total, payment: 'Cash on Delivery', createdAt: new Date().toISOString() };
    localStorage.setItem('nova-orders', JSON.stringify([order, ...orders]));
    setCart([]);
    setPlaced(true);
  };
  if (!cart.length && !placed) return <div className="empty-state checkout-empty"><h3>Your bag is empty.</h3><Link to="/products" className="btn btn-dark">Browse products</Link></div>;
  if (placed) return <div className="order-success"><div className="success-check"><CheckCircle2 size={34}/></div><div className="eyebrow">ORDER CONFIRMED</div><h1>You're all <em>set.</em></h1><p>Your order has been placed with Cash on Delivery. Keep your phone nearby for delivery updates.</p><div className="order-number">ORDER NUMBER <strong>{JSON.parse(localStorage.getItem('nova-orders') || '[]')[0]?.id}</strong></div><Link to="/" className="btn btn-dark">Back to home <ArrowUpRight size={17}/></Link></div>;
  return <main className="checkout-page">
    <div className="eyebrow">ALMOST YOURS</div><h1>Checkout <em>time.</em></h1>
    <div className="checkout-layout">
      <form className="admin-card checkout-form" onSubmit={submit} noValidate>
        <div className="admin-card-heading"><div><span className="eyebrow">DELIVERY DETAILS</span><h2>Where should we send it?</h2></div></div>
        <div className="field"><label>Full name</label><input name="name" value={form.name} onChange={update} placeholder="Your full name"/>{errors.name && <small className="error">{errors.name}</small>}</div>
        <div className="field"><label>Phone number</label><input name="phone" value={form.phone} onChange={update} placeholder="+92 300 1234567"/>{errors.phone && <small className="error">{errors.phone}</small>}</div>
        <div className="field"><label>Delivery address</label><textarea name="address" rows="3" value={form.address} onChange={update} placeholder="House, street, area and nearby landmark"/>{errors.address && <small className="error">{errors.address}</small>}</div>
        <div className="field"><label>City</label><input name="city" value={form.city} onChange={update} placeholder="Your city"/>{errors.city && <small className="error">{errors.city}</small>}</div>
        <div className="field"><label>Order notes <span className="optional">OPTIONAL</span></label><textarea name="notes" rows="2" value={form.notes} onChange={update} placeholder="Any delivery instructions?"/></div>
        <div className="payment-method"><span className="cod-radio">✓</span><div><strong>Cash on Delivery</strong><small>Pay in cash when your order arrives.</small></div><span className="cod-label">AVAILABLE</span></div>
        <button className="btn btn-dark checkout-btn" type="submit">Place order <ArrowUpRight size={17}/></button>
      </form>
      <aside className="cart-summary checkout-summary"><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2>{cart.map(item => <div className="checkout-product" key={item.id}><img src={item.image} alt=""/><div><strong>{item.name}</strong><span>Qty {item.qty}</span></div><b>${(item.price * item.qty).toFixed(2)}</b></div>)}<div className="summary-line"><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><div className="summary-line"><span>Delivery</span><strong>Free</strong></div><div className="summary-total"><span>Total due on delivery</span><strong>${total.toFixed(2)}</strong></div><p className="checkout-note">No online payment required. Pay the courier in cash.</p></aside>
    </div>
  </main>;
}

function Footer() { return <footer className="footer"><div className="footer-main"><Link to="/" className="brand"><span className="brand-mark">n.</span> nova<span className="brand-dot">.</span></Link><p>Good things for everyday living.<br/>Thoughtfully found, just for you.</p><a className="back-top" href="#">Back to top ↑</a></div><div className="footer-bottom"><span>© 2026 NOVA STUDIO</span><span>MADE FOR THE EVERYDAY&nbsp; ✳</span><span>GOOD FINDS. GOOD DAYS.</span></div></footer>; }

function NotFound() { return <div className="empty-state not-found"><h1>404</h1><h3>This page took a little detour.</h3><Link className="btn btn-dark" to="/">Back to home</Link></div>; }

function App() { return <StoreProvider><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/products" element={<ProductsPage/>}/><Route path="/products/:id" element={<ProductDetails/>}/><Route path="/login" element={<Login/>}/><Route path="/admin" element={<Admin/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="*" element={<NotFound/>}/></Routes></StoreProvider>; }
export default App;