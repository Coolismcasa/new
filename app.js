/* ═══════════════════════════════════════════════════════════
   COOLISM — Complete App.js
   ═══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyB9V9qVT1Tsje14gVs5r2q-f1IePFqFfTE",
  authDomain: "coolism-ff714.firebaseapp.com",
  projectId: "coolism-ff714",
  storageBucket: "coolism-ff714.firebasestorage.app",
  messagingSenderId: "393937665947",
  appId: "1:393937665947:web:f7becefed9c456e3baab3e"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let PRODUCTS = [], CATEGORIES = {}, cart = [], wishlist = [], allUsers = [], allOrders = [];
let currentDetail = { product:null, size:null, color:null, qty:1, images:[] };
let currentImageIndex = 0, currentReviewProduct = null, currentOrderId = null, selectedStar = 0;
let currentFilter = 'all', currentSort = 'featured';

const FALLBACK_CATS = {
  shirts:{label:'Shirts',sub:'Heavyweight tees & crisp cotton',img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'},
  pants:{label:'Pants',sub:'Tailored wide-leg & relaxed fits',img:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'},
  jackets:{label:'Jackets',sub:'Leather, bombers & denim',img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'},
  hoodies:{label:'Hoodies',sub:'Oversized & fleece-lined comfort',img:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'}
};

const FALLBACK_PRODUCTS = [
  {id:'p1',name:'Classic Red Tee',cat:'shirts',price:2490,oldPrice:3200,tag:'New',images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80'],desc:'A relaxed-fit tee cut from heavyweight 320 GSM cotton.',sizes:['S','M','L','XL','XXL'],colors:[{name:'Red',hex:'#E33A3A'},{name:'Navy',hex:'#0B1A30'}],fabric:'100% Combed Cotton',care:'Machine wash cold',sku:'CLM-SH-001',inStock:true,stock:50,lowStock:5},
  {id:'p2',name:'Royal Oxford Shirt',cat:'shirts',price:4990,oldPrice:null,tag:null,images:['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&q=80'],desc:'A crisp Oxford weave with mother-of-pearl buttons.',sizes:['S','M','L','XL'],colors:[{name:'White',hex:'#F9F8F6'},{name:'Sky',hex:'#A8C4E0'}],fabric:'100% Cotton Oxford',care:'Machine wash warm',sku:'CLM-SH-002',inStock:true,stock:30,lowStock:5},
  {id:'p3',name:'Pleated Wide-Leg Trousers',cat:'pants',price:5890,oldPrice:6990,tag:'Bestseller',images:['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80'],desc:'Tailored with a single front pleat and a wide, flowing leg.',sizes:['30','32','34','36','38'],colors:[{name:'Brown',hex:'#6B5442'},{name:'Charcoal',hex:'#2A2A2A'}],fabric:'Poly-wool blend',care:'Dry clean only',sku:'CLM-PT-001',inStock:true,stock:25,lowStock:5},
  {id:'p4',name:'Relaxed Linen Pants',cat:'pants',price:4290,oldPrice:null,tag:null,images:['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=700&q=80'],desc:'Breathable pure linen with a soft elasticated back.',sizes:['30','32','34','36'],colors:[{name:'Sand',hex:'#D6C7A8'},{name:'Sage',hex:'#9CAE93'}],fabric:'100% European Linen',care:'Machine wash cold',sku:'CLM-PT-002',inStock:true,stock:40,lowStock:5},
  {id:'p5',name:'Moto Leather Jacket',cat:'jackets',price:18900,oldPrice:22500,tag:'Limited',images:['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80'],desc:'A classic asymmetrical biker silhouette in full-grain sheep leather.',sizes:['S','M','L','XL'],colors:[{name:'Black',hex:'#0E0E0E'},{name:'Espresso',hex:'#3A2C20'}],fabric:'Full-grain leather',care:'Wipe clean',sku:'CLM-JK-001',inStock:true,stock:8,lowStock:3},
  {id:'p6',name:'Navy Bomber Jacket',cat:'jackets',price:11900,oldPrice:null,tag:null,images:['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80'],desc:'Lightweight nylon bomber with ribbed cuffs and hem.',sizes:['S','M','L','XL','XXL'],colors:[{name:'Navy',hex:'#0B1A30'},{name:'Olive',hex:'#4A5240'}],fabric:'Nylon shell',care:'Machine wash cold',sku:'CLM-JK-002',inStock:true,stock:20,lowStock:5},
  {id:'p7',name:'Oversized Navy Hoodie',cat:'hoodies',price:6490,oldPrice:7990,tag:'Bestseller',images:['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=80'],desc:'Cut with a dropped shoulder and a boxy fit that drapes perfectly.',sizes:['S','M','L','XL','XXL'],colors:[{name:'Navy',hex:'#131F3A'},{name:'Charcoal',hex:'#3A3A3A'}],fabric:'85% Cotton / 15% Poly',care:'Machine wash cold',sku:'CLM-HD-001',inStock:true,stock:60,lowStock:5},
  {id:'p8',name:'Fleece-Lined Zip Hoodie',cat:'hoodies',price:7290,oldPrice:null,tag:'New',images:['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=700&q=80'],desc:'Full-zip hoodie with a double-lined hood and soft brushed interior.',sizes:['S','M','L','XL'],colors:[{name:'Navy',hex:'#131F3A'},{name:'Grey',hex:'#8A8A8A'}],fabric:'Cotton-poly blend',care:'Machine wash cold',sku:'CLM-HD-002',inStock:true,stock:35,lowStock:5}
];

const money = n => 'Rs ' + Number(n||0).toLocaleString('en-PK');
const getCat = k => CATEGORIES[k] || FALLBACK_CATS[k] || {label:k,sub:'',img:''};
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isPhoneOk = v => /^03\d{9}$/.test(v.replace(/[\s-]/g,''));
const lineKey = i => `${i.id}|${i.size}|${i.color}`;

function setErr(input, bad){ if(!input) return true; const f=input.closest('[data-field]'); if(f) f.classList.toggle('err',bad); return !bad; }
function clearErrors(form){ if(form) form.querySelectorAll('[data-field]').forEach(f=>f.classList.remove('err')); }
function toast(msg){
  const el = document.getElementById('toast'); if(!el) return;
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>el.classList.remove('show'), 3200);
}
function productVisualHTML(p, cls='card-placeholder'){
  const img = (p.images && p.images[0]) || p.img;
  if(img) return `<img src="${img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="${cls}" style="display:none;background:linear-gradient(140deg,#333,#111)"><span class="letter">${p.name.charAt(0)}</span></div>`;
  return `<div class="${cls}" style="background:linear-gradient(140deg,#333,#111)"><span class="letter">${p.name.charAt(0)}</span></div>`;
}
function cartVisualHTML(p){
  const img = (p.images && p.images[0]) || p.img;
  if(img) return `<img src="${img}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="mini-letter" style="display:none;background:#333">${p.name.charAt(0)}</div>`;
  return `<div class="mini-letter" style="background:#333">${p.name.charAt(0)}</div>`;
}

/* LOAD CATALOG */
async function loadCatalog(){
  try{
    const catSnap = await db.collection('categories').get();
    if(!catSnap.empty){
      const loaded = {};
      catSnap.forEach(doc => {
        const d = doc.data();
        loaded[doc.id] = { label: d.label||doc.id, sub: d.sub||'', img: d.img||'' };
      });
      CATEGORIES = { ...FALLBACK_CATS, ...loaded };
    } else CATEGORIES = { ...FALLBACK_CATS };
  } catch(err){ CATEGORIES = { ...FALLBACK_CATS }; }

  try{
    const snap = await db.collection('products').get();
    if(!snap.empty){
      PRODUCTS = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id, name: d.name||'', cat: d.cat||'shirts',
          price: Number(d.price)||0, oldPrice: d.oldPrice?Number(d.oldPrice):null,
          tag: d.tag||null, images: Array.isArray(d.images)?d.images:(d.img?[d.img]:[]),
          desc: d.desc||'', sizes: Array.isArray(d.sizes)?d.sizes:['S','M','L','XL'],
          colors: Array.isArray(d.colors)?d.colors:[{name:'Navy',hex:'#0B1A30'}],
          fabric: d.fabric||'', care: d.care||'', sku: d.sku||'',
          inStock: d.inStock!==false, stock: d.stock??50, lowStock: d.lowStock??5,
          _ts: d.createdAt?.seconds||0
        };
      });
    } else PRODUCTS = [ ...FALLBACK_PRODUCTS ];
  } catch(err){ PRODUCTS = [ ...FALLBACK_PRODUCTS ]; }
}

