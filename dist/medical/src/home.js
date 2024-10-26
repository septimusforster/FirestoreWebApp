// const APP = {
//     cacheName: 'pgs',
//     cacheResource: null,
//     init () {
//         APP.startCache();
//     },
//     startCache () {
//         return caches.open(APP.cacheName).then(cache => {
//             console.log("Cache name '" + APP.cacheName + "' opened.");
//             let urlStr = "../public/pharmacy.html";
//             cache.add(urlStr);  //add = fetch + put

//             // let url = new URL('/dist/medical/public/pharmacy.html?id=1', 'http://127.0.0.1:51442');
//             // cache.add(url);

//             // let req = new Request("../public/pharmacy.html?id=2");
//             // cache.add(req);

//             // cache.keys().then(keys => {
//             //     keys.forEach((key, index) => {
//             //         console.log(index, '==', key);
//             //     });
//             // });
//             return cache;
//         }).then(cache => {
//             //check if cache exists
//             caches.has(APP.cacheName).then(hasCache => {
//                 console.log(`${APP.cacheName} exists: ${hasCache}.`);
//             });

//             //search for files in caches
//             //cache.match() cache.matchAll()
//             let url = "../public/pharmacy.html#h02";
//             return caches.match(url).then(cacheResponse => {
//                 if (cacheResponse &&
//                     cacheResponse.status < 400 &&
//                     cacheResponse.headers.has('content-type') &&
//                     cacheResponse.headers.get('content-type').match(/^text\//i)) {
//                         console.log('CACHERESPONSE');
//                         return cacheResponse;
//                 } else {
//                     return fetch(url).then(fetchResponse => {
//                         if (!fetchResponse.ok) throw fetchResponse.statusText;
//                         //we have a valid fetch
//                         console.log('FETCHRESPONSE');
//                         cache.put(url, fetchResponse.clone());   //put = add w/o fetch
//                         return fetchResponse;
//                     });
//                 }
//             });
//         }).then(response => {
//             // console.log(response);
//             document.querySelector('main > iframe').src = response.url;
//             // const ttls = document.querySelector('.ttl');
//             // ttls.onclick = function () {
//             //     document.querySelector('iframe').src = response.url#;
//             // }
//         });
//     },
//     deleteCache () {
//         // caches.open(this.cacheName).then(cache => {
//         //     //delete a response from a cache
//         //     let url = '/dist/medical/public/pharmacy.html?id=1';
//         //     cache.delete(url).then(isDeleted => {
//         //         console.log(isDeleted);
//         //     });
//         // });

//         //delete entire cache
//         caches.delete(this.cacheName).then(isDeletedAll => {
//             console.log(isDeletedAll);
//         });
//     }
// }

// const clinicNM = document.getElementsByClassName('clinic_nm')[0];
// clinicNM.addEventListener('click', () => APP.deleteCache());
const iframe = document.querySelector('iframe');
const APP = {
    cacheName: 'pgs',
    async init () {
        await APP.startCache();
    },
    async startCache () {
        await caches.has(this.cacheName).then(async hasCache => {
            console.log("Has cache:", hasCache);
            if (!hasCache) {
                await caches.open(this.cacheName).then(cache => {
                    let files = ['pharmacy.html', '../styles/pharmacy.css'];
                    let urls = files.map(url => {
                        const u = new URL(url, location.href).pathname;
                        return u;
                        // return new Request(url);
                    });
                    cache.addAll(urls);
                    console.log(urls.length, "resources added to cache.");
                });
            }
        })
    },
    async openCache (req) {
        caches.has(this.cacheName).then(hasCache => {
            if (hasCache) {
                return caches.open(this.cacheName).then(cache => {
                    cache.match(req).then(res => {
                        if (res && res.ok) {
                            console.log("File from cache.");
                            return res.url;
                        } else {
                            return 0;
                        }
                    });
                });
            }
        });
    },
}

document.addEventListener('DOMContentLoaded', APP.init);

const loader = document.querySelector('.loader');
const dashBtns = document.querySelectorAll('.actions > div.btn');

dashBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const href= btn.dataset.href;
        const src = iframe.src;
        const url = src.slice(src.lastIndexOf('/')+1);
        if (href && href != url) {
            dashBtns.forEach(obtn => obtn.classList.toggle('on', btn == obtn));
            loader.classList.add('on');
            const id = setTimeout(async() => {
                clearTimeout(id);
                iframe.src = await APP.openCache('yom' + href) || href;
            }, 2000);
        }
    });
});
// const txt = document.createTextNode('a text node');
// const txt = 'a text node';
// document.querySelector('.usr').insertAdjacentText('afterbegin', txt);