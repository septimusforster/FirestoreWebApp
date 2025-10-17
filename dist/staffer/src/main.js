//logout
document.querySelector('button#logout').onclick = function(){
    sessionStorage.removeItem('snapshotId');
    const homeURL = new URL('dist/login-cat.html', window.location.origin);
    location.replace(homeURL);
}