const APP = {
    cacheName: 'pgs',
    init () {
        APP.startCache();
    },
    startCache () {
        return caches.open(APP.cacheName).then(cache => {
            console.log("Cache name '" + APP.cacheName + "' opened.");
            let urlStr = "../public/pharmacy.html";
            cache.add(urlStr);  //add = fetch + put

            // let url = new URL('/dist/medical/public/pharmacy.html?id=1', 'http://127.0.0.1:51442');
            // cache.add(url);

            // let req = new Request("../public/pharmacy.html?id=2");
            // cache.add(req);

            // cache.keys().then(keys => {
            //     keys.forEach((key, index) => {
            //         console.log(index, '==', key);
            //     });
            // });
            return cache;
        }).then(cache => {
            //check if cache exists
            caches.has(APP.cacheName).then(hasCache => {
                console.log(`${APP.cacheName} exists: ${hasCache}.`);
            });

            //search for files in caches
            //cache.match() cache.matchAll()
            let url = "../public/pharmacy.html#h02";
            return caches.match(url).then(cacheResponse => {
                if (cacheResponse &&
                    cacheResponse.status < 400 &&
                    cacheResponse.headers.has('content-type') &&
                    cacheResponse.headers.get('content-type').match(/^text\//i)) {
                        console.log('CACHERESPONSE');
                        return cacheResponse;
                } else {
                    return fetch(url).then(fetchResponse => {
                        if (!fetchResponse.ok) throw fetchResponse.statusText;
                        //we have a valid fetch
                        console.log('FETCHRESPONSE');
                        cache.put(url, fetchResponse.clone());   //put = add w/o fetch
                        return fetchResponse;
                    });
                }
            });
        }).then(response => {
            // console.log(response);
            document.querySelector('main > iframe').src = response.url;
            // const ttls = document.querySelector('.ttl');
            // ttls.onclick = function () {
            //     document.querySelector('iframe').src = response.url#;
            // }
        });
    },
    deleteCache () {
        // caches.open(this.cacheName).then(cache => {
        //     //delete a response from a cache
        //     let url = '/dist/medical/public/pharmacy.html?id=1';
        //     cache.delete(url).then(isDeleted => {
        //         console.log(isDeleted);
        //     });
        // });

        //delete entire cache
        caches.delete(this.cacheName).then(isDeletedAll => {
            console.log(isDeletedAll);
        });
    }
}

const clinicNM = document.getElementsByClassName('clinic_nm')[0];
clinicNM.addEventListener('click', () => APP.deleteCache());

document.addEventListener('DOMContentLoaded', APP.init);