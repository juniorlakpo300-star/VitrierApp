const galleryItems = [
  {
    title: 'Fenêtre panoramique noire',
    category: 'fenetre',
    img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Balcon verre transparent',
    category: 'balcon',
    img: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Vitrine commerciale premium',
    category: 'vitrine',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Escalier garde-corps moderne',
    category: 'garde-corps',
    img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
  },
];

const products = [
  {
    id: 1,
    name: 'Fenêtre Luxe Thermique',
    category: 'fenetre',
    price: 850000,
    options: 'Double vitrage, cadre aluminium noir',
    description: 'Isolation thermique performante et style minimaliste.',
    img: galleryItems[0].img,
  },
  {
    id: 2,
    name: 'Balcon SkyGlass',
    category: 'balcon',
    price: 3200000,
    options: 'Verre feuilleté sécurité, finition dorée',
    description: 'Balcon contemporain avec haute transparence.',
    img: galleryItems[1].img,
  },
  {
    id: 3,
    name: 'Vitrine Pro Secure',
    category: 'vitrine',
    price: 2400000,
    options: 'Anti-effraction, traitement anti-UV',
    description: 'Parfait pour boutiques et espaces commerciaux.',
    img: galleryItems[2].img,
  },
  {
    id: 4,
    name: 'Garde-corps Crystal Line',
    category: 'garde-corps',
    price: 1800000,
    options: 'Verre trempé 10 mm, fixation inox',
    description: 'Sécurité et élégance pour escaliers et terrasses.',
    img: galleryItems[3].img,
  },
];

const gallery = document.getElementById('gallery');
const productList = document.getElementById('productList');
const search = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const aiForm = document.getElementById('aiForm');
const aiResult = document.getElementById('aiResult');
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
const quoteForm = document.getElementById('quoteForm');
const dialog = document.getElementById('productDialog');
const dialogContent = document.getElementById('dialogContent');

menuBtn.addEventListener('click', () => nav.classList.toggle('open'));

document.getElementById('closeDialog').addEventListener('click', () => dialog.close());

function formatFcfa(value) {
  return `${Number(value).toLocaleString('fr-FR')} FCFA`;
}

function renderGallery() {
  gallery.innerHTML = galleryItems
    .map(
      (item) => `
        <article class="gallery-item glass">
          <img src="${item.img}" alt="${item.title}" loading="lazy" />
          <h3>${item.title}</h3>
        </article>
      `,
    )
    .join('');
}

function withinPrice(price, filter) {
  if (filter === 'low') return price <= 1000000;
  if (filter === 'mid') return price > 1000000 && price <= 3000000;
  if (filter === 'high') return price > 3000000;
  return true;
}

function renderProducts() {
  const text = search.value.toLowerCase().trim();
  const category = categoryFilter.value;
  const priceRange = priceFilter.value;

  const filtered = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(text);
    const matchCategory = category === 'all' || product.category === category;
    const matchPrice = withinPrice(product.price, priceRange);
    return matchSearch && matchCategory && matchPrice;
  });

  productList.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card glass">
          <img src="${product.img}" alt="${product.name}" loading="lazy" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <strong>${formatFcfa(product.price)}</strong>
          <p><small>${product.options}</small></p>
          <div class="hero-actions">
            <button class="btn btn-glass" onclick="openDetails(${product.id})">Voir détail</button>
            <a href="#devis" class="btn btn-primary">Demander un devis</a>
          </div>
        </article>
      `,
    )
    .join('');
}

window.openDetails = function openDetails(id) {
  const p = products.find((prod) => prod.id === id);
  if (!p) return;
  dialogContent.innerHTML = `
    <img src="${p.img}" alt="${p.name}" />
    <h3>${p.name}</h3>
    <p>${p.description}</p>
    <p><strong>Prix:</strong> ${formatFcfa(p.price)}</p>
    <p><strong>Options:</strong> ${p.options}</p>
    <a href="#devis" class="btn btn-primary">Demander un devis</a>
  `;
  dialog.showModal();
};

[search, categoryFilter, priceFilter].forEach((el) => el.addEventListener('input', renderProducts));

async function getImageInsights(file) {
  if (!file) return 'Aucune image fournie : recommandations basées sur vos réponses.';

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 50, 50);
  const pixels = ctx.getImageData(0, 0, 50, 50).data;

  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    total += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  }
  const avgBrightness = total / (pixels.length / 4);
  const orientation = img.width > img.height ? 'horizontale' : 'verticale';
  const light = avgBrightness > 120 ? 'lumineux' : 'plus fermé';

  return `Image ${orientation} détectée, espace ${light}. Priorité à des solutions transparentes et sécurisées.`;
}

aiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(aiForm);
  const budget = Number(formData.get('budget'));
  const style = formData.get('style');
  const space = formData.get('space');
  const homeType = formData.get('homeType');
  const imageFile = document.getElementById('projectImage').files[0];

  const insight = await getImageInsights(imageFile);

  const recommended = products
    .map((product) => {
      let score = 0;
      if (budget >= product.price) score += 2;
      if (style === 'Minimaliste' && product.category !== 'vitrine') score += 2;
      if (style === 'Luxe' && product.price >= 2000000) score += 2;
      if (space === 'Petit' && product.category === 'fenetre') score += 2;
      if (space === 'Grand' && product.category === 'balcon') score += 2;
      if (homeType === 'Appartement' && product.category === 'garde-corps') score += 1;
      return { ...product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  aiResult.innerHTML = `
    <article class="glass">
      <h3>Analyse IA</h3>
      <p>${insight}</p>
      <p><strong>Profil:</strong> ${homeType}, espace ${space.toLowerCase()}, style ${style.toLowerCase()}, budget ${formatFcfa(budget)}.</p>
    </article>
    ${recommended
      .map(
        (item) => `
      <article class="glass">
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <strong>${formatFcfa(item.price)}</strong>
      </article>
    `,
      )
      .join('')}
  `;
});

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Merci ! Votre demande de devis a été envoyée. Nous vous contactons rapidement.');
  quoteForm.reset();
});

renderGallery();
renderProducts();
