/* Interações e renderização do marketplace. Os anúncios ficam em catalog.js. */
(() => {
  /* Seletores, formatação e armazenamento local */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const catalog = window.SITE_MARKETPLACE;

  const formatPrice = value => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value) || 0);

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  const storage = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(`htmlstudio:v3:${key}`);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`htmlstudio:v3:${key}`, JSON.stringify(value));
        return true;
      } catch {
        showToast('O armazenamento está cheio. Tente remover uma imagem grande.');
        return false;
      }
    }
  };

  const state = {
    sites: [...catalog.sites, ...storage.get('sites', [])],
    cart: storage.get('cart', []),
    favorites: storage.get('favorites', []),
    account: storage.get('account', null),
    category: 'Todos',
    creator: '',
    search: '',
    sort: 'featured',
    visibleCount: 8
  };

  const checkoutMarkup = $('#checkout-modal').innerHTML;
  let toastTimer;

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function safeDemoLink(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function creatorName(site) {
    return site.creator || site.store || 'Criador independente';
  }

  function preview(site, detail = false) {
    const theme = catalog.themes[site.theme] || [creatorName(site).toUpperCase(), site.name, site.category];
    const classes = `${detail ? 'detail-visual' : 'product-visual'} theme-${escapeHTML(site.theme || 'store')}`;

    return `
      <div class="${classes}" style="--visual-bg:${escapeHTML(site.bg || catalog.colors[site.category] || '#f0e6d6')};--visual-ink:${escapeHTML(site.ink || '#693b32')}">
        <div class="web-preview">
          <div class="web-bar"><i></i><i></i><i></i><span>${escapeHTML(site.theme || 'site')}.com.br</span></div>
          <div class="web-page">
            <div class="web-nav"><b>${escapeHTML(theme[0])}</b><span>MENU&nbsp; ☰</span></div>
            <div class="web-content">
              <div class="web-copy">
                <small>${escapeHTML(site.category.toUpperCase())}</small>
                <strong>${escapeHTML(theme[1])}</strong>
                <p>${escapeHTML(theme[2])}</p>
                <i>CONHEÇA ↗</i>
              </div>
              <div class="web-photo"><span>${escapeHTML(site.symbol || '✳')}</span></div>
            </div>
            <div class="web-lower"><i></i><i></i><i></i></div>
          </div>
        </div>
        ${site.image ? `<img class="preview-image" src="${escapeHTML(site.image)}" alt="Prévia de ${escapeHTML(site.name)}">` : ''}
        ${detail ? '' : '<span class="preview-label">PRÉVIA DO SITE</span>'}
      </div>`;
  }

  /* Busca, filtros e renderização das áreas da página */
  function matchingSites() {
    const term = state.search.trim().toLocaleLowerCase('pt-BR');
    let sites = state.sites.filter(site => {
      const matchesCategory = state.category === 'Todos' || site.category === state.category;
      const matchesCreator = !state.creator || creatorName(site) === state.creator;
      const text = `${site.name} ${creatorName(site)} ${site.category} ${site.description || ''}`.toLocaleLowerCase('pt-BR');
      return matchesCategory && matchesCreator && (!term || text.includes(term));
    });

    if (state.sort === 'price-asc') sites = [...sites].sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') sites = [...sites].sort((a, b) => b.price - a.price);
    if (state.sort === 'name') sites = [...sites].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return sites;
  }

  function renderCategories() {
    $('#category-list').innerHTML = catalog.categories.map(category => `
      <button class="${state.category === category ? 'active' : ''}" data-category="${escapeHTML(category)}">
        ${category === 'Todos' ? 'Tudo' : escapeHTML(category)}
      </button>`).join('');
    $('#filter-list').innerHTML = catalog.categories.map(category => `
      <button class="filter-chip ${state.category === category ? 'active' : ''}" data-category="${escapeHTML(category)}">
        ${category === 'Todos' ? 'Tudo' : escapeHTML(category)}
      </button>`).join('');
  }

  function renderSites() {
    const allSites = matchingSites();
    const visibleSites = allSites.slice(0, state.visibleCount);

    $('#product-grid').innerHTML = visibleSites.map(site => `
      <article class="product-card" data-site="${escapeHTML(site.id)}" tabindex="0" aria-label="Ver ${escapeHTML(site.name)}">
        <div class="product-wrap">
          ${preview(site)}
          ${site.badge ? `<span class="tag">${escapeHTML(site.badge)}</span>` : ''}
          <button class="favorite ${state.favorites.includes(site.id) ? 'active' : ''}" data-favorite="${escapeHTML(site.id)}" aria-label="Alternar favorito">
            ${state.favorites.includes(site.id) ? '♥' : '♡'}
          </button>
        </div>
        <div class="product-info">
          <span class="product-store"><i class="store-dot"></i>${escapeHTML(creatorName(site))}</span>
          <h3 class="product-title">${escapeHTML(site.name)}</h3>
          <span class="product-type">${escapeHTML(site.category)} · site digital</span>
          <span class="product-price">${formatPrice(site.price)}</span>
          <span class="product-rating">${site.rating === 'novo' ? 'NOVO SITE' : `★ ${escapeHTML(site.rating || '')}`}</span>
        </div>
      </article>`).join('');

    $('#result-count').textContent = `${allSites.length} ${allSites.length === 1 ? 'site encontrado' : 'sites encontrados'}${state.creator ? ` por ${state.creator}` : ''}`;
    $('#product-grid').hidden = allSites.length === 0;
    $('#empty-state').hidden = allSites.length !== 0;
    $('#load-more').hidden = visibleSites.length >= allSites.length || allSites.length === 0;
    $('#clear-filters').classList.toggle('visible', state.search !== '' || state.category !== 'Todos' || state.creator !== '');
  }

  function renderCreators() {
    const creators = [...new Set(state.sites.map(creatorName))];
    const symbols = ['&lt;/&gt;', '◉', '✳', '☼', '◈', '❋', '⌁'];
    $('#shop-pills').innerHTML = creators.slice(0, 7).map((creator, index) => `
      <button class="shop-pill" data-creator="${escapeHTML(creator)}">
        <span>${symbols[index % symbols.length]}</span>${escapeHTML(creator)}
      </button>`).join('');
  }

  function renderAccount() {
    $('#account-label').textContent = state.account?.name ? state.account.name.split(' ')[0] : 'Entrar';
  }

  function getSite(id) {
    return state.sites.find(site => site.id === id);
  }

  function renderCart() {
    const items = state.cart.filter(item => getSite(item.id));
    const count = items.length;
    const total = items.reduce((sum, item) => sum + getSite(item.id).price, 0);

    $('#cart-count').textContent = count;
    $('#drawer-count').textContent = `(${count})`;
    $('#cart-items').innerHTML = items.map(item => {
      const site = getSite(item.id);
      return `
        <div class="cart-row">
          <div class="cart-thumb" style="background:${escapeHTML(site.bg || '#f0e6d6')}">${escapeHTML(site.symbol || '▱')}</div>
          <div>
            <b>${escapeHTML(site.name)}</b>
            <small>Site digital · ${escapeHTML(creatorName(site))}</small>
            <button class="cart-remove" data-remove="${escapeHTML(site.id)}">Retirar da sacola</button>
          </div>
          <span class="cart-price">${formatPrice(site.price)}</span>
        </div>`;
    }).join('');

    $('#cart-items').hidden = count === 0;
    $('#cart-empty').hidden = count !== 0;
    $('#cart-summary').hidden = count === 0;
    $('#cart-subtotal').textContent = formatPrice(total);
  }

  /* Sacola e janelas de detalhes */
  function closePanels(animate = true) {
    const drawer = $('#cart-drawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');

    $$('.modal').forEach(modal => {
      modal.classList.remove('visible');
      if (animate) {
        setTimeout(() => {
          if (!modal.classList.contains('visible')) modal.hidden = true;
        }, 180);
      } else {
        modal.hidden = true;
      }
    });

    $('#overlay').hidden = true;
    document.body.style.overflow = '';
    if (!animate) drawer.hidden = false;
  }

  function openPanel(panel) {
    closePanels(false);
    $('#overlay').hidden = false;
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add(panel === $('#cart-drawer') ? 'open' : 'visible');
    });
    document.body.style.overflow = 'hidden';

    if (panel === $('#cart-drawer')) panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => $('input, button, [tabindex="0"]', panel)?.focus(), 80);
  }

  function openSite(id) {
    const site = getSite(id);
    if (!site) return;

    const demoLink = safeDemoLink(site.demo || '');
    $('#product-detail').innerHTML = `
      ${preview(site, true)}
      <div class="detail-copy">
        <span class="eyebrow">SITE PRONTO · ${escapeHTML(site.category)}</span>
        <h2 id="product-title">${escapeHTML(site.name)}</h2>
        <p>${escapeHTML(site.description || 'Site criado para você personalizar e colocar sua ideia no ar.')}</p>
        <div class="detail-price">${formatPrice(site.price)}</div>
        <span class="detail-shipping">Produto digital · entrega de arquivos após a compra.</span>
        <div class="detail-seller"><span class="store-dot"></span> Criado por <b>${escapeHTML(creatorName(site))}</b></div>
        ${demoLink ? `<a class="button button-outline demo-link" href="${escapeHTML(demoLink)}" target="_blank" rel="noopener noreferrer">Abrir demonstração <span>↗</span></a>` : ''}
        <button class="button button-dark" data-add="${escapeHTML(site.id)}">Adicionar site à sacola <span>＋</span></button>
      </div>`;

    openPanel($('#product-modal'));
  }

  function setCategory(category) {
    state.category = category;
    state.creator = '';
    state.visibleCount = 8;
    renderCategories();
    renderSites();
  }

  function resetFilters() {
    state.category = 'Todos';
    state.creator = '';
    state.search = '';
    state.sort = 'featured';
    state.visibleCount = 8;
    $('#search-input').value = '';
    $('#sort-select').value = state.sort;
    renderCategories();
    renderSites();
  }

  function scrollToCatalog() {
    $('#descobrir').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Ações do comprador e do criador */
  function addSiteToCart(id) {
    if (state.cart.some(item => item.id === id)) {
      showToast('Esse site já está na sua sacola.');
      return;
    }

    state.cart.push({ id, quantity: 1 });
    storage.set('cart', state.cart);
    renderCart();
    showToast('Site adicionado à sacola.');
  }

  function handleClick(event) {
    const target = event.target;
    const categoryButton = target.closest('[data-category]');
    const creatorButton = target.closest('[data-creator]');
    const favoriteButton = target.closest('[data-favorite]');
    const removeButton = target.closest('[data-remove]');
    const addButton = target.closest('[data-add]');
    const siteCard = target.closest('[data-site]');

    if (categoryButton) {
      setCategory(categoryButton.dataset.category);
      scrollToCatalog();
    } else if (creatorButton) {
      state.creator = state.creator === creatorButton.dataset.creator ? '' : creatorButton.dataset.creator;
      state.category = 'Todos';
      state.search = '';
      $('#search-input').value = '';
      renderCategories();
      renderSites();
      scrollToCatalog();
    } else if (favoriteButton) {
      const id = favoriteButton.dataset.favorite;
      state.favorites = state.favorites.includes(id)
        ? state.favorites.filter(favorite => favorite !== id)
        : [...state.favorites, id];
      storage.set('favorites', state.favorites);
      renderSites();
    } else if (removeButton) {
      state.cart = state.cart.filter(item => item.id !== removeButton.dataset.remove);
      storage.set('cart', state.cart);
      renderCart();
    } else if (addButton) {
      addSiteToCart(addButton.dataset.add);
      closePanels();
    } else if (siteCard) {
      openSite(siteCard.dataset.site);
    } else if (target.closest('[data-close]') || target === $('#overlay')) {
      closePanels();
    } else if (target.closest('#seller-open, #seller-open-nav, #seller-open-banner, #footer-seller')) {
      event.preventDefault();
      openPanel($('#seller-modal'));
    } else if (target.closest('#account-open, #footer-account')) {
      event.preventDefault();
      if (state.account) showToast(`Olá, ${state.account.name.split(' ')[0]}!`);
      else openPanel($('#account-modal'));
    } else if (target.closest('#cart-open')) {
      openPanel($('#cart-drawer'));
    } else if (target.closest('#checkout-open')) {
      openCheckout();
    } else if (target.closest('[data-footer-category]')) {
      event.preventDefault();
      setCategory(target.closest('[data-footer-category]').dataset.footerCategory);
      scrollToCatalog();
    } else if (target.closest('#empty-clear, #clear-filters')) {
      resetFilters();
    } else if (target.closest('#load-more')) {
      state.visibleCount += 8;
      renderSites();
    } else if (target.closest('#shops-next')) {
      $('#shop-pills').scrollBy({ left: 220, behavior: 'smooth' });
    } else if (target.closest('#mobile-menu')) {
      scrollToCatalog();
    }
  }

  function openCheckout() {
    const modal = $('#checkout-modal');
    if (modal.dataset.completed === 'true') {
      modal.innerHTML = checkoutMarkup;
      modal.dataset.completed = 'false';
      $('#checkout-form').addEventListener('submit', handleCheckoutSubmit);
    }

    const total = state.cart.reduce((sum, item) => sum + (getSite(item.id)?.price || 0), 0);
    $('#checkout-total').textContent = formatPrice(total);
    if (state.account) {
      $('#checkout-form [name="name"]').value = state.account.name;
      $('#checkout-form [name="email"]').value = state.account.email;
    }

    $('#cart-drawer').classList.remove('open');
    setTimeout(() => openPanel(modal), 150);
  }

  /* Formulários: anúncio, conta e pedido */
  async function handleSellerSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const imageFile = data.get('image');

    if (imageFile?.size > 1024 * 1024) {
      showToast('A imagem de prévia precisa ter até 1 MB.');
      return;
    }

    const image = imageFile?.size
      ? await readImage(imageFile)
      : '';
    const category = String(data.get('category'));
    const themeByCategory = {
      Lojas: 'store', Portfólios: 'portfolio', Restaurantes: 'restaurant',
      Serviços: 'studio', 'Landing pages': 'course', Blogs: 'blog'
    };
    const site = {
      id: `site-${Date.now()}`,
      name: String(data.get('product')).trim(),
      creator: String(data.get('store')).trim(),
      category,
      price: Number(data.get('price')),
      description: String(data.get('description')).trim() || 'Site pronto para personalizar, criado por um vendedor independente.',
      theme: themeByCategory[category] || 'store',
      symbol: catalog.symbols[category] || '▱',
      badge: '',
      image,
      demo: safeDemoLink(String(data.get('demo') || '').trim())
    };

    const savedSites = [...storage.get('sites', []), site];
    if (!storage.set('sites', savedSites)) return;

    state.sites = [...catalog.sites, ...savedSites];
    state.category = 'Todos';
    state.creator = site.creator;
    state.search = '';
    $('#search-input').value = '';
    form.reset();
    renderCategories();
    renderCreators();
    renderSites();
    closePanels();
    scrollToCatalog();
    showToast(`${site.creator} já tem um site na vitrine.`);
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleAccountSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.account = {
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim()
    };

    if (!storage.set('account', state.account)) return;
    renderAccount();
    event.currentTarget.reset();
    closePanels();
    showToast(`Bem-vindo, ${state.account.name.split(' ')[0]}!`);
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const orderId = `HS-${String(Date.now()).slice(-7)}`;
    const order = {
      id: orderId,
      name: String(data.get('name')).trim(),
      email: String(data.get('email')).trim(),
      total: state.cart.reduce((sum, item) => sum + (getSite(item.id)?.price || 0), 0),
      sites: state.cart.map(item => getSite(item.id)?.name).filter(Boolean),
      createdAt: new Date().toISOString()
    };
    const orders = [order, ...storage.get('orders', [])];
    if (!storage.set('orders', orders)) return;

    state.account = { name: order.name, email: order.email };
    storage.set('account', state.account);
    state.cart = [];
    storage.set('cart', state.cart);
    renderCart();
    renderAccount();

    const modal = $('#checkout-modal');
    modal.dataset.completed = 'true';
    modal.innerHTML = `
      <button class="modal-close" data-close aria-label="Fechar">×</button>
      <div class="success-state">
        <span>✓</span><h2>Pedido anotado!</h2>
        <p>O pedido <b>${escapeHTML(orderId)}</b> foi registrado nesta demonstração. Em uma loja real, o criador entregaria os arquivos após a confirmação do pagamento.</p>
        <button class="button button-dark" data-close>Voltar para os sites <span>↗</span></button>
      </div>`;
  }

  function handleSearch(event) {
    if (event.type === 'submit') event.preventDefault();
    state.search = $('#search-input').value;
    state.creator = '';
    state.visibleCount = 8;
    renderSites();
    if (event.type === 'submit') scrollToCatalog();
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') closePanels();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.product-card')) {
      event.preventDefault();
      openSite(event.target.dataset.site);
    }
  }

  /* Liga eventos e prepara a página */
  function init() {
    renderCategories();
    renderCreators();
    renderSites();
    renderCart();
    renderAccount();

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    $('#search-form').addEventListener('submit', handleSearch);
    $('#search-input').addEventListener('input', handleSearch);
    $('#sort-select').addEventListener('change', event => {
      state.sort = event.target.value;
      state.visibleCount = 8;
      renderSites();
    });
    $('#seller-form').addEventListener('submit', handleSellerSubmit);
    $('#account-form').addEventListener('submit', handleAccountSubmit);
    $('#checkout-form').addEventListener('submit', handleCheckoutSubmit);
  }

  init();
})();
