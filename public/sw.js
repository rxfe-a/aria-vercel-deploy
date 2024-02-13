importScripts('/dynamic/dynamic.config.js');
importScripts('/dynamic/dynamic.worker.js');
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(__uv$config.sw || '/uv/uv.sw.js');

const uv = new UVServiceWorker();
const dynamic = new Dynamic();
self.dynamic = dynamic;

self.addEventListener('fetch',
    event => {
        event.respondWith(
            (async function() {
                if (await dynamic.route(event)) {
                    return await dynamic.fetch(event);
                }

                if (event.request.url.startsWith(location.origin + "/uv/service/")) {
                    return await uv.fetch(event);
                }
            })()
        );
    }
);


function unregister() {

navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
        if (registration.active.scriptURL.includes('/sw.js')) {
            registration.unregister();
        }
    });
});


}