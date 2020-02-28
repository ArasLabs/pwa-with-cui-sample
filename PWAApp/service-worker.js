const CACHE_NAME = 'cui-manager-static-cache';
const DATA_CACHE_NAME  = 'cui-manager-data-cache';

const FILES_TO_CACHE = [
    '/',
    'manifest.json',
    'favicon.ico',
    'index.html',
    'offline.html',
    'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
    'styles/style.css',
    'scripts/app.js',
    'scripts/httpRequestManager.js',
    'scripts/loginManager.js',
    'scripts/ThirdParty/md5.min.js',
    'scripts/Models/account.js',
    'scripts/Models/activity.js',
    'scripts/Models/activityAssignment.js',
    'scripts/Models/activityTask.js',
    'scripts/Models/activityTaskValue.js',
    'scripts/Models/activityVariable.js',
    'scripts/Models/commandBarItem.js',
    'scripts/Models/commandBarSection.js',
    'scripts/Models/commandBarSectionItem.js',
    'scripts/Models/myInBasketItem.js',
    'scripts/Models/myInBasketWorkItem.js',
    'scripts/Models/workflowProcessPath.js',
    'scripts/Components/component.js',
    'scripts/Components/gridContentComponent.js',
    'scripts/Components/myInBasketItemComponent.js',
    'scripts/Components/myInBasketItemPage.js',
    'scripts/Binders/addNewItemModalBinder.js',
    'scripts/Binders/loginModalBinder.js',
    'scripts/Binders/modalBinder.js',
    'scripts/Binders/removeItemModalBinder.js',
    'scripts/Binders/updateItemModalBinder.js',
    'scripts/Binders/workflowActivityCompletionModalBinder.js',
    'scripts/Helpers/cuiManager.js',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
    'images/icons/icon-16x16.png',
    'images/icons/icon-32x32.png',
    'images/icons/icon-48x48.png',
    'images/icons/icon-64x64.png',
    'images/icons/icon-144x144.png',
    'images/icons/icon-256x256.png',
    'images/aras-innovator.svg'
];

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    // Speeds up service worker activation to prevent getting old data from cache
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request).then(response => {
            //if (response && !navigator.onLine) { // for real world
            if (response) {
                console.log('Found ', event.request.url, ' in cache');
                return response;
            }

            console.log('Network request for ', event.request.url);
            return fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            });
  
        }).catch(error => {
            console.error('Error, ', error);
            return caches.match('offline.html');  
        })
    );
});