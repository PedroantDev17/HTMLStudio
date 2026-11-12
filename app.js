(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const read = (key, fallback) => { try { const value = localStorage.getItem(`htmlstudio:v2:${key}`); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(`htmlstudio:v2:${key}`, JSON.stringify(value)); return true; } catch { toast('O armazenamento do navegador está cheio. Remova uma imagem grande e tente novamente.'); return false; } };
  const categories = ['Todos', 'Lojas', 'Portfólios', 'Restaurantes', 'Serviços', 'Landing pages', 'Blogs'];
  const seeds = [
    { id:'p01', name:'Casa Nativa — loja de decoração', store:'Estúdio Ipê', category:'Lojas', price:349, theme:'store', symbol:'✿', label:'HTML · CSS · responsivo', bg:'#f0e6d6', ink:'#693b32', rating:'novo', badge:'MAIS VENDIDO', description:'Uma loja virtual elegante para marcas de decoração e produtos autorais. Inclui página inicial, catálogo, detalhes do produto e contato. Arquivos HTML e CSS responsivos, prontos para personalizar.' },
    { id:'p02', name:'Oliva — portfólio de fotografia', store:'Norte Criativo', category:'Portfólios', price:229, theme:'portfolio', symbol:'◉', label:'portfólio · galeria', bg:'#d8d2c7', ink:'#3b3b34', rating:'novo', badge:'NOVO', description:'Um portfólio limpo e visual para fotógrafos e artistas. Galeria em destaque, sobre, serviços e formulário de contato. Fácil de personalizar.' },
    { id:'p03', name:'Café do Pátio — site de restaurante', store:'Estúdio Ipê', category:'Restaurantes', price:289, theme:'restaurant', symbol:'☕', label:'cardápio · localização', bg:'#efdbbd', ink:'#7b3f2d', rating:'novo', description:'Site aconchegante para cafés, bistrôs e restaurantes. Apresenta o cardápio, horário de funcionamento, endereço e botão para reservas.' },
    { id:'p04', name:'Linha Clara — arquitetura e interiores', store:'Norte Criativo', category:'Serviços', price:319, theme:'studio', symbol:'▤', label:'projetos · sobre', bg:'#dce2de', ink:'#415851', rating:'novo', description:'Apresente projetos e serviços com este site editorial para arquitetura e interiores. Inclui galeria, página sobre o estúdio e contato.' },
    { id:'p05', name:'Veste Bem — loja de moda', store:'Pixel de Rua', category:'Lojas', price:399, theme:'fashion', symbol:'✳', label:'loja · catálogo', bg:'#ead9d5', ink:'#8e4350', rating:'novo', badge:'EDIÇÃO ESPECIAL', description:'Uma vitrine de moda com visual marcante, categorias de produtos, campanha em destaque e páginas de coleção. Design adaptado para celular.' },
    { id:'p06', name:'Aprenda Já — página de curso', store:'Norte Criativo', category:'Landing pages', price:189, theme:'course', symbol:'✎', label:'landing page · cursos', bg:'#ddd8ed', ink:'#575081', rating:'novo', description:'Página de apresentação para cursos, mentorias e produtos digitais. Explica a proposta, apresenta módulos, depoimentos e chamada para ação.' },
    { id:'p07', name:'Raiz — clínica de bem-estar', store:'Pixel de Rua', category:'Serviços', price:279, theme:'wellness', symbol:'✿', label:'serviços · agendamento', bg:'#dce4d6', ink:'#526c50', rating:'novo', description:'Um site acolhedor para clínicas e profissionais de bem-estar, com apresentação dos serviços, equipe, perguntas frequentes e contato.' },
    { id:'p08', name:'Bom Apetite — menu digital', store:'Estúdio Ipê', category:'Restaurantes', price:159, theme:'menu', symbol:'♨', label:'menu digital · simples', bg:'#f0d5c7', ink:'#873d31', rating:'novo', description:'Um site leve com menu digital, categorias, fotos e endereço. Ideal para restaurantes, lanchonetes e food trucks.' },
    { id:'p09', name:'Lume — portfólio de design', store:'Pixel de Rua', category:'Portfólios', price:249, theme:'design', symbol:'▧', label:'portfólio · projetos', bg:'#d8d9ee', ink:'#4e5282', rating:'novo', description:'Portfólio criativo para designers e estúdios. Mostre projetos, processo e serviços em uma página fácil de navegar.' },
    { id:'p10', name:'Bom Dia — blog de receitas', store:'Casa Amarela Web', category:'Blogs', price:219, theme:'blog', symbol:'▤', label:'blog · receitas', bg:'#e6dfc8', ink:'#6d633c', rating:'novo', description:'Blog organizado para publicar receitas, histórias e dicas. Inclui capa editorial, categorias e modelo de artigo.' },
    { id:'p11', name:'Flor de Sal — loja artesanal', store:'Casa Amarela Web', category:'Lojas', price:329, theme:'artisan', symbol:'✿', label:'loja · feito à mão', bg:'#e8d7ce', ink:'#8b584d', rating:'novo', description:'Loja pronta para marcas de produtos artesanais, com catálogo visual, apresentação da marca e espaço para contar como cada peça é feita.' },
    { id:'p12', name:'Pulso — site para personal trainer', store:'Norte Criativo', category:'Landing pages', price:179, theme:'fitness', symbol:'↗', label:'serviços · chamada', bg:'#d4e0e3', ink:'#3c5b68', rating:'novo', description:'Página direta para profissionais de educação física. Apresente planos, resultados, depoimentos e um botão de contato.' }
  ];
  let products = [...seeds, ...read('products', []).filter(product => categories.includes(product.category))];
  let cart = read('cart', []), favorites = read('favorites', []), account = read('account', null);
  const checkoutMarkup = $('#checkout-modal').innerHTML;
  let activeCategory = 'Todos', query = '', sort = 'featured', visibleCount = 8, activeShop = '';
  const colors = { Lojas:'#f0e6d6', Portfólios:'#d8d2c7', Restaurantes:'#efdbbd', Serviços:'#dce2de', 'Landing pages':'#ddd8ed', Blogs:'#e6dfc8' };
  const symbols = { Lojas:'▱', Portfólios:'◉', Restaurantes:'☕', Serviços:'▦', 'Landing pages':'↗', Blogs:'▤' };
  const themes = { store:['Casa Nativa','Seu espaço, seu jeito.','Objetos para morar mais devagar.'], portfolio:['OLIVA STUDIO','Imagens que contam.','Fotografia • direção • histórias'], restaurant:['CAFÉ DO PÁTIO','Feito para ficar.','Café bom, comida de verdade.'], studio:['LINHA CLARA','Espaços com intenção.','Arquitetura • interiores'], fashion:['VESTE BEM','Vista o seu momento.','Nova coleção disponível'], course:['APRENDA JÁ','Aprenda no seu tempo.','Conteúdo prático para começar'], wellness:['RAIZ BEM-ESTAR','Um tempo para você.','Cuidado que acompanha sua rotina'], menu:['BOM APETITE','Sabor de casa.','Veja nosso cardápio'], design:['LUME DESIGN','Ideias em movimento.','Design • identidade • digital'], blog:['BOM DIA','Receitas para compartilhar.','Comida gostosa, sem complicação'], artisan:['FLOR DE SAL','Pequenos feitos, grandes afetos.','Peças artesanais com história'], fitness:['PULSO TREINO','Seu ritmo. Seu resultado.','Treino feito para a sua vida'] };
  const getProduct = id => products.find(item => item.id === id);
  const visualStyle = product => `--visual-bg:${escapeHtml(product.bg || colors[product.category] || '#dedfd3')};--visual-ink:${escapeHtml(product.ink || '#61705a')}`;
  const visual = (product, detail = false) => { const theme = themes[product.theme] || [product.store.toUpperCase(), product.name, product.category]; return `<div class="${detail ? 'detail-visual' : 'product-visual'} theme-${escapeHtml(product.theme || 'store')}" style="${visualStyle(product)}"><div class="web-preview"><div class="web-bar"><i></i><i></i><i></i><span>${escapeHtml((product.theme || 'site').replaceAll('-', ''))}.com.br</span></div><div class="web-page"><div class="web-nav"><b>${escapeHtml(theme[0])}</b><span>MENU&nbsp; ☰</span></div><div class="web-content"><div class="web-copy"><small>${escapeHtml(product.category.toUpperCase())}</small><strong>${escapeHtml(theme[1])}</strong><p>${escapeHtml(theme[2])}</p><i>CONHEÇA ↗</i></div><div class="web-photo"><span>${escapeHtml(product.symbol || '✳')}</span></div></div><div class="web-lower"><i></i><i></i><i></i></div></div></div>${product.image ? `<img class="preview-image" src="${escapeHtml(product.image)}" alt="Prévia de ${escapeHtml(product.name)}">` : ''}${!detail ? `<span class="preview-label">PRÉVIA DO SITE</span>` : ''}</div>`; };
  const safeDemo = value => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  let toastTimer;
  function toast(message) { const node = $('#toast'); node.textContent = message; node.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2600); }
  function renderCategories() {
    $('#category-list').innerHTML = categories.map(category => `<button class="${activeCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${category === 'Todos' ? 'Tudo' : escapeHtml(category)}</button>`).join('');
    $('#filter-list').innerHTML = categories.map(category => `<button class="filter-chip ${activeCategory === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${category === 'Todos' ? 'Tudo' : escapeHtml(category)}</button>`).join('');
  }
  function productMatches(product) {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return (!activeCategory || activeCategory === 'Todos' || product.category === activeCategory) && (!activeShop || product.store === activeShop) && (!term || `${product.name} ${product.store} ${product.category} ${product.description || ''}`.toLocaleLowerCase('pt-BR').includes(term));
  }
  function renderProducts() {
    let filtered = products.filter(productMatches);
    if (sort === 'price-asc') filtered = [...filtered].sort((a,b) => a.price-b.price);
    if (sort === 'price-desc') filtered = [...filtered].sort((a,b) => b.price-a.price);
    if (sort === 'name') filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name,'pt-BR'));
    const page = filtered.slice(0, visibleCount);
    $('#product-grid').innerHTML = page.map(product => `<article class="product-card" data-product="${escapeHtml(product.id)}" tabindex="0" aria-label="Ver ${escapeHtml(product.name)}"><div class="product-wrap">${visual(product)}${product.badge ? `<span class="tag">${escapeHtml(product.badge)}</span>` : ''}<button class="favorite ${favorites.includes(product.id) ? 'active' : ''}" data-favorite="${escapeHtml(product.id)}" aria-label="${favorites.includes(product.id) ? 'Remover dos' : 'Adicionar aos'} favoritos">${favorites.includes(product.id) ? '♥' : '♡'}</button></div><div class="product-info"><span class="product-store"><i class="store-dot"></i>${escapeHtml(product.store)}</span><h3 class="product-title">${escapeHtml(product.name)}</h3><span class="product-type">${escapeHtml(product.category)} · site digital</span><span class="product-price">${money(product.price)}</span><span class="product-rating">${product.rating === 'novo' ? 'NOVO SITE' : `★ ${escapeHtml(product.rating || '')}`}</span></div></article>`).join('');
    $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'site encontrado' : 'sites encontrados'}${activeShop ? ` por ${activeShop}` : ''}`;
    $('#empty-state').hidden = filtered.length > 0;
    $('#product-grid').hidden = filtered.length === 0;
    $('#load-more').hidden = page.length >= filtered.length || filtered.length === 0;
    $('#clear-filters').classList.toggle('visible', !!query || activeCategory !== 'Todos' || !!activeShop);
  }
  function renderShops() {
    const shops = [...new Set(products.map(product => product.store))];
    const glyphs = ['&lt;/&gt;','◉','✳','☼','◈','❋','⌁'];
    $('#shop-pills').innerHTML = shops.slice(0, 7).map((shop, index) => `<button class="shop-pill" data-shop="${escapeHtml(shop)}"><span>${glyphs[index % glyphs.length]}</span>${escapeHtml(shop)}</button>`).join('');
  }
  function renderAccount() { $('#account-label').textContent = account?.name ? account.name.split(' ')[0] : 'Entrar'; }
  function renderCart() {
    const count = cart.reduce((sum,item) => sum + item.quantity, 0);
    $('#cart-count').textContent = count;
    $('#drawer-count').textContent = `(${count})`;
    const rows = cart.map(item => { const product = getProduct(item.id); if (!product) return ''; return `<div class="cart-row"><div class="cart-thumb" style="${visualStyle(product)}">${product.image ? `<img src="${escapeHtml(product.image)}" alt="" style="width:100%;height:100%;object-fit:cover">` : escapeHtml(product.symbol || '▱')}</div><div><b>${escapeHtml(product.name)}</b><small>Site digital · ${escapeHtml(product.store)}</small><button class="cart-remove" data-remove="${escapeHtml(product.id)}">Retirar da sacola</button></div><span class="cart-price">${money(product.price)}</span></div>`; }).join('');
    $('#cart-items').innerHTML = rows;
    const empty = count === 0;
    $('#cart-empty').hidden = !empty;
    $('#cart-summary').hidden = empty;
    $('#cart-items').hidden = empty;
    $('#cart-subtotal').textContent = money(cart.reduce((sum,item) => sum + (getProduct(item.id)?.price || 0) * item.quantity, 0));
  }
  function openPanel(panel) {
    closeAll(false);
    $('#overlay').hidden = false;
    panel.hidden = false;
    requestAnimationFrame(() => { if (panel === $('#cart-drawer')) panel.classList.add('open'); else panel.classList.add('visible'); });
    document.body.style.overflow = 'hidden';
    if (panel === $('#cart-drawer')) panel.setAttribute('aria-hidden','false');
    setTimeout(() => $('input,button,[tabindex="0"]', panel)?.focus(), 80);
  }
  function closeAll(animate = true) {
    const drawer = $('#cart-drawer'); drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
    $$('.modal').forEach(modal => { modal.classList.remove('visible'); if (!animate) modal.hidden = true; else setTimeout(() => { if (!modal.classList.contains('visible')) modal.hidden = true; }, 180); });
    $('#overlay').hidden = true;
    document.body.style.overflow = '';
    if (!animate) drawer.hidden = false;
  }
  function openDrawer() { $('#cart-drawer').hidden = false; openPanel($('#cart-drawer')); }
  function openModal(id) { openPanel($(id)); }
  function addToCart(id) {
    const entry = cart.find(item => item.id === id);
    if (entry) { toast('Esse site já está na sua sacola.'); return; } else cart.push({ id, quantity: 1 });
    write('cart',cart); renderCart(); toast('Adicionado à sua sacola.');
  }
  function openProduct(id) {
    const product = getProduct(id); if (!product) return;
    const demo = safeDemo(product.demo || '');
    $('#product-detail').innerHTML = `${visual(product,true)}<div class="detail-copy"><span class="eyebrow">SITE PRONTO · ${escapeHtml(product.category)}</span><h2 id="product-title">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.description || 'Site criado para você personalizar e colocar sua ideia no ar.')}</p><div class="detail-price">${money(product.price)}</div><span class="detail-shipping">Produto digital · entrega de arquivos após a compra.</span><div class="detail-seller"><span class="store-dot"></span> Criado por <b>${escapeHtml(product.store)}</b></div>${demo ? `<a class="button button-outline demo-link" href="${escapeHtml(demo)}" target="_blank" rel="noopener noreferrer">Abrir demonstração <span>↗</span></a>` : ''}<button class="button button-dark" data-add="${escapeHtml(product.id)}">Adicionar site à sacola <span>＋</span></button></div>`;
    openModal('#product-modal');
  }
  function setCategory(category) { activeCategory = category; activeShop = ''; visibleCount = 8; renderCategories(); renderProducts(); }
  function resetFilters() { query = ''; activeCategory = 'Todos'; activeShop = ''; sort = 'featured'; visibleCount = 8; $('#search-input').value = ''; $('#sort-select').value = sort; renderCategories(); renderProducts(); }

  renderCategories(); renderProducts(); renderShops(); renderAccount(); renderCart();
  document.addEventListener('click', event => {
    const category = event.target.closest('[data-category]');
    if (category) { setCategory(category.dataset.category); $('#descobrir').scrollIntoView({behavior:'smooth',block:'start'}); return; }
    const shop = event.target.closest('[data-shop]');
    if (shop) { activeShop = activeShop === shop.dataset.shop ? '' : shop.dataset.shop; activeCategory = 'Todos'; query = ''; $('#search-input').value = ''; renderCategories(); renderProducts(); $('#descobrir').scrollIntoView({behavior:'smooth'}); return; }
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) { event.stopPropagation(); const id = favorite.dataset.favorite; favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites,id]; write('favorites',favorites); renderProducts(); return; }
    const quantity = event.target.closest('[data-quantity]');
    if (quantity) return;
    const remove = event.target.closest('[data-remove]');
    if (remove) { cart = cart.filter(item => item.id !== remove.dataset.remove); write('cart',cart); renderCart(); return; }
    const add = event.target.closest('[data-add]');
    if (add) { addToCart(add.dataset.add); closeAll(); return; }
    const card = event.target.closest('[data-product]');
    if (card) { openProduct(card.dataset.product); return; }
    if (event.target.closest('[data-close]')) { closeAll(); return; }
    if (event.target === $('#overlay')) { closeAll(); return; }
    if (['#seller-open','#seller-open-nav','#seller-open-banner','#footer-seller'].some(selector => event.target.closest(selector))) { event.preventDefault(); openModal('#seller-modal'); return; }
    if (['#account-open','#footer-account'].some(selector => event.target.closest(selector))) { event.preventDefault(); if (account) toast(`Olá, ${account.name.split(' ')[0]}! Sua conta está neste navegador.`); else openModal('#account-modal'); return; }
    if (event.target.closest('#cart-open')) { openDrawer(); return; }
    if (event.target.closest('#checkout-open')) { const modal = $('#checkout-modal'); if (modal.dataset.completed === 'true') { modal.innerHTML = checkoutMarkup; modal.dataset.completed = 'false'; } const total = cart.reduce((sum,item) => sum + (getProduct(item.id)?.price || 0) * item.quantity,0); $('#checkout-total').textContent = money(total); if (account) { $('#checkout-form [name="name"]').value = account.name; $('#checkout-form [name="email"]').value = account.email; } $('#cart-drawer').classList.remove('open'); setTimeout(() => openModal('#checkout-modal'),150); return; }
    const footerCategory = event.target.closest('[data-footer-category]');
    if (footerCategory) { event.preventDefault(); setCategory(footerCategory.dataset.footerCategory); $('#descobrir').scrollIntoView({behavior:'smooth'}); return; }
    if (event.target.closest('#empty-clear') || event.target.closest('#clear-filters')) { resetFilters(); return; }
    if (event.target.closest('#load-more')) { visibleCount += 8; renderProducts(); return; }
    if (event.target.closest('#shops-next')) { const pills = $('#shop-pills'); pills.scrollBy({left:220,behavior:'smooth'}); if (pills.scrollLeft + pills.clientWidth >= pills.scrollWidth - 5) { activeShop = ''; renderShops(); toast('Você está vendo todas as lojas.'); } return; }
    if (event.target.closest('#mobile-menu')) { $('#descobrir').scrollIntoView({behavior:'smooth'}); return; }
  });
  $('#search-form').addEventListener('submit', event => { event.preventDefault(); query = $('#search-input').value; activeShop = ''; visibleCount = 8; renderProducts(); $('#descobrir').scrollIntoView({behavior:'smooth'}); });
  $('#search-input').addEventListener('input', () => { query = $('#search-input').value; activeShop = ''; visibleCount = 8; renderProducts(); });
  $('#sort-select').addEventListener('change', event => { sort = event.target.value; visibleCount = 8; renderProducts(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.product-card')) { event.preventDefault(); openProduct(event.target.dataset.product); } });
  $('#seller-form').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget, data = new FormData(form); const file = data.get('image');
    if (file?.size > 1024 * 1024) { toast('A imagem precisa ter até 1 MB.'); return; }
    let image = '';
    if (file?.size) image = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    const store = String(data.get('store')).trim();
    const category = String(data.get('category'));
    const themeByCategory = { Lojas:'store', Portfólios:'portfolio', Restaurantes:'restaurant', Serviços:'studio', 'Landing pages':'course', Blogs:'blog' };
    const product = { id:`seller-${Date.now()}`, name:String(data.get('product')).trim(), store, owner:String(data.get('owner')).trim(), email:String(data.get('email')).trim(), category, price:Number(data.get('price')), description:String(data.get('description')).trim() || 'Site pronto para personalizar, criado por um vendedor independente.', symbol:symbols[category] || '▱', theme:themeByCategory[category] || 'store', label:'site pronto', bg:colors[category] || '#f0e6d6', ink:'#71333a', rating:'novo', image, demo:safeDemo(String(data.get('demo') || '').trim()) };
    const savedProducts = read('products',[]); savedProducts.unshift(product);
    if (!write('products',savedProducts)) return;
    products = [...seeds,...savedProducts]; form.reset(); closeAll(); activeCategory = 'Todos'; activeShop = store; query = ''; renderCategories(); renderShops(); renderProducts(); $('#descobrir').scrollIntoView({behavior:'smooth'}); toast(`${store} já tem um produto na vitrine!`);
  });
  $('#account-form').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); account = { name:String(form.get('name')).trim(), email:String(form.get('email')).trim() }; if (write('account',account)) { renderAccount(); event.currentTarget.reset(); closeAll(); toast(`Bem-vindo, ${account.name.split(' ')[0]}!`); } });
  $('#checkout-form').addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get('name')).trim(); const email = String(form.get('email')).trim(); const total = cart.reduce((sum,item) => sum + (getProduct(item.id)?.price || 0) * item.quantity,0); const orderId = `HS-${String(Date.now()).slice(-7)}`;
    const orders = read('orders',[]); orders.unshift({ id:orderId, name, email, total, items:cart.map(item => ({ ...item, name:getProduct(item.id)?.name, store:getProduct(item.id)?.store })), createdAt:new Date().toISOString() });
    if (!write('orders',orders)) return;
    account = { name,email }; write('account',account); cart = []; write('cart',cart); renderCart(); renderAccount();
    const modal = $('#checkout-modal'); modal.dataset.completed = 'true'; modal.innerHTML = `<button class="modal-close" data-close aria-label="Fechar">×</button><div class="success-state"><span>✓</span><h2>Pedido anotado!</h2><p>Seu pedido <b>${escapeHtml(orderId)}</b> foi registrado nesta demonstração. Em uma loja real, o criador entregaria os arquivos do site após a confirmação do pagamento.</p><button class="button button-dark" data-close>Voltar para os sites <span>↗</span></button></div>`;
  });
})();
