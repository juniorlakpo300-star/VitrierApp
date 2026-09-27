const galleryItems = [
  { title:'Fenêtre panoramique noire', category:'fenetre', img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80' },
  { title:'Balcon verre transparent', category:'balcon', img:'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80' },
  { title:'Vitrine commerciale premium', category:'vitrine', img:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80' },
  { title:'Escalier garde-corps moderne', category:'garde-corps', img:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80' }
];

const products = [
  {id:1,name:'Fenêtre Luxe Thermique',category:'fenetre',price:850000,options:'Double vitrage, cadre aluminium noir',description:'Isolation thermique performante et style minimaliste.',img:galleryItems[0].img},
  {id:2,name:'Balcon SkyGlass',category:'balcon',price:3200000,options:'Verre feuilleté sécurité, finition dorée',description:'Balcon contemporain avec haute transparence.',img:galleryItems[1].img},
  {id:3,name:'Vitrine Pro Secure',category:'vitrine',price:2400000,options:'Anti-effraction, traitement anti-UV',description:'Parfait pour boutiques et espaces commerciaux.',img:galleryItems[2].img},
  {id:4,name:'Garde-corps Crystal Line',category:'garde-corps',price:1800000,options:'Verre trempé 10 mm, fixation inox',description:'Sécurité et élégance pour escaliers et terrasses.',img:galleryItems[3].img}
];

const $ = (selector) => document.querySelector(selector);
const gallery = $('#gallery');
const productList = $('#productList');
const emptyProducts = $('#emptyProducts');
const productCount = $('#productCount');
const search = $('#search');
const categoryFilter = $('#categoryFilter');
const priceFilter = $('#priceFilter');
const aiForm = $('#aiForm');
const aiResult = $('#aiResult');
const quoteForm = $('#quoteForm');
const quoteStatus = $('#quoteStatus');
const savedQuote = $('#savedQuote');
const dialog = $('#productDialog');
const dialogContent = $('#dialogContent');

function formatFcfa(value) {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

function renderGallery() {
  gallery.innerHTML = galleryItems.map(item => `
    <article class="gallery-item glass">
      <img src="${item.img}" alt="${item.title}" loading="lazy" />
      <h3>${item.title}</h3>
    </article>`).join('');
}

function withinPrice(price, filter) {
  if (filter === 'low') return price <= 1000000;
  if (filter === 'mid') return price > 1000000 && price <= 3000000;
  if (filter === 'high') return price > 3000000;
  return true;
}

function getFilteredProducts() {
  const text = search.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const priceRange = priceFilter.value;
  return products.filter(product =>
    product.name.toLowerCase().includes(text) &&
    (category === 'all' || product.category === category) &&
    withinPrice(product.price, priceRange)
  );
}

function renderProducts() {
  const filtered = getFilteredProducts();
  productCount.textContent = `${filtered.length} produit${filtered.length > 1 ? 's' : ''}`;
  emptyProducts.hidden = filtered.length !== 0;
  productList.innerHTML = filtered.map(product => `
    <article class="product-card glass">
      <img src="${product.img}" alt="${product.name}" loading="lazy" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <strong>${formatFcfa(product.price)}</strong>
      <p><small>${product.options}</small></p>
      <div class="product-actions">
        <button class="btn btn-glass" type="button" data-details="${product.id}">Détails</button>
        <a href="#devis" class="btn btn-primary">Demander un devis</a>
      </div>
    </article>`).join('');
}

function openDetails(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  dialogContent.innerHTML = `
    <img src="${product.img}" alt="${product.name}" />
    <span class="eyebrow">${product.category.replace('-', ' ')}</span>
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p><strong>Prix indicatif :</strong> ${formatFcfa(product.price)}</p>
    <p><strong>Options :</strong> ${product.options}</p>
    <a href="#devis" class="btn btn-primary" id="dialogQuote">Demander un devis</a>
  `;
  dialog.showModal();
  $('#dialogQuote')?.addEventListener('click', () => dialog.close());
}

productList.addEventListener('click', event => {
  const button = event.target.closest('[data-details]');
  if (button) openDetails(Number(button.dataset.details));
});

[search, categoryFilter, priceFilter].forEach(el => el.addEventListener('input', renderProducts));
$('#resetFilters').addEventListener('click', () => {
  search.value = '';
  categoryFilter.value = 'all';
  priceFilter.value = 'all';
  renderProducts();
});

async function getImageInsights(file) {
  if (!file) return 'Aucune photo fournie : la recommandation repose sur vos réponses.';
  if (!file.type.startsWith('image/')) return 'Le fichier sélectionné n’est pas une image.';
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = 50; canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 50, 50);
  const pixels = ctx.getImageData(0, 0, 50, 50).data;
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) total += (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
  const brightness = total / (pixels.length / 4);
  const orientation = img.width > img.height ? 'horizontale' : img.width < img.height ? 'verticale' : 'carrée';
  return `Photo ${orientation} détectée, luminosité ${brightness > 120 ? 'élevée' : 'modérée/faible'}.`;
}

aiForm.addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(aiForm);
  const budget = Number(form.get('budget'));
  const style = form.get('style');
  const space = form.get('space');
  const homeType = form.get('homeType');
  const imageFile = $('#projectImage').files[0];
  aiResult.innerHTML = '<div class="glass"><p>Analyse en cours...</p></div>';
  const insight = await getImageInsights(imageFile);

  const recommended = products.map(product => {
    let score = 0;
    if (budget >= product.price) score += 2;
    if (style === 'Minimaliste' && product.category !== 'vitrine') score += 2;
    if (style === 'Luxe' && product.price >= 2000000) score += 2;
    if (space === 'Petit' && product.category === 'fenetre') score += 2;
    if (space === 'Grand' && product.category === 'balcon') score += 2;
    if (homeType === 'Appartement' && product.category === 'garde-corps') score += 1;
    return {...product, score};
  }).sort((a,b) => b.score - a.score).slice(0,2);

  aiResult.innerHTML = `
    <article class="glass"><span class="eyebrow">ANALYSE</span><h3>Votre profil</h3><p>${homeType}, espace ${space.toLowerCase()}, style ${style.toLowerCase()}, budget ${formatFcfa(budget)}.</p><p>${insight}</p></article>
    ${recommended.map(item => `<article class="glass"><span class="eyebrow">SUGGESTION</span><h3>${item.name}</h3><p>${item.description}</p><strong>${formatFcfa(item.price)}</strong></article>`).join('')}
  `;
});

function saveQuote() {
  const quote = {
    name: $('#quoteName').value.trim(),
    phone: $('#quotePhone').value.trim(),
    email: $('#quoteEmail').value.trim(),
    message: $('#quoteMessage').value.trim(),
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('vitrier_last_quote', JSON.stringify(quote));
  return quote;
}

function renderSavedQuote() {
  const raw = localStorage.getItem('vitrier_last_quote');
  if (!raw) return;
  try {
    const quote = JSON.parse(raw);
    savedQuote.hidden = false;
    savedQuote.innerHTML = `<strong>Dernière demande enregistrée</strong><p>${quote.name} • ${quote.phone}</p><small>${new Date(quote.createdAt).toLocaleString('fr-FR')}</small>`;
  } catch {
    localStorage.removeItem('vitrier_last_quote');
  }
}

quoteForm.addEventListener('submit', event => {
  event.preventDefault();
  saveQuote();
  quoteStatus.textContent = 'Demande enregistrée sur cet appareil.';
  renderSavedQuote();
  quoteForm.reset();
});

$('#closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
$('.menu-btn').addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  $('.menu-btn').setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  $('.menu-btn').setAttribute('aria-expanded','false');
}));
$('#year').textContent = new Date().getFullYear();

renderGallery();
renderProducts();
renderSavedQuote();
