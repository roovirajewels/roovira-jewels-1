// Basic store + cart + UPI checkout (client-only; works on GitHub Pages)
const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
  settings: null
};

const fmt = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 });

function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }

function cartCount(){
  return state.cart.reduce((a,i)=>a+i.qty,0);
}

function cartTotal(){
  return state.cart.reduce((a,i)=>a+i.qty*i.price,0);
}

function renderGrid(list){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="body">
        <div class="badge">${p.category}</div>
        <strong>${p.title}</strong>
        <div class="price">${fmt.format(p.price)}</div>
        <button class="btn accent" data-add="${p.id}">Add to Cart</button>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.getAttribute('data-add');
      const prod = state.products.find(p=>p.id===id);
      const existing = state.cart.find(i=>i.id===id);
      if(existing){ existing.qty += 1; } else { state.cart.push({...prod, qty:1}); }
      saveCart(); updateCartBadge();
    });
  });
}

function renderCart(){
  const list = document.getElementById('cartItems');
  list.innerHTML = '';
  if(state.cart.length===0){
    list.innerHTML = '<div class="small">Your cart is empty.</div>';
  } else {
    state.cart.forEach(item=>{
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <div class="meta">
          <div><strong>${item.title}</strong></div>
          <div class="small">${fmt.format(item.price)}</div>
          <div class="qty">
            <button class="btn" data-dec="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="btn" data-inc="${item.id}">+</button>
            <button class="btn" data-rm="${item.id}" style="margin-left:auto">Remove</button>
          </div>
        </div>`;
      list.appendChild(el);
    });
  }
  document.getElementById('cartTotal').textContent = fmt.format(cartTotal());
  list.querySelectorAll('[data-inc]').forEach(b=>b.onclick = () => changeQty(b.getAttribute('data-inc'), +1));
  list.querySelectorAll('[data-dec]').forEach(b=>b.onclick = () => changeQty(b.getAttribute('data-dec'), -1));
  list.querySelectorAll('[data-rm]').forEach(b=>b.onclick = () => removeItem(b.getAttribute('data-rm')));
}

function changeQty(id, d){
  const it = state.cart.find(i=>i.id===id);
  if(!it) return;
  it.qty += d;
  if(it.qty<=0) state.cart = state.cart.filter(i=>i.id!==id);
  saveCart(); renderCart(); updateCartBadge();
}

function removeItem(id){
  state.cart = state.cart.filter(i=>i.id!==id);
  saveCart(); renderCart(); updateCartBadge();
}

function updateCartBadge(){
  document.getElementById('cartCount').textContent = cartCount();
}

function toggleDrawer(open){
  const drawer = document.getElementById('cartDrawer');
  if(open){ drawer.classList.add('open'); renderCart(); }
  else { drawer.classList.remove('open'); }
}

function buildOrderRef(){
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random()*1e6).toString().padStart(6,'0');
  return `RJ-${t}-${r}`;
}

function buildUPILink(amount, note){
  const vpa = encodeURIComponent(state.settings.merchant_vpa);
  const name = encodeURIComponent(state.settings.merchant_name);
  const tn  = encodeURIComponent(note);
  const am  = encodeURIComponent(amount.toFixed(2));
  // UPI deep link spec
  return `upi://pay?pa=${vpa}&pn=${name}&am=${am}&cu=INR&tn=${tn}`;
}

async function populate(){
  const [p, s] = await Promise.all([
    fetch('products.json').then(r=>r.json()),
    fetch('settings.json').then(r=>r.json())
  ]);
  state.products = p;
  state.settings = s;
  renderGrid(state.products);
  updateCartBadge();
  document.getElementById('year').textContent = new Date().getFullYear();
}

function applyFilters(){
  const query = document.getElementById('search').value.toLowerCase().trim();
  const activeCat = document.querySelector('#filters .tag.active')?.textContent || 'All';
  let list = [...state.products];
  if(activeCat !== 'All'){
    list = list.filter(p=>p.category===activeCat);
  }
  if(query){
    list = list.filter(p=> (p.title+' '+p.category).toLowerCase().includes(query));
  }
  renderGrid(list);
}

function openCheckoutModal(){
  const total = cartTotal();
  if(total<=0){ alert('Your cart is empty.'); return; }
  // Build order summary
  const summary = document.getElementById('summary');
  let html = '<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>';
  state.cart.forEach(i=>{
    html += `<tr><td>${i.title}</td><td>${i.qty}</td><td>${fmt.format(i.qty*i.price)}</td></tr>`;
  });
  html += `</tbody><tfoot><tr><th colspan="2">Total</th><th>${fmt.format(total)}</th></tr></tfoot></table>`;
  summary.innerHTML = html;

  // Build UPI link with pre-filled amount and note
  const ref = buildOrderRef();
  localStorage.setItem('lastOrderRef', ref);
  const note = state.settings.success_note_prefix + ref;
  const upi = buildUPILink(total, note);

  const a = document.getElementById('upiLink');
  a.href = upi;
  document.getElementById('upiLinkText').textContent = upi;

  document.getElementById('checkoutModal').classList.add('open');
}

document.addEventListener('DOMContentLoaded', ()=>{
  populate();

  document.getElementById('openCart').onclick = ()=> toggleDrawer(true);
  document.getElementById('closeCart').onclick = ()=> toggleDrawer(false);
  document.getElementById('goCheckout').onclick = ()=> { toggleDrawer(false); openCheckoutModal(); };
  document.getElementById('openCheckout').onclick = ()=> openCheckoutModal();
  document.getElementById('closeCheckout').onclick = ()=> document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('clearCart').onclick = ()=> { state.cart=[]; saveCart(); renderCart(); updateCartBadge(); };

  document.getElementById('search').addEventListener('input', applyFilters);
  document.querySelectorAll('#filters .tag').forEach(tag=>{
    tag.addEventListener('click', ()=>{
      document.querySelectorAll('#filters .tag').forEach(t=>t.classList.remove('active'));
      tag.classList.add('active');
      applyFilters();
    });
  });

  // Confirm paid just navigates to success page (no auto verification possible on GitHub Pages)
  document.getElementById('confirmPaid').addEventListener('click', ()=>{
    // In a real backend, you'd verify payment via webhook before confirming.
  });
});
