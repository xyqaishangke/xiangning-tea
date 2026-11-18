const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');

function toggleMenu(expanded) {
  menu.setAttribute('aria-expanded', String(expanded));
  menu.querySelector('span').textContent = expanded ? '×' : '☰';
}

header.classList.add('enhanced');
menu.hidden = false;
menu.addEventListener('click', () => toggleMenu(menu.getAttribute('aria-expanded') === 'false'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    toggleMenu(false);
    menu.focus();
  }
});

const tabs = document.querySelector('.tabs');
const filters = [...tabs.querySelectorAll('[data-filter]')];
const products = [...document.querySelectorAll('.product-card')];
const catalogCount = document.querySelector('.catalog-count');

function setFilter(category) {
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  products.forEach(product => {
    product.hidden = category !== 'all' && product.dataset.type !== category;
  });
  const count = products.filter(product => !product.hidden).length;
  const label = filters.find(button => button.dataset.filter === category).textContent;
  catalogCount.textContent = category === 'all' ? `共 ${count} 款` : `${count} 款${label}`;
}

tabs.hidden = false;
catalogCount.hidden = false;
setFilter('all');
filters.forEach(filter => {
  filter.addEventListener('click', () => setFilter(filter.dataset.filter));
});
document.querySelectorAll('[data-start-filter]').forEach(link => {
  link.addEventListener('click', () => setFilter(link.dataset.startFilter));
});

const dialog = document.querySelector('#tea-dialog');
const title = document.querySelector('#dialog-title');
const photo = document.querySelector('#dialog-photo');
const caption = document.querySelector('#dialog-caption');
const galleryCount = document.querySelector('#dialog-count');
const photoButtons = [...document.querySelectorAll('.product-open')];
let gallery = [];
let activePhoto = 0;

function showPhoto() {
  const button = gallery[activePhoto];
  title.textContent = button.querySelector('.product-title').textContent;
  caption.textContent = button.closest('.product-card').querySelector('.product-copy').textContent;
  photo.alt = button.querySelector('img').alt;
  photo.src = button.dataset.photo;
  galleryCount.textContent = `${activePhoto + 1} / ${gallery.length}`;
}

function movePhoto(step) {
  activePhoto = (activePhoto + step + gallery.length) % gallery.length;
  showPhoto();
}

photoButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') {
      window.location.assign(button.dataset.photo);
      return;
    }
    gallery = photoButtons.filter(item => !item.closest('.product-card').hidden);
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
