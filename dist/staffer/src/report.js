const breadcrumb = document.querySelector('.breadcrumb');
const portLandBtn = document.querySelector('#port-land');
breadcrumb.querySelector('span>button').onclick = function(){breadcrumb.classList.toggle('on')};
// portrait-landscape btn
portLandBtn.onclick = function(){this.parentElement.classList.toggle('on')}
