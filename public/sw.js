if(!self.define){let e,s={};const n=(n,t)=>(n=new URL(n+".js",t).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(t,a)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const r=e=>n(e,i),f={module:{uri:i},exports:c,require:r};s[i]=Promise.all(t.map((e=>f[e]||r(e)))).then((e=>(a(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"339fad08f270e260d1db92718b46204a"},{url:"/_next/static/chunks/187-4f795a5b6abe6049.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/251-6c026f5010d036d5.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/548-a1258101d426e8c3.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/586-f33a8b5a535b9514.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/656.d83a505a3566d0de.js",revision:"d83a505a3566d0de"},{url:"/_next/static/chunks/666-9e4e17c029436c45.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/687-8c19487442036f82.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/696-135eaa8c9754c963.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/72-531624040a23c88f.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/864-6d63284790e30087.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/878-326945b79e7074e9.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/985-0c077b13610f4bf7.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/_not-found-065e33cf6f77e327.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/admin/page-c73062721d4ba85b.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/dashboard/page-75dffc25d9cacbd8.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/forms/page-f4464ae4c40c03c9.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/layout-c619e1d8b97437a0.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/onboarding/page-8a5c22ed017d9385.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/page-5073556480194480.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/app/referral/%5Bcode%5D/page-afe2d34091ee2a0e.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/fd9d1056-1b0718e87ed5f428.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/framework-43665103d101a22d.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/main-01c2e6f4326553ae.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/main-app-90812b4c55e31bf6.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/pages/_app-6ca4a4ec31e39f3d.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/pages/_error-9de0d1f4f4d1fcb4.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-f2d0722b77bed316.js",revision:"h1K0AfSC5NgFOUn_TFp8A"},{url:"/_next/static/css/e7eddfe4828c1690.css",revision:"e7eddfe4828c1690"},{url:"/_next/static/css/f0fe841249bcaa71.css",revision:"f0fe841249bcaa71"},{url:"/_next/static/h1K0AfSC5NgFOUn_TFp8A/_buildManifest.js",revision:"d7af164afef0e5b53876e60fab863dba"},{url:"/_next/static/h1K0AfSC5NgFOUn_TFp8A/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/icon.ico",revision:"85156ca7b0586adc32606c95ff618efe"},{url:"/manifest.json",revision:"263aebce8eb2fd615f086d78c2536216"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