/* RENDER: CATEGORIES */
function renderCategoryTiles(){
  const grid = document.getElementById('catGrid'); if(!grid) return;
  grid.innerHTML = Object.keys(CATEGORIES).map(k => {
    const c = CATEGORIES[k];
    return `<a href="category.html?cat=${k}" class="cat-tile">
      <img class="cat-img" src="${c.img}" alt="${c.label}" loading="lazy" onerror="this.style.background='#ddd';this.style.display='none'">
      <div class="cat-inner"><h3>${c.label}</h3><p>${c.sub}</p></div>
    </a>`;
  }).join('');
}
function renderFooterCats(){
  const ul = document.getElementById('footerCats'); if(!ul) return;
  ul.innerHTML = Object.keys(CATEGORIES).map(k => `<li><a href="category.html?cat=${k}">${CATEGORIES[k].label}</a></li>`).join('');
}
function renderFilterChips(){
  const el = document.getElementById('filters'); if(!el) return;
  el.innerHTML = `<button class="chip active" data-filter="all">All</button>` +
    Object.keys(CATEGORIES).map(k => `<button class="chip" data-filter="${k}">${CATEGORIES[k].label}</button>`).join('');
}

/* RENDER: PRODUCTS */
function sortProducts(list, mode){
  const arr = [...list];
  if(mode === 'price-asc') arr.sort((a,b)=>a.price-b.price);
  else if(mode === 'price-desc') arr.sort((a,b)=>b.price-a.price);
  else if(mode === 'newest') arr.sort((a,b)=>(b._ts||0)-(a._ts||0));
  return arr;
}
function productCardHTML(p){
  const wished = wishlist.includes(p.id) ? 'wished' : '';
  const outOfStock = p.stock !== undefined && p.stock <= 0;
  const outClass = (!p.inStock || outOfStock) ? 'out-of-stock' : '';
  return `<article class="card ${outClass}" data-id="${p.id}">
    <div class="card-media">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      ${productVisualHTML(p)}
      <button class="wish-toggle ${wished}" data-wish="${p.id}"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
      <button class="quick-add" data-quick="${p.id}" ${(!p.inStock || outOfStock)?'disabled':''}>${(!p.inStock || outOfStock)?'Out of Stock':'Add to Bag'}</button>
    </div>
    <div class="card-body">
      <span class="cat">${getCat(p.cat).label}</span>
      <h3>${p.name}</h3>
      <div class="price"><span class="now">${money(p.price)}</span>${p.oldPrice?`<span class="was">${money(p.oldPrice)}</span>`:''}</div>
    </div>
  </article>`;
}
function renderProducts(filter='all', sortMode='featured'){
  const grid = document.getElementById('productGrid'); if(!grid) return;
  let list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
  list = sortProducts(list, sortMode);
  if(!list.length){
    grid.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <h3>No products found</h3><p>Try a different category or check back later.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(productCardHTML).join('');
}

/* WISHLIST */
function loadLocalWishlist(){ try{ wishlist = JSON.parse(localStorage.getItem('coolism_wishlist')||'[]'); }catch(e){ wishlist = []; } updateWishlistBadge(); }
function saveWishlist(){ try{ localStorage.setItem('coolism_wishlist', JSON.stringify(wishlist)); }catch(e){} updateWishlistBadge(); }
function updateWishlistBadge(){ const el = document.getElementById('wishlistCount'); if(el){ el.textContent = wishlist.length; el.classList.toggle('show', wishlist.length>0); } }
function toggleWishlist(id){
  const idx = wishlist.indexOf(id);
  if(idx > -1) wishlist.splice(idx,1); else wishlist.push(id);
  saveWishlist();
  renderProducts(currentFilter, currentSort);
  const dw = document.getElementById('detailWishBtn');
  if(dw && currentDetail.product && currentDetail.product.id === id) dw.classList.toggle('wished', wishlist.includes(id));
  toast(wishlist.includes(id) ? 'Added to wishlist' : 'Removed from wishlist');
}
function renderWishlistDrawer(){
  const body = document.getElementById('wishlistBody'); if(!body) return;
  const items = PRODUCTS.filter(p => wishlist.includes(p.id));
  if(!items.length){
    body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Your wishlist is empty.</p><a href="index.html#shop" class="btn btn-line" style="margin-top:16px">Browse Products</a></div>`;
    return;
  }
  body.innerHTML = items.map(p => `<div class="cart-item"><div class="ci-thumb">${cartVisualHTML(p)}</div><div class="ci-info"><h4>${p.name}</h4><div class="p">${money(p.price)}</div><button class="ci-remove" data-wish-remove="${p.id}">Remove</button></div></div>`).join('');
}

/* CART */
function loadLocalCart(){ try{ cart = JSON.parse(localStorage.getItem('coolism_cart')||'[]'); }catch(e){ cart = []; } renderCart(); }
function saveCart(){ try{ localStorage.setItem('coolism_cart', JSON.stringify(cart)); }catch(e){} }
function addToCart(product, size, color, qty){
  if(!product.inStock || (product.stock !== undefined && product.stock <= 0)) return toast('Out of stock');
  const key = `${product.id}|${size}|${color}`;
  const existing = cart.find(i => lineKey(i) === key);
  if(existing) existing.qty += qty;
  else cart.push({ id:product.id, name:product.name, price:product.price, images:product.images, size, color, qty });
  saveCart(); renderCart(); toast(`${product.name} added to bag`);
}
function renderCart(){
  const body = document.getElementById('cartBody'); if(!body) return;
  const c = cart.reduce((s,i)=>s+i.qty,0), t = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const count = document.getElementById('cartCount'), total = document.getElementById('cartTotal');
  if(count){ count.textContent = c; count.classList.toggle('show', c>0); }
  if(total) total.textContent = money(t);
  const shipFill = document.getElementById('shipFill'), shipMsg = document.getElementById('shipMsg'), shipProgress = document.getElementById('shipProgress');
  if(shipFill && shipMsg){
    const free = 5000;
    shipFill.style.width = Math.min(100,(t/free)*100) + '%';
    if(t >= free){ shipMsg.textContent = '🎉 You got free shipping!'; if(shipProgress) shipProgress.classList.add('free'); }
    else { shipMsg.textContent = `Add ${money(free - t)} more for free shipping`; if(shipProgress) shipProgress.classList.remove('free'); }
  }
  if(!cart.length){
    body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p>Your bag is empty.</p><a href="index.html#shop" class="btn btn-line" style="margin-top:16px">Start Shopping</a></div>`;
    return;
  }
  body.innerHTML = cart.map(i => `<div class="cart-item"><div class="ci-thumb">${cartVisualHTML(i)}</div><div class="ci-info"><h4>${i.name}</h4><div class="ci-variant">${i.size} · ${i.color}</div><div class="p">${money(i.price)} × ${i.qty}</div><div class="ci-controls"><div class="ci-qty"><button data-cart-dec="${lineKey(i)}">−</button><span>${i.qty}</span><button data-cart-inc="${lineKey(i)}">+</button></div><button class="ci-remove" data-cart-remove="${lineKey(i)}">Remove</button></div></div></div>`).join('');
}

/* DRAWERS */
function openCart(){ document.getElementById('cartDrawer').classList.add('open'); document.getElementById('overlay').classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeCart(){ document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); document.body.style.overflow = ''; }
function openWishlist(){ renderWishlistDrawer(); document.getElementById('wishlistDrawer').classList.add('open'); document.getElementById('overlay').classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeWishlist(){ document.getElementById('wishlistDrawer').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); document.body.style.overflow = ''; }

/* PRODUCT DETAIL */
function openDetail(id){
  const p = PRODUCTS.find(x => x.id === id); if(!p) return;
  currentDetail = { product:p, size:p.sizes[0], color:p.colors[0].name, qty:1, images: p.images && p.images.length ? p.images : [] };
  currentImageIndex = 0;
  const media = document.getElementById('detailMedia'), thumbs = document.getElementById('detailThumbs'), counter = document.getElementById('imgCounter'), prevBtn = document.getElementById('imgPrev'), nextBtn = document.getElementById('imgNext');
  if(media) media.innerHTML = productVisualHTML(p, 'detail-placeholder');
  const totalImgs = currentDetail.images.length;
  if(counter) counter.textContent = totalImgs > 0 ? `1 / ${totalImgs}` : '';
  if(prevBtn) prevBtn.style.display = totalImgs > 1 ? 'grid' : 'none';
  if(nextBtn) nextBtn.style.display = totalImgs > 1 ? 'grid' : 'none';
  if(thumbs){
    if(totalImgs > 1) thumbs.innerHTML = currentDetail.images.map((img,i) => `<div class="thumb ${i===0?'active':''}" data-thumb="${i}"><img src="${img}" alt="${p.name} ${i+1}"></div>`).join('');
    else thumbs.innerHTML = '';
  }
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('detailCat', getCat(p.cat).label);
  set('detailName', p.name);
  document.getElementById('detailPrice').innerHTML = `<span class="now">${money(p.price)}</span>${p.oldPrice?`<span class="was">${money(p.oldPrice)}</span>`:''}`;
  set('detailDesc', p.desc||'');
  set('detailFabric', p.fabric||'—');
  set('detailCare', p.care||'—');
  set('detailSku', p.sku||'—');
  document.getElementById('detailSizes').innerHTML = p.sizes.map(s => `<button class="opt-btn ${s===currentDetail.size?'active':''}" data-size="${s}">${s}</button>`).join('');
  document.getElementById('detailColors').innerHTML = p.colors.map(c => `<button class="color-btn ${c.name===currentDetail.color?'active':''}" data-color="${c.name}"><span class="swatch" style="background:${c.hex}"></span><span class="color-name">${c.name}</span></button>`).join('');
  document.getElementById('qtyValue').textContent = '1';
  document.getElementById('detailWishBtn').classList.toggle('wished', wishlist.includes(p.id));
  const sw = document.getElementById('stockWarning');
  if(sw){
    if(p.stock !== undefined && p.stock <= 5 && p.stock > 0){ sw.textContent = `Only ${p.stock} left in stock!`; sw.style.display='block'; }
    else if(p.stock === 0){ sw.textContent = 'Out of stock'; sw.style.display='block'; }
    else sw.style.display='none';
  }
  loadReviews(p.id);
  updateDetailRating(p.id);
  document.getElementById('detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function showImageIndex(idx){
  if(!currentDetail.images.length) return;
  const total = currentDetail.images.length;
  currentImageIndex = ((idx % total) + total) % total;
  const img = currentDetail.images[currentImageIndex];
  document.getElementById('detailMedia').innerHTML = `<img src="${img}" alt="Product">`;
  document.getElementById('imgCounter').textContent = `${currentImageIndex+1} / ${total}`;
  document.querySelectorAll('.detail-thumbs .thumb').forEach((t,i) => t.classList.toggle('active', i === currentImageIndex));
}
async function updateDetailRating(productId){
  const el = document.getElementById('detailRating'); if(!el) return;
  try{
    const snap = await db.collection('reviews').where('productId','==',productId).get();
    if(snap.empty){ el.innerHTML = '<span class="stars-display">☆☆☆☆☆</span> <span style="color:var(--text-soft);font-size:.8rem">No reviews yet</span>'; return; }
    const revs = snap.docs.map(d => d.data());
    const avg = revs.reduce((s,r)=>s+(r.rating||0),0) / revs.length;
    const full = Math.round(avg);
    const stars = '★'.repeat(full) + '☆'.repeat(5 - full);
    el.innerHTML = `<span class="stars-display">${stars}</span> <span style="color:var(--text-soft);font-size:.82rem">${avg.toFixed(1)} · ${revs.length} review${revs.length>1?'s':''}</span>`;
  } catch(err){}
}
async function loadReviews(productId){
  currentReviewProduct = productId; selectedStar = 0;
  document.querySelectorAll('#starPicker span').forEach(s => s.classList.remove('active'));
  const list = document.getElementById('reviewsList'); if(!list) return;
  list.innerHTML = `<p style="color:var(--text-soft);font-style:italic;text-align:center;padding:20px;font-size:.9rem">Loading reviews…</p>`;
  try{
    const snap = await db.collection('reviews').where('productId','==',productId).get();
    if(snap.empty){ list.innerHTML = `<div class="reviews-empty">No reviews yet — be the first!</div>`; return; }
    const revs = snap.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    list.innerHTML = revs.map(r => {
      const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : '';
      const stars = '★'.repeat(r.rating||0) + '☆'.repeat(5-(r.rating||0));
      return `<div class="review-item"><div class="rv-head"><span class="rv-name">${r.userName||'Anonymous'}</span><span class="rv-stars">${stars}</span></div><p class="rv-text">${r.text||''}</p>${date?`<p class="rv-date">${date}</p>`:''}</div>`;
    }).join('');
  } catch(err){ list.innerHTML = `<div class="reviews-empty">Could not load reviews.</div>`; }
}

/* SEARCH */
function openSearch(){ document.getElementById('searchOverlay').classList.add('show'); document.body.style.overflow='hidden'; setTimeout(()=>document.getElementById('searchInput')?.focus(),100); }
function closeSearch(){ document.getElementById('searchOverlay').classList.remove('show'); document.body.style.overflow=''; const r = document.getElementById('searchResults'); if(r){ r.classList.remove('show'); r.innerHTML=''; } const i = document.getElementById('searchInput'); if(i) i.value=''; }
function performSearch(q){
  const results = document.getElementById('searchResults'); if(!results) return;
  const term = q.trim().toLowerCase();
  if(!term){ results.classList.remove('show'); return; }
  const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(term) || (p.desc||'').toLowerCase().includes(term) || (p.sku||'').toLowerCase().includes(term) || getCat(p.cat).label.toLowerCase().includes(term));
  if(!matches.length){ results.innerHTML = `<div class="search-empty">No products match "${q}"</div>`; results.classList.add('show'); return; }
  results.innerHTML = matches.map(p => `<div class="search-result" data-search-id="${p.id}">${(p.images&&p.images[0])?`<img src="${p.images[0]}" alt="${p.name}">`:`<div class="product-thumb-ph">${p.name.charAt(0)}</div>`}<div class="sr-info"><div class="sr-name">${p.name}</div><div class="sr-price">${money(p.price)}</div></div></div>`).join('');
  results.classList.add('show');
}

/* AUTH */
function openAuth(tab='login'){ document.getElementById('authModal').classList.add('show'); document.body.style.overflow='hidden'; switchTab(tab); }
function closeAuth(){ document.getElementById('authModal').classList.remove('show'); document.body.style.overflow=''; clearErrors(document.getElementById('loginForm')); clearErrors(document.getElementById('signupForm')); }
function switchTab(tab){
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const lf = document.getElementById('loginForm'), sf = document.getElementById('signupForm');
  if(lf) lf.hidden = tab !== 'login';
  if(sf) sf.hidden = tab !== 'signup';
}
async function saveUserToFirestore(user, extra = {}){
  try{
    const ref = db.collection('users').doc(user.uid);
    const snap = await ref.get();
    const base = {
      uid: user.uid, email: user.email||'', displayName: user.displayName||'', photoURL: user.photoURL||'',
      provider: (user.providerData[0] && user.providerData[0].providerId) || 'password',
      emailVerified: user.emailVerified,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    if(!snap.exists){
      await ref.set({ ...base, firstName: extra.firstName||'', lastName: extra.lastName||'', fullName: extra.fullName||'', phone: extra.phone||'', address:'', city:'', district:'', province:'', loyaltyPoints:0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    } else await ref.update(base);
  } catch(err){ console.error('Save user error:', err); }
}
function handleAuthError(err){
  const code = err.code || '';
  const msgs = {
    'auth/user-not-found':'No account found with this email.',
    'auth/wrong-password':'Incorrect password.',
    'auth/invalid-credential':'Incorrect email or password.',
    'auth/invalid-email':'Invalid email address.',
    'auth/email-already-in-use':'This email is already registered.',
    'auth/weak-password':'Password too weak.',
    'auth/too-many-requests':'Too many attempts. Try later.',
    'auth/network-request-failed':'Network error.',
    'auth/operation-not-allowed':'Sign-in method not enabled.',
    'auth/unauthorized-domain':'Domain not authorized.'
  };
  toast(msgs[code] || 'Something went wrong.');
  console.error('[Auth]', err);
}

/* CHECKOUT */
function openCheckout(){
  const modal = document.getElementById('checkoutModal'); if(!modal) return;
  const u = auth.currentUser;
  if(u){
    db.collection('users').doc(u.uid).get().then(snap => {
      if(snap.exists){
        const d = snap.data();
        const set = (id, v) => { const el = document.getElementById(id); if(el && v) el.value = v; };
        set('co-name', d.fullName || `${d.firstName||''} ${d.lastName||''}`.trim());
        set('co-phone', d.phone); set('co-address', d.address); set('co-city', d.city); set('co-district', d.district); set('co-province', d.province);
      }
    }).catch(()=>{});
  }
  updateCheckoutSummary();
  const note = document.getElementById('checkoutNote');
  if(note) note.textContent = u ? 'Your order will be placed as Cash on Delivery.' : "You'll be asked to sign in to confirm.";
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeCart();
}
function updateCheckoutSummary(){
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;
  const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
  set('co-subtotal', money(subtotal));
  set('co-shipping', shipping === 0 ? 'Free' : money(shipping));
  set('co-total', money(total));
}
function closeCheckout(){ document.getElementById('checkoutModal').classList.remove('show'); document.body.style.overflow = ''; }
function closeSuccess(){ document.getElementById('successModal').classList.remove('show'); }
async function placeOrder(user, formData){
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;
  const orderId = 'ORD-' + Date.now().toString().slice(-8);
  const order = {
    orderId, uid:user.uid, email:user.email||'',
    fullName:formData.fullName, phone:formData.phone, address:formData.address,
    city:formData.city, district:formData.district, province:formData.province,
    items: cart.map(i => ({id:i.id,name:i.name,size:i.size,color:i.color,qty:i.qty,price:i.price})),
    itemCount: cart.reduce((s,i)=>s+i.qty,0),
    subtotal, shipping, total, status:'pending', paymentMethod:'Cash on Delivery',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  try{
    await db.collection('orders').add(order);
    await db.collection('users').doc(user.uid).set({
      fullName: formData.fullName,
      firstName: formData.fullName.split(' ')[0] || '',
      lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
      phone: formData.phone, address: formData.address, city: formData.city, district: formData.district, province: formData.province
    }, { merge: true });
    for(const item of cart){
      try{
        const ref = db.collection('products').doc(item.id);
        const sn = await ref.get();
        if(sn.exists){ await ref.update({ stock: Math.max(0, (sn.data().stock??0) - item.qty) }); }
      } catch(e){}
    }
    cart = []; saveCart(); renderCart();
    try{ localStorage.removeItem('coolism_pending'); }catch(e){}
    closeCheckout();
    const sid = document.getElementById('successOrderId'); if(sid) sid.textContent = orderId;
    document.getElementById('successModal').classList.add('show');
    setTimeout(closeSuccess, 6000);
    toast('Order placed successfully!');
  } catch(err){ console.error('Order error:', err); toast('Could not place order. Try again.'); }
}

/* PROFILE */
async function loadProfile(user){
  const noAuth = document.getElementById('noAuth');
  if(!user){ if(noAuth) noAuth.hidden = false; return; }
  if(noAuth) noAuth.hidden = true;
  try{
    const snap = await db.collection('users').doc(user.uid).get();
    const d = snap.exists ? snap.data() : {};
    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v || '—'; };
    set('profileName', `Hello, ${d.firstName || (user.displayName && user.displayName.split(' ')[0]) || 'there'}`);
    set('pf-name', `${d.firstName||''} ${d.lastName||''}`.trim() || '—');
    set('pf-email', user.email);
    set('pf-phone', d.phone);
    set('pf-provider', d.provider || 'password');
    set('pf-created', d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : '—');
    set('pf-address', d.address); set('pf-city', d.city); set('pf-district', d.district); set('pf-province', d.province);
    const v = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
    v('ed-first', d.firstName); v('ed-last', d.lastName); v('ed-phone', d.phone);
    v('ed-address', d.address); v('ed-city', d.city); v('ed-district', d.district); v('ed-province', d.province);
  } catch(err){ console.error(err); }
  try{
    const snap = await db.collection('orders').where('uid','==',user.uid).get();
    const orders = snap.docs.map(doc => ({id:doc.id, ...doc.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    renderProfileOrders(orders);
  } catch(err){ console.error(err); }
  renderProfileWishlist();
}
function renderProfileOrders(orders){
  const container = document.getElementById('ordersContainer'); if(!container) return;
  const countEl = document.getElementById('ordersCount'), totalEl = document.getElementById('ordersTotal');
  if(countEl) countEl.textContent = orders.length;
  if(totalEl) totalEl.textContent = money(orders.reduce((s,o)=>s+(o.total||0),0));
  if(!orders.length){
    container.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><h3>No orders yet</h3><p>Your order history will appear here.</p><a href="index.html#shop" class="btn btn-silver">Start Shopping</a></div>`;
    return;
  }
  const steps = ['pending','confirmed','dispatched','delivered'];
  const stepLabels = ['Placed','Confirmed','Dispatched','Delivered'];
  container.innerHTML = orders.map(o => {
    const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—';
    const status = o.status || 'pending';
    let idx = steps.indexOf(status);
    if(status === 'cancelled') idx = -1;
    const badgeClass = status === 'delivered' ? 'badge-yes' : (status === 'pending' ? 'badge-info' : (status === 'cancelled' ? 'badge-no' : 'badge-info'));
    const trackFillPct = idx >= 0 ? (idx / (steps.length - 1)) * 90 : 0;
    return `<div class="order-card">
      <div class="order-card-head"><div><h4>Order ${o.orderId}</h4><p class="oc-date">${date} · ${o.itemCount||0} item(s)</p></div><div style="text-align:right"><div class="oc-total">${money(o.total)}</div><span class="${badgeClass}">${status}</span></div></div>
      <div class="order-track"><div class="order-track-fill" style="width:${trackFillPct}%"></div>${steps.map((s,i)=>{const cls = i<=idx ? (i===idx?'current':'done') : ''; return `<div class="track-step ${cls}"><div class="track-dot">${i+1}</div><span>${stepLabels[i]}</span></div>`;}).join('')}</div>
      <div class="order-card-actions"><button class="link-btn" data-view-order="${o.id}">View Details →</button></div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-view-order]').forEach(btn => btn.addEventListener('click', () => showOrderDetail(btn.dataset.viewOrder, orders)));
}
function renderProfileWishlist(){
  const grid = document.getElementById('wishlistGrid'); if(!grid) return;
  const items = PRODUCTS.filter(p => wishlist.includes(p.id));
  if(!items.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><h3>Your wishlist is empty</h3><p>Heart products you love to save them here.</p></div>`;
    return;
  }
  grid.innerHTML = items.map(productCardHTML).join('');
}
function showOrderDetail(id, orders){
  const o = orders.find(x => x.id === id); if(!o) return;
  const modal = document.getElementById('orderDetailModal'); if(!modal) return;
  document.getElementById('odTitle').textContent = `Order ${o.orderId}`;
  document.getElementById('odSub').textContent = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : '';
  const itemsHtml = (o.items||[]).map(it => `<div class="order-item"><div><div class="nm">${it.name}</div><div class="vr">${it.size} · ${it.color}</div><div class="qt">Qty: ${it.qty}</div></div><div><b>${money(it.price*it.qty)}</b></div></div>`).join('');
  document.getElementById('odBody').innerHTML = `
    <div class="order-detail-block"><h4>Shipping Address</h4><div class="row"><b>Name</b><span>${o.fullName||'—'}</span></div><div class="row"><b>Phone</b><span>${o.phone||'—'}</span></div><div class="row"><b>Address</b><span>${o.address||'—'}</span></div><div class="row"><b>City</b><span>${o.city||'—'}</span></div><div class="row"><b>District</b><span>${o.district||'—'}</span></div><div class="row"><b>Province</b><span>${o.province||'—'}</span></div></div>
    <div class="order-detail-block"><h4>Items</h4><div class="order-items-list">${itemsHtml}</div></div>
    <div class="order-detail-block"><h4>Payment</h4><div class="row"><b>Subtotal</b><span>${money(o.subtotal)}</span></div><div class="row"><b>Shipping</b><span>${o.shipping===0?'Free':money(o.shipping)}</span></div><div class="row"><b>Total</b><span><b>${money(o.total)}</b></span></div><div class="row"><b>Method</b><span>Cash on Delivery</span></div><div class="row"><b>Status</b><span>${o.status||'pending'}</span></div></div>`;
  modal.classList.add('show');
}

/* ADMIN — PRODUCTS */
async function loadProducts(){
  const tbody = document.getElementById('productsTbody'); if(!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Loading products…</td></tr>`;
  try{
    const snap = await db.collection('products').get();
    PRODUCTS = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id, name: d.name||'', cat: d.cat||'shirts',
        price: Number(d.price)||0, oldPrice: d.oldPrice?Number(d.oldPrice):null,
        tag: d.tag||null, images: Array.isArray(d.images)?d.images:(d.img?[d.img]:[]),
        desc: d.desc||'', sizes: Array.isArray(d.sizes)?d.sizes:['S','M','L','XL'],
        colors: Array.isArray(d.colors)?d.colors:[{name:'Navy',hex:'#0B1A30'}],
        fabric: d.fabric||'', care: d.care||'', sku: d.sku||'',
        inStock: d.inStock!==false, stock: d.stock??50, lowStock: d.lowStock??5,
        _ts: d.createdAt?.seconds||0
      };
    });
    if(!PRODUCTS.length) PRODUCTS = [ ...FALLBACK_PRODUCTS ];
    renderProductsTable(PRODUCTS);
    updateAdminStats();
  } catch(err){ console.error(err); tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Error: ${err.message}</td></tr>`; }
}
function renderProductsTable(list){
  const tbody = document.getElementById('productsTbody'); if(!tbody) return;
  if(!list.length){ tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No products yet.</td></tr>`; return; }
  tbody.innerHTML = list.map((p, i) => {
    const thumb = (p.images && p.images[0])
      ? `<img src="${p.images[0]}" class="product-thumb" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="product-thumb-ph" style="display:none">${p.name.charAt(0)}</div>`
      : `<div class="product-thumb-ph">${p.name.charAt(0)}</div>`;
    const stockNum = p.stock ?? 0, lowStock = p.lowStock ?? 5;
    const stockClass = stockNum === 0 ? 'badge-no' : (stockNum <= lowStock ? 'badge-info' : 'badge-yes');
    const stockLabel = stockNum === 0 ? 'Out' : `${stockNum} left`;
    const status = p.inStock !== false ? '<span class="badge-yes">Active</span>' : '<span class="badge-no">Hidden</span>';
    return `<tr>
      <td>${i+1}</td><td>${thumb}</td><td><b>${p.name}</b></td>
      <td>${getCat(p.cat).label}</td><td><b>${money(p.price)}</b></td>
      <td>${p.sku||'—'}</td><td><span class="${stockClass}">${stockLabel}</span></td>
      <td>${status}</td>
      <td><button class="action-btn edit" data-edit-product="${p.id}">Edit</button><button class="action-btn delete" data-delete-product="${p.id}">Delete</button></td>
    </tr>`;
  }).join('');
  tbody.querySelectorAll('[data-edit-product]').forEach(btn => btn.addEventListener('click', () => openProductForm(btn.dataset.editProduct)));
  tbody.querySelectorAll('[data-delete-product]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const product = PRODUCTS.find(p => p.id === btn.dataset.deleteProduct);
      if(!confirm(`Delete "${product?.name || 'this product'}"? This cannot be undone.`)) return;
      try{ await db.collection('products').doc(btn.dataset.deleteProduct).delete(); toast('Product deleted'); loadProducts(); }
      catch(err){ toast('Could not delete'); }
    });
  });
}
function fillCategoryDropdown(){
  const sel = document.getElementById('p-category'); if(!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">Select category…</option>` + Object.keys(CATEGORIES).map(k => `<option value="${k}">${CATEGORIES[k].label}</option>`).join('');
  if(current) sel.value = current;
}
function updateImagePreview(slot, src){
  const prev = document.getElementById('prev-' + slot); if(!prev) return;
  if(src){ prev.innerHTML = `<img src="${src}" alt="Preview" onerror="this.style.display='none'">`; prev.classList.add('has-image'); }
}
function openProductForm(id){
  const modal = document.getElementById('productModal'); if(!modal) return;
  fillCategoryDropdown();
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productModalTitle').textContent = id ? 'Edit Product' : 'Add New Product';
  document.getElementById('productModalSub').textContent = id ? 'Update the details below' : 'Fill in the details below';
  [0,1,2].forEach(i => {
    const prev = document.getElementById('prev-' + i);
    if(prev){
      prev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>Image ${i+1}</span>`;
      prev.classList.remove('has-image');
    }
    const inp = document.getElementById('p-img' + (i+1));
    if(inp) inp.value = '';
  });
  if(id){
    const p = PRODUCTS.find(x => x.id === id);
    if(p){
      document.getElementById('p-name').value = p.name;
      document.getElementById('p-category').value = p.cat;
      document.getElementById('p-price').value = p.price;
      document.getElementById('p-old').value = p.oldPrice || '';
      document.getElementById('p-tag').value = p.tag || '';
      document.getElementById('p-sizes').value = (p.sizes||[]).join(', ');
      document.getElementById('p-sku').value = p.sku || '';
      document.getElementById('p-colors').value = (p.colors||[]).map(c => `${c.name}:${c.hex}`).join(', ');
      document.getElementById('p-desc').value = p.desc || '';
      document.getElementById('p-fabric').value = p.fabric || '';
      document.getElementById('p-care').value = p.care || '';
      document.getElementById('p-instock').checked = p.inStock !== false;
      document.getElementById('p-stock').value = p.stock ?? 50;
      document.getElementById('p-lowstock').value = p.lowStock ?? 5;
      const imgs = p.images || [];
      for(let i = 0; i < 3; i++){
        const inp = document.getElementById('p-img' + (i+1));
        if(inp && imgs[i]){
          const fn = imgs[i].includes('/') ? imgs[i].split('/').pop() : imgs[i];
          inp.value = fn;
          updateImagePreview(i, imgs[i]);
        }
      }
    }
    form.dataset.editId = id;
  } else {
    form.dataset.editId = '';
    document.getElementById('p-stock').value = 50;
    document.getElementById('p-lowstock').value = 5;
  }
  modal.classList.add('show');
}
function closeProductForm(){ document.getElementById('productModal').classList.remove('show'); }
function parseColors(str){
  if(!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean).map(pair => {
    const [name, hex] = pair.split(':').map(s => s.trim());
    return { name: name || 'Default', hex: hex || '#333333' };
  });
}
function parseImagesFromSlots(baseUrl){
  const imgs = [];
  for(let i = 1; i <= 3; i++){
    const val = document.getElementById('p-img' + i)?.value.trim();
    if(val) imgs.push(val.startsWith('http') ? val : baseUrl + val);
  }
  return imgs;
}
async function saveProduct(e){
  e.preventDefault();
  console.log('🚀 saveProduct called');
  const form = document.getElementById('productForm');
  const editId = form.dataset.editId;
  const name = document.getElementById('p-name').value.trim();
  const cat = document.getElementById('p-category').value;
  const newCat = document.getElementById('p-newcat').value.trim();
  const price = Number(document.getElementById('p-price').value);
  const oldPrice = document.getElementById('p-old').value ? Number(document.getElementById('p-old').value) : null;
  const tag = document.getElementById('p-tag').value || null;
  const sizes = document.getElementById('p-sizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const sku = document.getElementById('p-sku').value.trim();
  const colors = parseColors(document.getElementById('p-colors').value);
  const desc = document.getElementById('p-desc').value.trim();
  const fabric = document.getElementById('p-fabric').value.trim();
  const care = document.getElementById('p-care').value.trim();
  const inStock = document.getElementById('p-instock').checked;
  const stock = Number(document.getElementById('p-stock').value) || 0;
  const lowStock = Number(document.getElementById('p-lowstock').value) || 5;
  const ok = [setErr(document.getElementById('p-name'), name.length < 2), setErr(document.getElementById('p-price'), !price || price < 0)].every(Boolean);
  if(!ok) return toast('Please fill required fields');
  const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'images/';
  const images = parseImagesFromSlots(baseUrl);
  let finalCat = cat;
  if(newCat){
    const slug = newCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    finalCat = slug;
    try{
      await db.collection('categories').doc(slug).set({ label: newCat, sub: 'New collection', img: images[0] || '', createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      CATEGORIES[slug] = { label: newCat, sub: 'New collection', img: images[0] || '' };
    } catch(err){}
  }
  if(!finalCat) return toast('Please select or create a category');
  const data = { name, cat: finalCat, price, oldPrice, tag, images, sizes, sku, colors: colors.length ? colors : [{ name:'Default', hex:'#333333' }], desc, fabric, care, inStock, stock, lowStock, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    console.log('📦 Data being saved:', data);
  try{
    if(editId){
      console.log('✏️ Updating:', editId);
      await db.collection('products').doc(editId).update(data);
      toast('Product updated');
    } else {
      console.log('➕ Adding new product');
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const ref = await db.collection('products').add(data);
      console.log('✅ Saved with ID:', ref.id);
      toast('Product added');
    }
    closeProductForm();
    loadProducts();
  } catch(err){
    console.error('❌ Save error:', err);
    toast('Error: ' + (err.code || err.message));
  }
}

/* ADMIN — ORDERS */
async function loadOrders(){
  const tbody = document.getElementById('ordersTbody'); if(!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Loading orders…</td></tr>`;
  try{
    const snap = await db.collection('orders').orderBy('createdAt','desc').get();
    allOrders = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderOrdersTable(allOrders);
    updateAdminStats();
  } catch(err){ tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Error: ${err.message}</td></tr>`; }
}
function renderOrdersTable(list){
  const tbody = document.getElementById('ordersTbody'); if(!tbody) return;
  if(!list.length){ tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No orders yet.</td></tr>`; return; }
  tbody.innerHTML = list.map((o, i) => {
    const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—';
    const status = o.status || 'pending';
    const cls = status === 'delivered' ? 'badge-yes' : (status === 'cancelled' ? 'badge-no' : 'badge-info');
    return `<tr><td>${i+1}</td><td><b>${o.orderId||'—'}</b></td><td>${date}</td><td>${o.fullName||'—'}</td><td>${o.phone||'—'}</td><td>${o.city||'—'}</td><td><b>${money(o.total)}</b></td><td><span class="${cls}">${status}</span></td><td><button class="link-btn" data-view-order="${o.id}">View</button></td></tr>`;
  }).join('');
  tbody.querySelectorAll('[data-view-order]').forEach(btn => btn.addEventListener('click', () => showAdminOrder(btn.dataset.viewOrder)));
}
function showAdminOrder(orderId){
  const o = allOrders.find(x => x.id === orderId); if(!o) return;
  const modal = document.getElementById('adminOrderModal'); if(!modal) return;
  currentOrderId = orderId;
  document.getElementById('aoTitle').textContent = `Order ${o.orderId}`;
  document.getElementById('aoSub').textContent = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : '—';
  const itemsHtml = (o.items||[]).map(it => `<div class="order-item"><div><div class="nm">${it.name}</div><div class="vr">${it.size} · ${it.color}</div><div class="qt">Qty: ${it.qty}</div></div><div><b>${money(it.price*it.qty)}</b></div></div>`).join('');
  document.getElementById('aoBody').innerHTML = `
    <div class="order-detail-block"><h4>Customer & Shipping</h4><div class="row"><b>Full Name</b><span>${o.fullName||'—'}</span></div><div class="row"><b>Email</b><span>${o.email||'—'}</span></div><div class="row"><b>Phone</b><span>${o.phone||'—'}</span></div><div class="row"><b>Address</b><span>${o.address||'—'}</span></div><div class="row"><b>City</b><span>${o.city||'—'}</span></div><div class="row"><b>District</b><span>${o.district||'—'}</span></div><div class="row"><b>Province</b><span>${o.province||'—'}</span></div></div>
    <div class="order-detail-block"><h4>Items (${o.itemCount||0})</h4><div class="order-items-list">${itemsHtml}</div></div>
    <div class="order-detail-block"><h4>Payment</h4><div class="row"><b>Subtotal</b><span>${money(o.subtotal)}</span></div><div class="row"><b>Shipping</b><span>${o.shipping===0?'Free':money(o.shipping)}</span></div><div class="row"><b>Total</b><span><b>${money(o.total)}</b></span></div><div class="row"><b>Method</b><span>Cash on Delivery</span></div><div class="row"><b>Status</b><span>${o.status||'pending'}</span></div></div>`;
  modal.querySelectorAll('[data-status]').forEach(btn => btn.classList.toggle('active-status', btn.dataset.status === (o.status || 'pending')));
  modal.classList.add('show');
}
async function updateOrderStatus(newStatus){
  if(!currentOrderId) return;
  try{
    await db.collection('orders').doc(currentOrderId).update({ status: newStatus, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    toast(`Order marked as ${newStatus}`);
    loadOrders();
    setTimeout(() => showAdminOrder(currentOrderId), 400);
  } catch(err){ toast('Could not update status'); }
}

/* ADMIN — USERS */
async function loadUsers(){
  const tbody = document.getElementById('usersTbody'); if(!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Loading users…</td></tr>`;
  try{
    const snap = await db.collection('users').orderBy('createdAt','desc').get();
    allUsers = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderUsersTable(allUsers);
    updateAdminStats();
  } catch(err){ tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Error: ${err.message}</td></tr>`; }
}
function renderUsersTable(list){
  const tbody = document.getElementById('usersTbody'); if(!tbody) return;
  if(!list.length){ tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No users yet.</td></tr>`; return; }
  tbody.innerHTML = list.map((u, i) => {
    const created = u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '—';
    const verified = u.emailVerified ? '<span class="badge-yes">Yes</span>' : '<span class="badge-no">No</span>';
    const fullName = `${u.firstName||''} ${u.lastName||''}`.trim() || '—';
    return `<tr><td>${i+1}</td><td>${u.email||'—'}</td><td>${fullName}</td><td>${u.phone||'—'}</td><td>${u.city||'—'}</td><td>${u.provider||'—'}</td><td>${verified}</td><td>${created}</td><td><button class="link-btn" data-view-user="${u.uid||u.id}">View</button></td></tr>`;
  }).join('');
  tbody.querySelectorAll('[data-view-user]').forEach(btn => btn.addEventListener('click', () => showAdminUser(btn.dataset.viewUser)));
}
function showAdminUser(uid){
  const u = allUsers.find(x => (x.uid || x.id) === uid); if(!u) return;
  const modal = document.getElementById('adminUserModal'); if(!modal) return;
  const fullName = `${u.firstName||''} ${u.lastName||''}`.trim() || '—';
  document.getElementById('auTitle').textContent = fullName;
  document.getElementById('auSub').textContent = u.email || '—';
  const userOrders = allOrders.filter(o => o.uid === uid);
  const ordersHtml = userOrders.length ? userOrders.map(o => `<div class="order-item"><div><div class="nm">${o.orderId} · ${money(o.total)}</div><div class="vr">${o.itemCount||0} items · ${o.city||'—'}</div><div class="qt">${o.createdAt?.toDate?o.createdAt.toDate().toLocaleDateString():'—'}</div></div><div><span class="${o.status==='delivered'?'badge-yes':'badge-info'}">${o.status||'pending'}</span></div></div>`).join('') : `<div style="text-align:center;padding:30px;color:var(--text-muted);font-style:italic;font-size:.9rem">No orders yet</div>`;
  document.getElementById('auBody').innerHTML = `
    <div class="order-detail-block"><h4>User Information</h4><div class="row"><b>Name</b><span>${fullName}</span></div><div class="row"><b>Email</b><span>${u.email||'—'}</span></div><div class="row"><b>Phone</b><span>${u.phone||'—'}</span></div><div class="row"><b>Address</b><span>${u.address||'—'}</span></div><div class="row"><b>City</b><span>${u.city||'—'}</span></div><div class="row"><b>District</b><span>${u.district||'—'}</span></div><div class="row"><b>Province</b><span>${u.province||'—'}</span></div><div class="row"><b>Provider</b><span>${u.provider||'password'}</span></div><div class="row"><b>Verified</b><span>${u.emailVerified?'Yes':'No'}</span></div><div class="row"><b>Joined</b><span>${u.createdAt?.toDate?u.createdAt.toDate().toLocaleString():'—'}</span></div></div>
    <div class="order-detail-block"><h4>Orders (${userOrders.length})</h4><div class="order-items-list">${ordersHtml}</div></div>`;
  modal.classList.add('show');
}
function updateAdminStats(){
  const pc = document.getElementById('productCount'); if(pc) pc.textContent = PRODUCTS.length;
  const oc = document.getElementById('orderCount'); if(oc) oc.textContent = allOrders.length;
  const uc = document.getElementById('userCount'); if(uc) uc.textContent = allUsers.length;
  const rt = document.getElementById('revenueTotal'); if(rt) rt.textContent = money(allOrders.reduce((s,o)=>s+(o.total||0),0));
}
function exportCSV(filename, headers, rows){
  if(!rows.length) return toast('Nothing to export');
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast('Exported successfully');
}

/* BOOT */
const page = document.body.dataset.page;
(async function boot(){
  loadLocalWishlist(); loadLocalCart();
  await loadCatalog();
  if(page === 'home'){
    renderCategoryTiles(); renderFooterCats(); renderFilterChips();
    renderProducts('all','featured');
    const f = document.getElementById('filters');
    if(f) f.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if(!chip) return;
      f.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderProducts(currentFilter, currentSort);
    });
    const s = document.getElementById('sortSelect');
    if(s) s.addEventListener('change', () => { currentSort = s.value; renderProducts(currentFilter, currentSort); });
  }
  if(page === 'category'){
    const params = new URLSearchParams(location.search);
    const catKey = params.get('cat') || Object.keys(CATEGORIES)[0];
    const cat = getCat(catKey);
    document.title = `${cat.label} — COOLISM`;
    const ce = document.getElementById('catEyebrow'), ct = document.getElementById('catTitle'), cs = document.getElementById('catSub');
    if(ce) ce.textContent = 'Collection';
    if(ct) ct.textContent = cat.label;
    if(cs) cs.textContent = cat.sub || '';
    currentFilter = catKey;
    renderProducts(catKey, 'featured');
    const s = document.getElementById('sortSelect');
    if(s) s.addEventListener('change', () => { currentSort = s.value; renderProducts(currentFilter, currentSort); });
  }
    if(page === 'admin'){
    const adminList = (document.body.dataset.admin || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    auth.onAuthStateChanged(async user => {
      if(!user){
        const msg = document.getElementById('accessMsg'); if(msg) msg.hidden = false;
        setTimeout(() => { alert('Access denied. Please sign in with admin account.'); window.location.href = 'index.html'; }, 300);
        return;
      }
      const email = (user.email || '').toLowerCase();
      if(!adminList.includes(email)){ alert('Access denied.'); window.location.href = 'index.html'; return; }
      await loadProducts();
      await loadOrders();
      await loadUsers();
    });
  }
})();

/* EVENTS */
document.addEventListener('click', e => {
  if(e.target.closest('#cartBtn')){ openCart(); return; }
  if(e.target.closest('#cartClose')){ closeCart(); return; }
  if(e.target.closest('#wishlistBtn')){ openWishlist(); return; }
  if(e.target.closest('#wishlistClose')){ closeWishlist(); return; }
  if(e.target.id === 'overlay'){ closeCart(); closeWishlist(); return; }
  if(e.target.closest('#searchToggle')){ openSearch(); return; }
  if(e.target.closest('#searchClose')){ closeSearch(); return; }
  if(e.target.id === 'searchOverlay'){ closeSearch(); return; }
  if(e.target.closest('#accountBtn')){ openAuth('login'); return; }
  if(e.target.closest('#modalClose')){ closeAuth(); return; }
  if(e.target.id === 'authModal'){ closeAuth(); return; }
  const tabBtn = e.target.closest('.tabs button');
  if(tabBtn){ switchTab(tabBtn.dataset.tab); return; }
  const wishBtn = e.target.closest('[data-wish]');
  if(wishBtn){ e.stopPropagation(); toggleWishlist(wishBtn.dataset.wish); return; }
  const quickBtn = e.target.closest('[data-quick]');
  if(quickBtn){
    e.stopPropagation();
    const p = PRODUCTS.find(x => x.id === quickBtn.dataset.quick); if(!p) return;
    if(!p.inStock || p.stock <= 0) return toast('Out of stock');
    addToCart(p, p.sizes[0], p.colors[0].name, 1);
    const orig = quickBtn.textContent;
    quickBtn.textContent = 'Added ✓'; quickBtn.classList.add('added');
    setTimeout(()=>{ quickBtn.textContent = orig; quickBtn.classList.remove('added'); }, 1400);
    return;
  }
  const card = e.target.closest('.card');
  if(card && card.dataset.id){ openDetail(card.dataset.id); return; }
  const inc = e.target.closest('[data-cart-inc]');
  if(inc){ const f = cart.find(i => lineKey(i) === inc.dataset.cartInc); if(f){ f.qty++; saveCart(); renderCart(); } return; }
  const dec = e.target.closest('[data-cart-dec]');
  if(dec){ const idx = cart.findIndex(i => lineKey(i) === dec.dataset.cartDec); if(idx > -1){ if(cart[idx].qty > 1) cart[idx].qty--; else cart.splice(idx,1); saveCart(); renderCart(); } return; }
  const rem = e.target.closest('[data-cart-remove]');
  if(rem){ cart = cart.filter(i => lineKey(i) !== rem.dataset.cartRemove); saveCart(); renderCart(); return; }
  const wishRem = e.target.closest('[data-wish-remove]');
  if(wishRem){ wishlist = wishlist.filter(id => id !== wishRem.dataset.wishRemove); saveWishlist(); renderWishlistDrawer(); renderProducts(currentFilter, currentSort); return; }
  const sr = e.target.closest('[data-search-id]');
  if(sr){ closeSearch(); openDetail(sr.dataset.searchId); return; }
  if(e.target.closest('#imgPrev')){ showImageIndex(currentImageIndex - 1); return; }
  if(e.target.closest('#imgNext')){ showImageIndex(currentImageIndex + 1); return; }
  if(e.target.closest('#detailClose') || e.target.id === 'detailModal'){ document.getElementById('detailModal').classList.remove('show'); document.body.style.overflow=''; return; }
  const sizeBtn = e.target.closest('#detailSizes [data-size]');
  if(sizeBtn){ currentDetail.size = sizeBtn.dataset.size; document.querySelectorAll('#detailSizes .opt-btn').forEach(b => b.classList.toggle('active', b === sizeBtn)); return; }
  const colorBtn = e.target.closest('#detailColors [data-color]');
  if(colorBtn){ currentDetail.color = colorBtn.dataset.color; document.querySelectorAll('#detailColors .color-btn').forEach(b => b.classList.toggle('active', b === colorBtn)); return; }
  if(e.target.id === 'qtyMinus'){ if(currentDetail.qty > 1) currentDetail.qty--; document.getElementById('qtyValue').textContent = currentDetail.qty; return; }
  if(e.target.id === 'qtyPlus'){ currentDetail.qty++; document.getElementById('qtyValue').textContent = currentDetail.qty; return; }
  if(e.target.closest('#detailAddBtn')){ if(currentDetail.product){ addToCart(currentDetail.product, currentDetail.size, currentDetail.color, currentDetail.qty); document.getElementById('detailModal').classList.remove('show'); document.body.style.overflow=''; } return; }
  if(e.target.closest('#detailWishBtn')){ if(currentDetail.product) toggleWishlist(currentDetail.product.id); return; }
  const thumb = e.target.closest('[data-thumb]');
  if(thumb){ showImageIndex(Number(thumb.dataset.thumb)); return; }
  if(e.target.closest('[data-size-guide]')){ e.preventDefault(); document.getElementById('sizeGuideModal').classList.add('show'); return; }
  if(e.target.id === 'sizeGuideClose' || e.target.id === 'sizeGuideModal'){ document.getElementById('sizeGuideModal').classList.remove('show'); return; }
  if(e.target.closest('#checkoutBtn')){ if(!cart.length) return toast('Your bag is empty'); openCheckout(); return; }
  if(e.target.closest('#checkoutClose')){ closeCheckout(); return; }
  if(e.target.id === 'checkoutModal'){ closeCheckout(); return; }
  if(e.target.id === 'successModal' || e.target.closest('#successModal .btn')){ closeSuccess(); return; }
  if(e.target.closest('#orderDetailClose') || e.target.id === 'orderDetailModal'){ document.getElementById('orderDetailModal').classList.remove('show'); return; }
  if(e.target.closest('#addProductBtn')){ openProductForm(); return; }
  if(e.target.closest('#productModalClose') || e.target.closest('#productCancelBtn')){ closeProductForm(); return; }
  if(e.target.id === 'productModal'){ closeProductForm(); return; }
  const statusBtn = e.target.closest('[data-status]');
  if(statusBtn){ updateOrderStatus(statusBtn.dataset.status); return; }
  if(e.target.closest('#adminOrderClose') || e.target.id === 'adminOrderModal'){ document.getElementById('adminOrderModal').classList.remove('show'); return; }
  if(e.target.closest('#adminUserClose') || e.target.id === 'adminUserModal'){ document.getElementById('adminUserModal').classList.remove('show'); return; }
});

document.addEventListener('input', e => {
  if(e.target.id === 'searchInput') performSearch(e.target.value);
  if(e.target.classList.contains('img-filename')){
    const slot = e.target.dataset.slot, val = e.target.value.trim();
    const prev = document.getElementById('prev-' + slot); if(!prev) return;
    if(val){
      const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'images/';
      const src = val.startsWith('http') ? val : baseUrl + val;
      prev.innerHTML = `<img src="${src}" alt="Preview" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22%3E%3Crect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/%3E%3C/svg%3E'">`;
      prev.classList.add('has-image');
    } else {
      prev.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>Image ${Number(slot)+1}</span>`;
      prev.classList.remove('has-image');
    }
  }
  if(e.target.id === 'productSearch'){
    const q = e.target.value.toLowerCase().trim();
    const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q) || (getCat(p.cat).label||'').toLowerCase().includes(q));
    renderProductsTable(filtered);
  }
  if(e.target.id === 'orderSearch'){
    const q = e.target.value.toLowerCase().trim();
    const filtered = allOrders.filter(o => (o.orderId||'').toLowerCase().includes(q) || (o.fullName||'').toLowerCase().includes(q) || (o.phone||'').toLowerCase().includes(q) || (o.city||'').toLowerCase().includes(q));
    renderOrdersTable(filtered);
  }
  if(e.target.id === 'userSearch'){
    const q = e.target.value.toLowerCase().trim();
    const filtered = allUsers.filter(u => (u.email||'').toLowerCase().includes(q) || (u.firstName||'').toLowerCase().includes(q) || (u.lastName||'').toLowerCase().includes(q) || (u.phone||'').toLowerCase().includes(q));
    renderUsersTable(filtered);
  }
});

document.addEventListener('click', e => {
  const s = e.target.closest('#starPicker span');
  if(s){
    selectedStar = Number(s.dataset.star);
    document.querySelectorAll('#starPicker span').forEach(sp => sp.classList.toggle('active', Number(sp.dataset.star) <= selectedStar));
  }
});

const loginForm = document.getElementById('loginForm');
if(loginForm) loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const emailInput = document.getElementById('li-email'), passInput = document.getElementById('li-pass');
  const email = emailInput.value.trim(), pass = passInput.value;
  const btn = document.getElementById('loginBtn');
  const ok = [setErr(emailInput, !isEmail(email)), setErr(passInput, pass.length < 6)].every(Boolean);
  if(!ok) return;
  btn.classList.add('loading'); btn.textContent = 'Signing in...';
  try{
    const cred = await auth.signInWithEmailAndPassword(email, pass);
    const user = cred.user;
    if(user.providerData[0].providerId === 'password' && !user.emailVerified){
      await auth.signOut();
      toast('Please verify your email first.');
      btn.classList.remove('loading'); btn.textContent = 'Sign In';
      return;
    }
    await saveUserToFirestore(user);
    closeAuth(); toast(`Welcome back, ${user.email}`);
    loginForm.reset();
    btn.classList.remove('loading'); btn.textContent = 'Sign In';
    try{
      const pending = JSON.parse(localStorage.getItem('coolism_pending') || 'null');
      if(pending && cart.length) setTimeout(() => placeOrder(user, pending), 500);
    } catch(er){}
  } catch(err){ btn.classList.remove('loading'); btn.textContent = 'Sign In'; handleAuthError(err); }
});

const signupForm = document.getElementById('signupForm');
if(signupForm) signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  const emailInput = document.getElementById('su-email'), passInput = document.getElementById('su-pass'), pass2Input = document.getElementById('su-pass2');
  const terms = document.getElementById('su-terms'), btn = document.getElementById('signupBtn');
  const email = emailInput.value.trim(), pass = passInput.value, pass2 = pass2Input.value;
  const ok = [setErr(emailInput, !isEmail(email)), setErr(passInput, pass.length < 6), setErr(pass2Input, pass !== pass2)].every(Boolean);
  if(!ok) return;
  if(terms && !terms.checked) return toast('Please accept the Terms');
  btn.classList.add('loading'); btn.textContent = 'Creating...';
  try{
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    const user = cred.user;
    await saveUserToFirestore(user);
    await user.sendEmailVerification();
    await auth.signOut();
    closeAuth(); toast('Verification email sent! Check your inbox.');
    signupForm.reset();
    btn.classList.remove('loading'); btn.textContent = 'Create Account';
    switchTab('login');
  } catch(err){ btn.classList.remove('loading'); btn.textContent = 'Create Account'; handleAuthError(err); }
});

document.querySelectorAll('[data-social="Google"]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt:'select_account' });
    try{
      const result = await auth.signInWithPopup(provider);
      await saveUserToFirestore(result.user);
      closeAuth(); toast(`Signed in as ${result.user.displayName || result.user.email}`);
      try{
        const pending = JSON.parse(localStorage.getItem('coolism_pending') || 'null');
        if(pending && cart.length) setTimeout(() => placeOrder(result.user, pending), 500);
      } catch(er){}
    } catch(err){
      if(err.code === 'auth/popup-closed-by-user') return;
      if(err.code === 'auth/popup-blocked') return toast('Popup blocked. Allow popups.');
      handleAuthError(err);
    }
  });
});
document.querySelectorAll('[data-social="Apple"]').forEach(btn => btn.addEventListener('click', () => toast('Apple sign-in coming soon')));

const forgotBtn = document.getElementById('forgotPass');
if(forgotBtn) forgotBtn.addEventListener('click', async e => {
  e.preventDefault();
  const email = document.getElementById('li-email').value.trim();
  if(!isEmail(email)) return toast('Enter your email above first.');
  try{ await auth.sendPasswordResetEmail(email); toast('Password reset email sent.'); }
  catch(err){ handleAuthError(err); }
});

const checkoutForm = document.getElementById('checkoutForm');
if(checkoutForm) checkoutForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nameEl = document.getElementById('co-name'), phoneEl = document.getElementById('co-phone'), cityEl = document.getElementById('co-city'), distEl = document.getElementById('co-district'), provEl = document.getElementById('co-province'), addrEl = document.getElementById('co-address'), btn = document.getElementById('placeOrderBtn');
  const ok = [setErr(nameEl, nameEl.value.trim().length < 2), setErr(phoneEl, !isPhoneOk(phoneEl.value)), setErr(cityEl, cityEl.value.trim().length < 2), setErr(distEl, distEl.value.trim().length < 2), setErr(provEl, !provEl.value), setErr(addrEl, addrEl.value.trim().length < 5)].every(Boolean);
  if(!ok) return toast('Please fill all fields');
  const formData = { fullName: nameEl.value.trim(), phone: phoneEl.value.trim(), address: addrEl.value.trim(), city: cityEl.value.trim(), district: distEl.value.trim(), province: provEl.value };
  if(!auth.currentUser){
    try{ localStorage.setItem('coolism_pending', JSON.stringify(formData)); }catch(er){}
    closeCheckout(); openAuth('signup');
    toast('Sign in to place your order');
    return;
  }
  btn.classList.add('loading'); btn.textContent = 'Placing...';
  await placeOrder(auth.currentUser, formData);
  btn.classList.remove('loading'); btn.textContent = 'Place Order — Cash on Delivery';
  if(checkoutForm) checkoutForm.reset();
});

const editForm = document.getElementById('editForm');
if(editForm) editForm.addEventListener('submit', async e => {
  e.preventDefault();
  const user = auth.currentUser; if(!user) return;
  const data = {
    firstName: document.getElementById('ed-first').value.trim(),
    lastName: document.getElementById('ed-last').value.trim(),
    phone: document.getElementById('ed-phone').value.trim(),
    address: document.getElementById('ed-address').value.trim(),
    city: document.getElementById('ed-city').value.trim(),
    district: document.getElementById('ed-district').value.trim(),
    province: document.getElementById('ed-province').value
  };
  try{
    await db.collection('users').doc(user.uid).set(data, { merge: true });
    await user.updateProfile({ displayName: `${data.firstName} ${data.lastName}`.trim() });
    document.getElementById('editModal').classList.remove('show');
    toast('Profile updated');
    loadProfile(user);
  } catch(err){ toast('Could not save'); }
});
if(document.getElementById('editProfileBtn')) document.getElementById('editProfileBtn').addEventListener('click', () => document.getElementById('editModal').classList.add('show'));
if(document.getElementById('editClose')) document.getElementById('editClose').addEventListener('click', () => document.getElementById('editModal').classList.remove('show'));

const productForm = document.getElementById('productForm');
if(productForm) productForm.addEventListener('submit', saveProduct);

const reviewForm = document.getElementById('reviewForm');
if(reviewForm) reviewForm.addEventListener('submit', async e => {
  e.preventDefault();
  const user = auth.currentUser;
  if(!user) return toast('Please sign in to post a review');
  if(!selectedStar) return toast('Please pick a star rating');
  const text = document.getElementById('reviewText').value.trim();
  if(!text) return toast('Please write a short review');
  try{
    await db.collection('reviews').add({ productId: currentReviewProduct, userId: user.uid, userName: user.displayName || user.email.split('@')[0], rating: selectedStar, text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    toast('Review posted!');
    document.getElementById('reviewText').value = '';
    selectedStar = 0;
    document.querySelectorAll('#starPicker span').forEach(s => s.classList.remove('active'));
    loadReviews(currentReviewProduct);
    updateDetailRating(currentReviewProduct);
  } catch(err){ toast('Could not post review'); }
});

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const which = tab.dataset.tab;
    ['products','orders','users'].forEach(p => { const el = document.getElementById('panel-' + p); if(el) el.hidden = which !== p; });
  });
});

if(document.getElementById('refreshProducts')) document.getElementById('refreshProducts').addEventListener('click', loadProducts);
if(document.getElementById('refreshOrders')) document.getElementById('refreshOrders').addEventListener('click', loadOrders);
if(document.getElementById('refreshUsers')) document.getElementById('refreshUsers').addEventListener('click', loadUsers);
if(document.getElementById('exportOrders')) document.getElementById('exportOrders').addEventListener('click', () => {
  const headers = ['Order ID','Date','Customer','Email','Phone','Address','City','District','Province','Items','Subtotal','Shipping','Total','Status'];
  const rows = allOrders.map(o => [o.orderId||'', o.createdAt?.toDate?o.createdAt.toDate().toISOString():'', o.fullName||'', o.email||'', o.phone||'', o.address||'', o.city||'', o.district||'', o.province||'', o.itemCount||0, o.subtotal||0, o.shipping||0, o.total||0, o.status||'pending']);
  exportCSV('coolism-orders', headers, rows);
});
if(document.getElementById('exportUsers')) document.getElementById('exportUsers').addEventListener('click', () => {
  const headers = ['UID','Email','Name','Phone','City','District','Province','Provider','Verified','Joined'];
  const rows = allUsers.map(u => [u.uid||u.id, u.email||'', `${u.firstName||''} ${u.lastName||''}`.trim(), u.phone||'', u.city||'', u.district||'', u.province||'', u.provider||'', u.emailVerified?'Yes':'No', u.createdAt?.toDate?u.createdAt.toDate().toISOString():'']);
  exportCSV('coolism-users', headers, rows);
});

const newsForm = document.getElementById('newsForm');
if(newsForm) newsForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if(!isEmail(input.value)) return toast('Please enter a valid email');
  toast("You're on the list!");
  input.value = '';
});

const navWrap = document.getElementById('navWrap');
if(navWrap) window.addEventListener('scroll', () => navWrap.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

const mq = document.getElementById('marquee');
if(mq) mq.innerHTML += mq.innerHTML;

document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    closeCart(); closeWishlist(); closeAuth(); closeSearch(); closeCheckout(); closeSuccess();
    const dm = document.getElementById('detailModal'); if(dm) dm.classList.remove('show');
    const pm = document.getElementById('productModal'); if(pm) pm.classList.remove('show');
    const sg = document.getElementById('sizeGuideModal'); if(sg) sg.classList.remove('show');
    const om = document.getElementById('orderDetailModal'); if(om) om.classList.remove('show');
    const ao = document.getElementById('adminOrderModal'); if(ao) ao.classList.remove('show');
    const au = document.getElementById('adminUserModal'); if(au) au.classList.remove('show');
    document.body.style.overflow = '';
  }
});

auth.onAuthStateChanged(user => {
  const accountBtn = document.getElementById('accountBtn'), logoutBtn = document.getElementById('logoutBtn');
  if(accountBtn){
    if(user){ const name = user.displayName || user.email.split('@')[0]; accountBtn.textContent = name.split(' ')[0]; accountBtn.title = user.email; }
    else { accountBtn.textContent = 'Login'; accountBtn.title = ''; }
  }
  if(logoutBtn){
    logoutBtn.hidden = !user;
    logoutBtn.onclick = () => auth.signOut().then(() => { toast('Logged out'); setTimeout(() => location.href = 'index.html', 500); });
  }
  if(page === 'profile') loadProfile(user);
});
