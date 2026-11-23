const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');

function toggleMenu(expanded) {
  if (menu.getAttribute('aria-expanded') === String(expanded)) return;
  menu.setAttribute('aria-expanded', String(expanded));
  menu.firstChild.textContent = expanded ? '关闭菜单 ' : '菜单 ';
  menu.querySelector('span').textContent = expanded ? '×' : '☰';
}

header.classList.add('enhanced');
menu.hidden = false;
menu.addEventListener('click', () => toggleMenu(menu.getAttribute('aria-expanded') === 'false'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (menu.getAttribute('aria-expanded') === 'true') {
    const section = document.querySelector(link.hash);
    if (section) section.setAttribute('tabindex', '-1');
  }
  toggleMenu(false);
}));
document.addEventListener('click', event => {
  if (!header.contains(event.target)) toggleMenu(false);
});
header.addEventListener('focusout', event => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) toggleMenu(false);
});
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    toggleMenu(false);
    menu.focus();
  }
});

const tabs = document.querySelector('.tabs');
const tools = document.querySelector('.catalog-tools');
const filters = [...tabs.querySelectorAll('[data-filter]')];
const products = [...document.querySelectorAll('.product-card')];
const catalogCount = document.querySelector('.catalog-count');
const catalogQuery = document.querySelector('#catalog-query');
const catalogClear = document.querySelector('.catalog-clear');
const catalogEmpty = document.querySelector('.catalog-empty');
const catalogActions = document.querySelector('.catalog-actions');
const more = catalogActions.querySelector('button');
const increment = 12;
let category = 'all';
let limit = increment;
let matching = [];

function normalize(text) {
  return text.toLowerCase().normalize('NFKC').replace(/\s+/g, '');
}

const searchText = new Map(products.map(product => [product, normalize(product.textContent)]));

function renderCatalog() {
  const terms = catalogQuery.value.trim().split(/\s+/).filter(Boolean).map(normalize);
  catalogClear.hidden = catalogQuery.value.length === 0;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  matching = products.filter(product => (
    (category === 'all' || product.dataset.type.split(' ').includes(category))
    && terms.every(term => searchText.get(product).includes(term))
  ));
  const visible = new Set(matching.slice(0, limit));
  products.forEach(product => { product.hidden = !visible.has(product); });
  catalogCount.textContent = matching.length > limit
    ? `已展示 ${limit} / ${matching.length} 款`
    : `共 ${matching.length} 款`;
  catalogEmpty.hidden = matching.length !== 0;
  catalogActions.hidden = matching.length <= limit;
}

function setFilter(value) {
  category = value;
  limit = increment;
  renderCatalog();
}

document.documentElement.classList.add('catalog-enhanced');
tools.hidden = false;
renderCatalog();
function revealLinkedProduct() {
  const product = products.find(item => `#product-${item.dataset.product}` === location.hash);
  if (!product) return;
  if (product.hidden) {
    category = 'all';
    catalogQuery.value = '';
    limit = Math.ceil((products.indexOf(product) + 1) / increment) * increment;
    renderCatalog();
  }
  product.querySelector('.product-detail').scrollIntoView();
}
revealLinkedProduct();
window.addEventListener('hashchange', revealLinkedProduct);
filters.forEach(filter => filter.addEventListener('click', () => setFilter(filter.dataset.filter)));
document.querySelectorAll('[data-start-filter]').forEach(link => link.addEventListener('click', () => {
  catalogQuery.value = '';
  setFilter(link.dataset.startFilter);
}));
catalogQuery.addEventListener('input', () => { limit = increment; renderCatalog(); });
catalogClear.addEventListener('click', () => {
  catalogQuery.value = '';
  limit = increment;
  catalogQuery.focus();
  renderCatalog();
});
catalogEmpty.querySelector('.catalog-reset').addEventListener('click', () => {
  catalogQuery.value = '';
  catalogQuery.focus();
  setFilter('all');
});
catalogQuery.form.addEventListener('submit', event => event.preventDefault());
more.addEventListener('click', () => {
  const firstNew = matching[limit];
  limit += increment;
  renderCatalog();
  firstNew?.querySelector('.product-open').focus();
});

const dialog = document.querySelector('#tea-dialog');
const title = document.querySelector('#dialog-title');
const photo = document.querySelector('#dialog-photo');
const detail = document.querySelector('#dialog-detail');
const galleryCount = document.querySelector('#dialog-count');
const photoButtons = [...document.querySelectorAll('.product-open')];
let gallery = [];
let activePhoto = 0;

function showPhoto() {
  const button = gallery[activePhoto];
  title.textContent = button.querySelector('.product-title').textContent;
  const source = button.closest('.product-card').querySelector('.product-detail');
  const specs = source.querySelector('.product-specs')?.cloneNode(true);
  const notes = [...source.children].filter(item => !item.matches('.product-specs'));
  detail.replaceChildren(...(specs ? [specs] : []), ...notes.map(item => item.cloneNode(true)));
  photo.alt = button.querySelector('img').alt;
  photo.src = button.dataset.photo;
  galleryCount.textContent = `${activePhoto + 1} / ${gallery.length}`;
  dialog.querySelectorAll('[data-photo-step]').forEach(control => { control.disabled = gallery.length < 2; });
  dialog.scrollTop = 0;
}

function movePhoto(step) {
  activePhoto = (activePhoto + step + gallery.length) % gallery.length;
  showPhoto();
}

photoButtons.forEach(button => {
  if (typeof dialog.showModal !== 'function') {
    document.documentElement.classList.remove('catalog-enhanced');
    return;
  }
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    gallery = matching.map(item => item.querySelector('.product-open'));
    activePhoto = gallery.indexOf(button);
    showPhoto();
    dialog.showModal();
  });
});

dialog.querySelectorAll('[data-photo-step]').forEach(button => {
  button.addEventListener('click', () => movePhoto(Number(button.dataset.photoStep)));
});
dialog.addEventListener('keydown', event => {
  const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (step !== undefined) {
    event.preventDefault();
    movePhoto(step);
  }
});

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

const archiveDialog = document.querySelector('#archive-dialog');
if (typeof archiveDialog?.showModal === 'function') {
  const archivePhoto = archiveDialog.querySelector('img');
  const archiveCaption = archiveDialog.querySelector('figcaption');
  const archiveCount = archiveDialog.querySelector('#archive-dialog-count');
  let photos = [];
  let active = 0;
  function showArchivePhoto(index) {
    active = (index + photos.length) % photos.length;
    const link = photos[active];
    archivePhoto.src = link.href;
    archiveCaption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    archiveCount.textContent = `第 ${active + 1} 张，共 ${photos.length} 张`;
    archiveDialog.scrollTop = 0;
  }
  document.querySelectorAll('.archive-photo a').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      photos = [...link.closest('.archive-group').querySelectorAll('.archive-photo a')];
      showArchivePhoto(photos.indexOf(link));
      archiveDialog.showModal();
    });
  });
  archiveDialog.querySelectorAll('[data-archive-step]').forEach(button => {
    button.addEventListener('click', () => showArchivePhoto(active + Number(button.dataset.archiveStep)));
  });
  archiveDialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showArchivePhoto(active + (event.key === 'ArrowLeft' ? -1 : 1));
  });
}
