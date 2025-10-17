const breadcrumb = document.querySelector('.breadcrumb');
breadcrumb.querySelector('span>button').onclick = function(){breadcrumb.classList.toggle('on')};
document.querySelector('.cdk-overlay-backdrop').addEventListener('click', (e) => breadcrumb.classList.remove('on'));