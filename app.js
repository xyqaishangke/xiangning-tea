const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '收起导航' : '展开导航'); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {nav.classList.remove('open'); menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','展开导航');}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => { const selected = b === button; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', String(selected)); });
  document.querySelectorAll('.tea-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter; });
}));
document.querySelectorAll('.guide button').forEach(button => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true'; button.setAttribute('aria-expanded', String(!expanded)); document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;button.querySelector('b').textContent = expanded ? '+' : '−';
}));
const dialog = document.querySelector('#tea-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogPhoto = document.querySelector('#dialog-photo');

document.querySelectorAll('.product-open').forEach(button => {
  button.addEventListener('click', () => {
    const thumbnail = button.querySelector('img');
    dialogTitle.textContent = button.querySelector('.product-title').textContent;
    dialogPhoto.alt = thumbnail.alt;
    dialogPhoto.src = button.dataset.photo;
    dialog.showModal();
  });
});

dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});
