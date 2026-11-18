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
const products = document.querySelectorAll('.product-card');
tabs.hidden = false;
filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    products.forEach(product => {
      product.hidden = filter.dataset.filter !== 'all' && product.dataset.type !== filter.dataset.filter;
    });
  });
});

const dialog = document.querySelector('#tea-dialog');
const title = document.querySelector('#dialog-title');
const photo = document.querySelector('#dialog-photo');

document.querySelectorAll('.product-open').forEach(button => {
  button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') {
      window.location.assign(button.dataset.photo);
      return;
    }
    title.textContent = button.querySelector('.product-title').textContent;
    photo.alt = button.querySelector('img').alt;
    photo.src = button.dataset.photo;
    dialog.showModal();
  });
});

dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
