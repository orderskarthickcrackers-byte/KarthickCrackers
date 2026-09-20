import{t as n}from"./chunk-B46hjKzx.js";import{B as li,k as ai,r as D$1,t as Ae,u as It,w as Xn,x as V}from"./chunk-B5B5ceLM.js";import{$ as ab,At as p$1,Bt as xT,E as K,F as Qe,G as Xs,Gt as y_,Ht as xe,Jt as zt,Kt as ym,O as Ks,P as Ph,Pt as sd,R as Sm,S as IT,U as Vv,Ut as xs,Vt as xb,W as Ww,X as Zw,_ as GI,bt as kb,c as Dg,et as ad,ft as hm,gt as j$1,ht as id,i as BS,jt as pm,kt as oc,lt as ed,nt as b,ot as dm,q as Zo,qt as yv,s as D_,tt as at,u as Ef,ut as g_,x as I,xt as kh,yt as kT,zt as wm}from"./chunk-ChqTI1Fy.js";var p=class r{constructor(e,t){this.http=e;this.router=t}http;router;TOKEN_KEY=`kc_admin_token`;USER_KEY=`kc_admin_user`;API_URL=`${n.apiUrl}/auth`;currentUser=K(this.getStoredUser());token=K(this.getStoredToken());login(e){return this.http.post(`${this.API_URL}/login`,e).pipe(Xn({next:t=>{t&&t.token&&this.setSession(t)},error:t=>{console.error(`AuthService login error:`,t)}}))}logout(){localStorage.removeItem(this.TOKEN_KEY),localStorage.removeItem(this.USER_KEY),this.token.set(null),this.currentUser.set(null),this.router.navigate([`/admin/login`])}getToken(){return this.token()||localStorage.getItem(this.TOKEN_KEY)}isAuthenticated(){return!!this.getToken()}getMe(){return this.http.get(`${this.API_URL}/me`)}setSession(e){let t={userId:e.userId,email:e.email,role:e.role};localStorage.setItem(this.TOKEN_KEY,e.token),localStorage.setItem(this.USER_KEY,JSON.stringify(t)),this.token.set(e.token),this.currentUser.set(t)}getStoredToken(){return localStorage.getItem(this.TOKEN_KEY)}getStoredUser(){let e=localStorage.getItem(this.USER_KEY);if(!e)return null;try{return JSON.parse(e)}catch{return null}}static ɵfac=function(t){return new(t||r)(I(Vv),I(at))};static ɵprov=b({token:r,factory:r.ɵfac,providedIn:`root`})};var d=class a{http=p$1(Vv);apiUrl=`${n.apiUrl}`;callNumberSignal=K(`+91 6380891094`);upiIdSignal=K(`9952378965@upi`);upiQrCodeUrlSignal=K(`assets/images/upi-qr.png`);cleanPhoneSignal=Zo(()=>{let t=this.callNumberSignal().replace(/\D/g,``);return t.length===10?`91${t}`:t.startsWith(`91`)&&t.length===12?t:t||`916380891094`});displayPhoneSignal=Zo(()=>{let t=this.callNumberSignal().trim();if(t.includes(` `))return t;let e=t.replace(/\D/g,``),i=e.startsWith(`91`)&&e.length===12?e.substring(2):e;return i.length===10?`+91 ${i.substring(0,5)} ${i.substring(5)}`:t||`+91 6380891094`});constructor(){this.refreshSettings()}updateState(t){t&&(t.callNumber&&this.callNumberSignal.set(t.callNumber),t.upiId&&this.upiIdSignal.set(t.upiId),t.upiQrCodeUrl&&this.upiQrCodeUrlSignal.set(t.upiQrCodeUrl))}refreshSettings(){this.getPublicPaymentSettings().subscribe({next:t=>this.updateState(t),error:()=>{}})}getPublicPaymentSettings(){return this.http.get(`${this.apiUrl}/settings/payment`).pipe(Xn(t=>this.updateState(t)))}getAdminPaymentSettings(){return this.http.get(`${this.apiUrl}/admin/settings/payment`).pipe(Xn(t=>this.updateState(t)))}updatePaymentSettings(t){return this.http.put(`${this.apiUrl}/admin/settings/payment`,t).pipe(Xn(e=>this.updateState(e)))}uploadQrCode(t){let e=new FormData;return e.append(`file`,t),this.http.post(`${this.apiUrl}/admin/settings/payment/qr-code`,e).pipe(Xn(i=>{i?.qrCodeUrl&&this.upiQrCodeUrlSignal.set(i.qrCodeUrl)}))}changePassword(t){return this.http.post(`${this.apiUrl}/admin/settings/change-password`,t)}static ɵfac=function(e){return new(e||a)};static ɵprov=b({token:a,factory:a.ɵfac,providedIn:`root`})};var N=class k{constructor(t){this.http=t;this.loadProductsFromStorage(),this.fetchProducts().subscribe()}http;apiUrl=`${n.apiUrl}/products`;categoryApiUrl=`${n.apiUrl}/categories`;STORAGE_KEY_PRODUCTS=`kc_master_products_cache_v3`;productsLoadedSignal=K(0);ICONS={sparklers:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 40 32 8"/><circle cx="32" cy="8" r="4" fill="currentColor" stroke="none"/><path d="M32 8 36 4M32 8 38 9M32 8 34 3" stroke-linecap="round"/></svg>`,"ground chakkars":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="30" r="7"/><path d="M24 30 8 18M24 30 40 18M24 30 6 30M24 30 42 30M24 30 12 40M24 30 36 40" stroke-linecap="round"/></svg>`,"flower pots":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 44 34 44 31 26 17 26Z"/><path d="M24 26 24 6M24 6 18 12M24 6 30 12M24 12 16 18M24 12 32 18" stroke-linecap="round"/></svg>`,"aerial shots":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="16" r="3" fill="currentColor" stroke="none"/><path d="M24 16 24 2M24 16 36 6M24 16 40 16M24 16 24 30M24 16 12 26M24 16 8 16M24 16 12 6" stroke-linecap="round"/><rect x="18" y="34" width="12" height="10" rx="1"/></svg>`,rockets:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M24 4C30 10 32 20 30 30l-12 0C16 20 18 10 24 4Z"/><path d="M18 30 12 40M30 30 36 40M20 30 20 40M28 30 28 40" stroke-linecap="round"/></svg>`,"kids novelty":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 15v18M15 24h18" stroke-linecap="round"/></svg>`,"sound crackers":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 20v8h6l10 8V12l-10 8Z"/><path d="M32 18a8 8 0 0 1 0 12M38 14a14 14 0 0 1 0 20" stroke-linecap="round"/></svg>`,"gift boxes":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="18" width="32" height="24" rx="1.5"/><path d="M8 26h32M24 18v24"/><path d="M24 18c-6 0-9-3-9-6a4 4 0 0 1 8-1c1-3 4-5 7-3s2 7-3 10Z"/></svg>`};categoriesCache=[];rawCategoriesCache=[];masterProductsMap=new Map;filterActiveCategories(t){let e=Array.from(this.masterProductsMap.values()),r=t.map(i=>{let o=i.id.toString(),s=i.name.trim().toLowerCase(),f=e.length>0?e.filter(c=>c.categoryId&&c.categoryId.toString()===o||c.categoryName&&c.categoryName.trim().toLowerCase()===s||c.cat&&c.cat.trim().toLowerCase()===s).length:i.count;return ai(li({},i),{count:f})});return e.length>0?r.filter(i=>{let o=i.name.toLowerCase().includes(`gift`);return i.count>0||o}):r}loadProductsFromStorage(){try{if(typeof window<`u`&&window.localStorage){let t=localStorage.getItem(this.STORAGE_KEY_PRODUCTS);if(t){let e=JSON.parse(t);Array.isArray(e)&&e.length>0&&(e.forEach(r=>this.masterProductsMap.set(r.code,r)),this.productsLoadedSignal.update(r=>r+1))}}}catch(t){console.error(`Error loading products cache from localStorage:`,t)}}saveProductsToStorage(){try{if(typeof window<`u`&&window.localStorage){let t=Array.from(this.masterProductsMap.values());localStorage.setItem(this.STORAGE_KEY_PRODUCTS,JSON.stringify(t))}}catch(t){console.error(`Error saving products cache to localStorage:`,t)}}fetchProducts(t,e){if(!t&&(!e||e===0)&&this.masterProductsMap.size>0)return Ae(Array.from(this.masterProductsMap.values()));let r=new zt;return t&&(r=r.set(`search`,t)),e&&e>0&&(r=r.set(`categoryId`,e.toString())),this.http.get(this.apiUrl,{params:r}).pipe(V(i=>{let o=i.map(s=>this.mapApiToProduct(s));return!t&&(!e||e===0)&&this.masterProductsMap.clear(),o.forEach(s=>this.masterProductsMap.set(s.code,s)),this.saveProductsToStorage(),this.rawCategoriesCache.length>0&&(this.categoriesCache=this.filterActiveCategories(this.rawCategoriesCache)),this.productsLoadedSignal.update(s=>s+1),o}),It(i=>{console.error(`Error fetching customer products from API:`,i);let o=Array.from(this.masterProductsMap.values());return e&&e>0?Ae(o.filter(s=>s.categoryId===e)):Ae(o)}))}fetchProductByCode(t){return this.http.get(`${this.apiUrl}/${t}`).pipe(V(e=>{let r=this.mapApiToProduct(e);return this.masterProductsMap.set(r.code,r),r}),It(()=>Ae(this.masterProductsMap.get(t))))}fetchCategories(){return this.rawCategoriesCache.length>0?Ae(this.categoriesCache):this.http.get(this.categoryApiUrl).pipe(V(t=>{let e=t.map(r=>{let i=(r.categoryId||r.id||``).toString(),o=r.categoryName||r.name||``;return{id:i,name:o,categorySlug:r.categorySlug,count:0,icon:o.toLowerCase(),image:this.getCategoryDefaultImage(o),desc:r.description||r.desc||`${o} fireworks collection.`}});return this.rawCategoriesCache=e,this.categoriesCache=this.filterActiveCategories(e),this.categoriesCache}),It(t=>(console.error(`Error fetching categories from API:`,t),Ae(this.categoriesCache))))}getProducts(){return Array.from(this.masterProductsMap.values())}getCategories(){return this.filterActiveCategories(this.rawCategoriesCache.length>0?this.rawCategoriesCache:this.categoriesCache)}getProductByCode(t){return this.masterProductsMap.get(t)}getCategoryById(t){return this.categoriesCache.find(e=>e.id===t||e.name.toLowerCase()===t.toLowerCase())}mapApiToProduct(t){let e=t.mrpPrice>0?t.mrpPrice:t.price>0?t.price:t.discountPrice,r=t.discountPrice>0?t.discountPrice:t.price,i=t.discountPercentage,o=t.productName||t.ProductName||``,s=(t.productCode||``).toString().trim(),f=o.toLowerCase(),c=t.imageUrl&&t.imageUrl.trim().length>0?t.imageUrl.trim():`/assets/images/sparklers.jpg`;return s===`32`||f.includes(`free fire`)?c=`/assets/images/5g-free-fire-gun.jpg`:(s===`33`||f.includes(`jackpot currency`))&&(c=`/assets/images/jackpot-currency.jpg`),{productId:t.productId,code:t.productCode,name:o,productSlug:t.productSlug,cat:t.categoryName?t.categoryName.toLowerCase().replace(/\s+/g,``):`sparklers`,categoryId:t.categoryId,categoryName:t.categoryName,price:r,mrpPrice:e,discountPercentage:i,discountPrice:r,totalQuantity:t.totalQuantity,unit:t.unit||`1 Box`,badge:i>0?`${i}% OFF`:t.totalQuantity<10?`Low Stock`:null,image:c,desc:t.description||`Premium Sivakasi ${o}. Factory tested & safety checked.`,specs:{"Net weight":`400 g`,"Burn type":`Standard Sivakasi Spec`,"Recommended use":`Open outdoor space`,"Stock Quantity":`${t.totalQuantity} Pcs Available`}}}getCategoryDefaultImage(t){let e=t.toLowerCase();return e.includes(`sparkler`)?`/assets/images/kambi-sparklers.jpg`:e.includes(`chakkar`)?`/assets/images/ashoka-chakkar.jpg`:e.includes(`flower`)||e.includes(`pot`)||e.includes(`fountain`)?`/assets/images/golden-fountain.jpg`:e.includes(`aerial`)||e.includes(`shot`)?`/assets/images/thunder-king.jpg`:e.includes(`rocket`)?`/assets/images/sky-rocket.jpg`:e.includes(`novelty`)||e.includes(`kid`)?`/assets/images/kids-novelty.jpg`:e.includes(`sound`)||e.includes(`bomb`)||e.includes(`bijili`)?`/assets/images/bijili-deluxe.jpg`:e.includes(`gift`)||e.includes(`box`)?`/assets/images/family-giftbox.jpg`:`/assets/images/sparklers.jpg`}getCategoryIcon(t){let e=(t||``).toLowerCase();return this.ICONS[e]?this.ICONS[e]:e.includes(`sparkler`)?this.ICONS.sparklers:e.includes(`chakkar`)||e.includes(`spinner`)||e.includes(`wheel`)?this.ICONS[`ground chakkars`]:e.includes(`flower`)||e.includes(`pot`)||e.includes(`fountain`)||e.includes(`kotti`)?this.ICONS[`flower pots`]:e.includes(`aerial`)||e.includes(`ariel`)||e.includes(`shot`)||e.includes(`fancy`)||e.includes(`sky`)||e.includes(`rider`)||e.includes(`musical`)||e.includes(`function`)?this.ICONS[`aerial shots`]:e.includes(`rocket`)||e.includes(`missile`)||e.includes(`lunik`)?this.ICONS.rockets:e.includes(`novelty`)||e.includes(`kid`)||e.includes(`toy`)||e.includes(`special`)?this.ICONS[`kids novelty`]:e.includes(`sound`)||e.includes(`bomb`)||e.includes(`bijili`)||e.includes(`wala`)||e.includes(`cracker`)||e.includes(`vedi`)?this.ICONS[`sound crackers`]:e.includes(`match`)||e.includes(`color`)||e.includes(`smoke`)?`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 38l16-28"/><path d="M32 10c2-2 5-2 7 0s2 5 0 7"/><path d="M12 42l8-4"/></svg>`:e.includes(`gift`)||e.includes(`box`)||e.includes(`pack`)?this.ICONS[`gift boxes`]:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 14v20M14 24h20"/></svg>`}formatPrice(t){return`₹`+(t||0).toLocaleString(`en-IN`)}downloadPriceListPdfApi(t){let e=new zt;return t&&t>0&&(e=e.set(`categoryId`,t.toString())),this.http.get(`${n.apiUrl}/products/price-list/pdf`,{params:e,responseType:`blob`})}triggerServerPdfDownload(t){this.downloadPriceListPdfApi(t).subscribe({next:e=>{if(e.size===0){alert(`Failed to download PDF: Received empty file from server.`);return}let r=window.URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`Karthick_Crackers_Price_List_2026.pdf`,document.body.appendChild(i),i.click(),document.body.removeChild(i),window.URL.revokeObjectURL(r)},error:e=>{console.error(`Error downloading server PDF:`,e),alert(`An error occurred while generating/downloading the PDF price list from the server. Please try again.`)}})}exportPriceListCsv(t,e,r){this.triggerServerPdfDownload(r)}generatePriceListPdf(t,e,r){if(!t||t.length===0)return;let i=new Map;t.forEach(g=>{let l=g.categoryName||(g.cat?g.cat.toUpperCase():`GENERAL`);i.has(l)||i.set(l,[]),i.get(l).push(g)});let o=Array.from(i.entries()),s=[`#8B0000`,`#006400`,`#1B4F72`,`#6C3483`,`#7D6608`,`#78281F`,`#117864`,`#4A235A`,`#7E5109`],f=o.map(([g,l],m)=>{let x=Math.min(...l.map(b=>b.discountPrice||b.price));return`
        <div class="summary-card">
          <div class="sc-title">${g}</div>
          <div class="sc-sub"><span>${l.length} Items</span> <b>From \u20B9${x.toFixed(0)}</b></div>
        </div>
      `}).join(``),c=1;o.map(([g,l],m)=>{let x=s[m%s.length],b=l.map(a=>{let C=a.mrpPrice&&a.mrpPrice>0?a.mrpPrice:a.price*2.22,P=a.discountPrice||a.price;return`
          <tr>
            <td class="col-num">${c++}</td>
            <td class="col-desc">
              <div class="prod-name">${a.name}</div>
              <div class="prod-code">${a.code}</div>
            </td>
            <td class="col-unit">${a.unit||`1 Box`}</td>
            <td class="col-mrp">\u20B9${C.toFixed(2)}</td>
            <td class="col-offer">\u20B9${P.toFixed(2)}</td>
            <td class="col-box"></td>
            <td class="col-box"></td>
          </tr>
        `}).join(``);return`
        <div class="category-block">
          <div class="category-header" style="background-color: ${x};">
            <span>${m+1}. ${g.toUpperCase()}</span>
            <span class="cat-badge">${l.length} Products</span>
          </div>
          <table class="price-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th style="text-align: left;">PRODUCT DESCRIPTION</th>
                <th style="width: 140px; text-align: center;">PACKING / UNIT</th>
                <th style="width: 90px; text-align: right;">MRP (\u20B9)</th>
                <th style="width: 100px; text-align: right;">OFFER (\u20B9)</th>
                <th style="width: 60px; text-align: center;">QTY</th>
                <th style="width: 100px; text-align: right;">AMOUNT (\u20B9)</th>
              </tr>
            </thead>
            <tbody>
              ${b}
            </tbody>
          </table>
        </div>
      `}).join(``);let L=`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, .pdf-wrap {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #1e272e;
      line-height: 1.4;
    }

    .pdf-wrap {
      width: 780px;
      margin: 0 auto;
      background: #ffffff;
      padding: 16px;
    }

    .pdf-section-block {
      background: #ffffff;
      margin-bottom: 16px;
    }

    /* HEADER BANNER */
    .header-banner {
      background: #090806;
      color: #ffffff;
      border-radius: 12px;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2px solid #E5A93C;
    }

    .brand-title-box h1 {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      line-height: 1.1;
    }

    .brand-title-box p {
      font-size: 11px;
      color: #E5A93C;
      letter-spacing: 2px;
      font-weight: 700;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .address-box {
      text-align: right;
      font-size: 11.5px;
      color: #cbd5e0;
      line-height: 1.4;
    }

    .address-box strong {
      color: #F5C242;
      display: block;
      font-size: 12px;
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    /* SUBHEADER */
    .subheader {
      text-align: center;
      padding: 10px 0;
    }
    .subheader p.eyebrow {
      font-size: 11.5px;
      font-weight: 800;
      color: #c53030;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .subheader h1 {
      font-size: 30px;
      font-weight: 900;
      color: #0b132b;
      margin-bottom: 6px;
    }
    .subheader p.subtext {
      font-size: 12px;
      color: #4a5568;
      max-width: 600px;
      margin: 0 auto;
    }

    /* OFFER STRIP */
    .offer-strip {
      background: #c53030;
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .offer-main { font-size: 18px; letter-spacing: 0.5px; font-weight: 900; }
    .offer-sub { font-size: 12px; opacity: 0.95; font-weight: 600; }

    /* STATS GRID */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .stat-box {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .stat-val { font-size: 22px; font-weight: 900; color: #1a202c; }
    .stat-lbl { font-size: 10px; font-weight: 800; color: #718096; letter-spacing: 1px; margin-top: 2px; }

    /* QUICK SUMMARY */
    .summary-section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #2d3748;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .summary-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .sc-title { font-size: 11.5px; font-weight: 800; color: #1a202c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sc-sub { font-size: 10.5px; color: #718096; margin-top: 2px; display: flex; justify-content: space-between; }
    .sc-sub b { color: #e53e3e; }

    /* CATEGORY TABLES */
    .category-block {
      page-break-inside: avoid;
    }
    .category-header {
      padding: 10px 14px;
      color: #ffffff;
      font-weight: 800;
      font-size: 13.5px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      letter-spacing: 0.5px;
    }
    .cat-badge {
      background: rgba(255,255,255,0.25);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
    }

    .price-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border: 1px solid #cbd5e0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      overflow: hidden;
      font-size: 12px;
    }
    .price-table th {
      background: #1a202c;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      border: 1px solid #2d3748;
    }
    .price-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #edf2f7;
      border-right: 1px solid #edf2f7;
      vertical-align: middle;
    }
    .price-table tr:nth-child(even) td {
      background: #f7fafc;
    }
    .col-num { text-align: center; color: #718096; font-weight: 700; width: 35px; }
    .col-desc { }
    .prod-name { font-weight: 700; color: #2d3748; font-size: 12.5px; }
    .prod-code { font-size: 10px; color: #a0aec0; font-family: monospace; }
    .col-unit { text-align: center; color: #4a5568; width: 130px; }
    .col-mrp { text-align: right; color: #718096; text-decoration: line-through; width: 85px; }
    .col-offer { text-align: right; color: #e53e3e; font-weight: 800; font-size: 12.5px; width: 95px; }
    .col-box { width: 55px; border: 1px dashed #cbd5e0 !important; background: #ffffff !important; }

    /* GIFT BANNER */
    .gift-banner {
      background: #d69e2e;
      color: #744210;
      font-weight: 900;
      font-size: 15px;
      text-align: center;
      padding: 14px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    /* NOTES & FOOTER */
    .notes-box {
      background: #fffaf0;
      border: 1px solid #feebc8;
      border-radius: 8px;
      padding: 16px;
    }
    .notes-box h4 { color: #9c4221; font-size: 13px; margin-bottom: 8px; font-weight: 800; }
    .notes-box ul { padding-left: 18px; font-size: 11.5px; color: #7b341e; line-height: 1.5; }

    .footer-bar {
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #718096;
    }
  </style>

  <div class="pdf-wrap" id="pdf-price-list-wrap">
    <!-- HEADER BANNER -->
    <div class="pdf-section-block header-banner">
      <div class="brand-title-box">
        <h1>Karthick Crackers</h1>
        <p>LIGHT UP THE CELEBRATION \xB7 WHOLESALE & RETAIL</p>
      </div>
      <div class="address-box">
        <strong>ADDRESS</strong>
        3/347/U, Inthira Group House,<br>
        Maraneri Village, Sivakasi - 626124
      </div>
    </div>

    <!-- SUBHEADER -->
    <div class="pdf-section-block subheader">
      <p class="eyebrow">DIRECT FROM SIVAKASI FACTORY OUTLET</p>
      <h1>Diwali 2026 Official Price List</h1>
      <p class="subtext">Buy original, high-quality Sivakasi crackers directly from our factory at lowest prices. Safe, fresh stock with mega discount for this Diwali celebration!</p>
    </div>

    <!-- OFFER STRIP -->
    <div class="pdf-section-block offer-strip">
      <span class="offer-main">Flat 55% OFF on All Crackers!</span>
      <span class="offer-sub">Special Festive Offer \xB7 Direct Sivakasi Factory Pricing</span>
    </div>

    <!-- STATS GRID -->
    <div class="pdf-section-block stats-grid">
      <div class="stat-box">
        <div class="stat-val">${t.length}</div>
        <div class="stat-lbl">TOTAL ITEMS</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Flat 55%</div>
        <div class="stat-lbl">MEGA DISCOUNT</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Diwali 2026</div>
        <div class="stat-lbl">SEASON OFFER</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">Factory Price</div>
        <div class="stat-lbl">DIRECT SIVAKASI</div>
      </div>
    </div>

    <!-- QUICK SUMMARY CARDS -->
    <div class="pdf-section-block">
      <div class="summary-section-head">
        <span>PRODUCT CATEGORIES \xB7 QUICK SUMMARY</span>
        <span style="font-size: 11px; color: #718096;">Detailed price list below \u2193</span>
      </div>
      <div class="summary-grid">
        ${f}
      </div>
    </div>

    <!-- DETAILED CATEGORY TABLES -->
    ${o.map(([g,l],m)=>{let x=s[m%s.length],b=l.map(a=>{let C=a.mrpPrice&&a.mrpPrice>0?a.mrpPrice:a.price*2.22,P=a.discountPrice||a.price;return`
          <tr>
            <td class="col-num">${c++}</td>
            <td class="col-desc">
              <div class="prod-name">${a.name}</div>
              <div class="prod-code">${a.code}</div>
            </td>
            <td class="col-unit">${a.unit||`1 Box`}</td>
            <td class="col-mrp">\u20B9${C.toFixed(2)}</td>
            <td class="col-offer">\u20B9${P.toFixed(2)}</td>
            <td class="col-box"></td>
            <td class="col-box"></td>
          </tr>
        `}).join(``);return`
        <div class="pdf-section-block category-block">
          <div class="category-header" style="background-color: ${x};">
            <span>${m+1}. ${g.toUpperCase()}</span>
            <span class="cat-badge">${l.length} Products</span>
          </div>
          <table class="price-table">
            <thead>
              <tr>
                <th style="width: 35px; text-align: center;">#</th>
                <th style="text-align: left;">PRODUCT DESCRIPTION</th>
                <th style="width: 130px; text-align: center;">PACKING / UNIT</th>
                <th style="width: 85px; text-align: right;">MRP (\u20B9)</th>
                <th style="width: 95px; text-align: right;">OFFER (\u20B9)</th>
                <th style="width: 55px; text-align: center;">QTY</th>
                <th style="width: 85px; text-align: right;">AMOUNT (\u20B9)</th>
              </tr>
            </thead>
            <tbody>
              ${b}
            </tbody>
          </table>
        </div>
      `}).join(``)}

    <!-- GIFT BOX BANNER -->
    <div class="pdf-section-block gift-banner">
      \u{1F381} All Kinds of Diwali Gift Boxes & Family Packs Available!
    </div>

    <!-- ORDER & SAFETY NOTES -->
    <div class="pdf-section-block notes-box">
      <h4>Order & Safety Notes</h4>
      <ul>
        <li>All prices listed are per box / piece as specified in the Variant column and are inclusive of applicable taxes.</li>
        <li>Prices and stock are subject to change without prior notice during peak festive demand \u2014 please confirm live pricing on our website.</li>
        <li>All products are manufactured in Sivakasi following strict quality and safety standards.</li>
        <li>Minors and children should use crackers only under adult supervision, in open outdoor spaces.</li>
        <li>Dispatch and transport details will be arranged and discussed directly with customers based on transport availability.</li>
      </ul>
    </div>

    <!-- FOOTER BAR -->
    <div class="pdf-section-block footer-bar">
      <span><strong>Karthick Crackers</strong> \xB7 Sivakasi, Tamil Nadu</span>
      <span>Official Price List 2026</span>
    </div>
  </div>
    `;e&&`${e.replace(/\s+/g,`_`)}`;let n=document.createElement(`div`);n.id=`price-list-modal-wrapper`,n.style.position=`fixed`,n.style.inset=`0`,n.style.background=`rgba(11, 9, 7, 0.82)`,n.style.backdropFilter=`blur(6px)`,n.style.zIndex=`1000000`,n.style.display=`flex`,n.style.alignItems=`center`,n.style.justifyContent=`center`,n.style.padding=`20px`;let d=document.createElement(`div`);d.style.width=`100%`,d.style.maxWidth=`840px`,d.style.maxHeight=`92vh`,d.style.background=`#ffffff`,d.style.borderRadius=`12px`,d.style.boxShadow=`0 20px 60px rgba(0,0,0,0.5)`,d.style.display=`flex`,d.style.flexDirection=`column`,d.style.overflow=`hidden`;let p=document.createElement(`div`);p.style.background=`#0B0907`,p.style.color=`#FFFFFF`,p.style.padding=`14px 24px`,p.style.display=`flex`,p.style.alignItems=`center`,p.style.justifyContent=`space-between`,p.style.borderBottom=`2px solid #F5C242`,p.innerHTML=`
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">\u{1F386}</span>
        <b style="font-size: 15px; color: #F5C242; font-family: sans-serif;">Karthick Crackers Price List 2026 (55% OFF)</b>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="download-pdf-now-btn" style="background: linear-gradient(135deg, #FFB800, #D48800); color: #000; font-weight: 800; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 12.5px; font-family: sans-serif; display: flex; align-items: center; gap: 6px;">
          \u{1F4E5} Save PDF File
        </button>
        <button id="close-modal-btn" style="background: rgba(255,255,255,0.15); color: #FFF; border: 1px solid rgba(255,255,255,0.3); padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 12.5px; font-family: sans-serif;">
          \u2715 Close
        </button>
      </div>
    `;let h=document.createElement(`div`);h.style.flex=`1`,h.style.overflowY=`auto`,h.style.padding=`16px`,h.style.background=`#F8FAFC`,h.innerHTML=L,d.appendChild(p),d.appendChild(h),n.appendChild(d),document.body.appendChild(n);let B=()=>{document.body.contains(n)&&document.body.removeChild(n)},D=()=>{window.print()},A=p.querySelector(`#download-pdf-now-btn`),M=p.querySelector(`#close-modal-btn`);A&&A.addEventListener(`click`,D),M&&M.addEventListener(`click`,B)}static ɵfac=function(e){return new(e||k)(I(Vv))};static ɵprov=b({token:k,factory:k.ɵfac,providedIn:`root`})};var S=class d{constructor(e){this.productService=e;this.loadCartFromStorage(),this.loadLastOrderFromStorage()}productService;MIN_ORDER_AMOUNT=2500;STORAGE_KEY_CART=`kc_cart_items_v1`;STORAGE_KEY_LAST_ORDER=`kc_last_order_v1`;cartItemsSignal=K([]);toastMessage=K(``);toastVisible=K(!1);toastTimeout;lastOrder=K(null);loadCartFromStorage(){try{if(typeof window<`u`&&window.localStorage){let e=localStorage.getItem(this.STORAGE_KEY_CART);if(e){let t=JSON.parse(e);Array.isArray(t)&&this.cartItemsSignal.set(t)}}}catch(e){console.error(`Error loading cart from localStorage:`,e)}}saveCartToStorage(e){try{typeof window<`u`&&window.localStorage&&localStorage.setItem(this.STORAGE_KEY_CART,JSON.stringify(e))}catch(t){console.error(`Error saving cart to localStorage:`,t)}}loadLastOrderFromStorage(){try{if(typeof window<`u`){let e=sessionStorage.getItem(this.STORAGE_KEY_LAST_ORDER)||localStorage.getItem(this.STORAGE_KEY_LAST_ORDER);if(e){let t=JSON.parse(e);t&&t.orderId&&this.lastOrder.set(t)}}}catch(e){console.error(`Error loading last order from storage:`,e)}}saveLastOrderToStorage(e){try{if(typeof window<`u`)if(e){let t=JSON.stringify(e);sessionStorage.setItem(this.STORAGE_KEY_LAST_ORDER,t),localStorage.setItem(this.STORAGE_KEY_LAST_ORDER,t)}else sessionStorage.removeItem(this.STORAGE_KEY_LAST_ORDER),localStorage.removeItem(this.STORAGE_KEY_LAST_ORDER)}catch(t){console.error(`Error saving last order to storage:`,t)}}get cartItems(){return this.cartItemsSignal.asReadonly()}cartCount=Zo(()=>this.cartItemsSignal().reduce((e,t)=>e+t.qty,0));cartSubtotal=Zo(()=>(this.productService.productsLoadedSignal(),this.cartItemsSignal().reduce((e,t)=>{let r=this.productService.getProductByCode(t.code);return e+(r?r.price*t.qty:0)},0)));cartDiscount=Zo(()=>0);cartTotal=Zo(()=>this.cartSubtotal());isMinimumOrderMet=Zo(()=>this.cartTotal()>=this.MIN_ORDER_AMOUNT);minOrderShortfall=Zo(()=>Math.max(0,this.MIN_ORDER_AMOUNT-this.cartTotal()));getItemQty(e){let t=this.cartItemsSignal().find(r=>r.code===e);return t?t.qty:0}addToCart(e,t=1){let r=[...this.cartItemsSignal()],a=r.findIndex(c=>c.code===e);a>-1?r[a]=ai(li({},r[a]),{qty:r[a].qty+t}):r.push({code:e,qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r),this.showToast(`Added to cart`)}decrementQty(e){let t=[...this.cartItemsSignal()],r=t.findIndex(a=>a.code===e);r>-1&&(t[r].qty>1?(t[r]=ai(li({},t[r]),{qty:t[r].qty-1}),this.cartItemsSignal.set(t),this.saveCartToStorage(t)):this.removeFromCart(e))}removeFromCart(e){let t=this.cartItemsSignal().filter(r=>r.code!==e);this.cartItemsSignal.set(t),this.saveCartToStorage(t)}setQty(e,t){if(t<1){this.removeFromCart(e);return}let r=[...this.cartItemsSignal()],a=r.findIndex(c=>c.code===e);a>-1?(r[a]=ai(li({},r[a]),{qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r)):(r.push({code:e,qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r))}clearCart(){this.cartItemsSignal.set([]),this.saveCartToStorage([])}showToast(e){this.toastMessage.set(e),this.toastVisible.set(!0),this.toastTimeout&&clearTimeout(this.toastTimeout),this.toastTimeout=setTimeout(()=>{this.toastVisible.set(!1)},1800)}setLastOrder(e){this.lastOrder.set(e),this.saveLastOrderToStorage(e)}static ɵfac=function(t){return new(t||d)(I(N))};static ɵprov=b({token:d,factory:d.ɵfac,providedIn:`root`})};var x=(e,o)=>{let n=p$1(p),r=p$1(at);return n.isAuthenticated()?!0:(r.navigate([`/admin/login`]),!1)};var ie=[{path:``,loadComponent:()=>import(`./chunk-BFIol17s.js`).then(e=>e.HomeComponent)},{path:`home`,redirectTo:``,pathMatch:`full`},{path:`products`,loadComponent:()=>import(`./chunk-HlMAWC9V.js`).then(e=>e.ListingComponent)},{path:`listing`,redirectTo:`products`,pathMatch:`full`},{path:`quick-order`,loadComponent:()=>import(`./chunk-CdE8vLUr.js`).then(e=>e.QuickOrderComponent)},{path:`categories`,redirectTo:`categories/all`,pathMatch:`full`},{path:`category`,redirectTo:`categories/all`,pathMatch:`full`},{path:`categories/:slug`,loadComponent:()=>import(`./chunk-B1n5JnnB.js`).then(e=>e.CategoryComponent)},{path:`category/:id`,redirectTo:`categories/:id`,pathMatch:`full`},{path:`products/:slug`,loadComponent:()=>import(`./chunk-nQ7sPRLK.js`).then(e=>e.DetailComponent)},{path:`detail/:code`,redirectTo:`products/:code`,pathMatch:`full`},{path:`cart`,loadComponent:()=>import(`./chunk-D4X8MtDt.js`).then(e=>e.CartComponent)},{path:`checkout`,loadComponent:()=>import(`./chunk-CHp2kXTw.js`).then(e=>e.CheckoutComponent)},{path:`confirmation`,loadComponent:()=>import(`./chunk-BCCUUMy6.js`).then(e=>e.ConfirmationComponent)},{path:`faq`,loadComponent:()=>import(`./chunk-BpsvKO4E.js`).then(e=>e.Faq)},{path:`crackers-price-list`,loadComponent:()=>import(`./chunk-DuWGJOz1.js`).then(e=>e.PriceList)},{path:`admin/login`,loadComponent:()=>import(`./chunk-3kBv2fwS.js`).then(e=>e.LoginComponent)},{path:`admin/dashboard`,loadComponent:()=>import(`./chunk-kachXqmw.js`).then(e=>e.DashboardComponent),canActivate:[x]},{path:`admin/products`,loadComponent:()=>import(`./chunk-DU9OCdEZ.js`).then(e=>e.AdminProductsComponent),canActivate:[x]},{path:`admin/customers`,loadComponent:()=>import(`./chunk--ALfBjPp.js`).then(e=>e.CustomersComponent),canActivate:[x]},{path:`admin/settings`,loadComponent:()=>import(`./chunk-Chw2Qb2N.js`).then(e=>e.AdminSettingsComponent),canActivate:[x]},{path:`404`,loadComponent:()=>import(`./chunk-C3T_Yy0X.js`).then(e=>e.NotFound)},{path:`**`,redirectTo:`404`}];var oe=(e,o)=>{let r=p$1(p).getToken();if(r)return o(e.clone({setHeaders:{Authorization:`Bearer ${r}`}}));return o(e)};var j=class e{handleError(o){(/Loading chunk [\d]+ failed/.test(o.message)||/Failed to fetch dynamically imported module/.test(o.message)||o.message&&o.message.includes(`dynamically imported module`))&&window.location.reload(),console.error(`Error from global error handler`,o)}static ɵfac=function(n){return new(n||e)};static ɵprov=b({token:e,factory:e.ɵfac})};var ae={providers:[y_(ie),xb(kb([oe])),{provide:Qe,useClass:j}]};var le=()=>({exact:!0});var L=class e{constructor(o,n){this.cartService=o;this.paymentSettingsService=n}cartService;paymentSettingsService;static ɵfac=function(n){return new(n||e)(j$1(S),j$1(d))};static ɵcmp=ed({type:e,selectors:[[`app-header`]],decls:32,vars:4,consts:[[1,`site-header`],[1,`wrap`],[1,`header-inner`],[`routerLink`,`/`,`aria-label`,`Karthick Crackers, go to home`,1,`brand`],[`src`,`assets/images/karthick-crackers-logo.jpg`,`alt`,`Karthick Crackers Logo`,1,`brand-mark`],[1,`brand-word`],[`aria-label`,`Primary`,1,`main-nav`],[`routerLink`,`/`,`routerLinkActive`,`is-current`,1,`nav-link`,3,`routerLinkActiveOptions`],[`routerLink`,`/quick-order`,`routerLinkActive`,`is-current`,1,`nav-link`,2,`color`,`var(--mustard-2)`,`font-weight`,`700`],[`routerLink`,`/products`,`routerLinkActive`,`is-current`,1,`nav-link`],[`routerLink`,`/categories/all`,`routerLinkActive`,`is-current`,1,`nav-link`],[1,`header-actions`],[`target`,`_blank`,1,`btn`,`btn-whatsapp`,`btn-sm`,3,`href`],[`viewBox`,`0 0 24 24`,`fill`,`currentColor`],[`d`,`M12 2C6.48 2 2 6.36 2 11.74c0 2.07.62 3.99 1.68 5.6L2 22l4.85-1.55A10.1 10.1 0 0 0 12 21.48c5.52 0 10-4.36 10-9.74S17.52 2 12 2Zm0 17.7c-1.65 0-3.2-.46-4.52-1.26l-.32-.19-3.1.99.97-3.05-.2-.32a7.86 7.86 0 0 1-1.24-4.13c0-4.4 3.72-7.98 8.41-7.98s8.41 3.58 8.41 7.98-3.72 7.96-8.41 7.96Zm4.53-5.87c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.13-1.06-.4-2.02-1.26-.75-.68-1.25-1.51-1.4-1.77-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.37-.77-1.87-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.11s.9 2.45 1.02 2.62c.13.17 1.77 2.77 4.29 3.78.6.26 1.07.42 1.43.53.6.19 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3Z`],[`routerLink`,`/cart`,`aria-label`,`View cart`,1,`icon-btn`],[`width`,`17`,`height`,`17`,`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`1.8`],[`cx`,`9`,`cy`,`21`,`r`,`1.4`],[`cx`,`18`,`cy`,`21`,`r`,`1.4`],[`d`,`M2.5 3h2.4l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7.2H6.2`],[1,`cart-count`]],template:function(n,r){n&1&&(xs(0,`header`,0)(1,`div`,1)(2,`div`,2)(3,`a`,3),Xs(4,`img`,4),xs(5,`div`,5)(6,`b`),IT(7,`Karthick Crackers`),id(),xs(8,`span`),IT(9,`SIVAKASI · SINCE 2010`),id()()(),xs(10,`nav`,6)(11,`a`,7),IT(12,`Home`),id(),xs(13,`a`,8),IT(14,`⚡ Quick order`),id(),xs(15,`a`,9),IT(16,`Shop all`),id(),xs(17,`a`,10),IT(18,`Categories`),id()(),xs(19,`div`,11)(20,`a`,12),kh(),xs(21,`svg`,13),Xs(22,`path`,14),id(),Ph(),xs(23,`span`),IT(24,`WhatsApp`),id()(),xs(25,`a`,15),kh(),xs(26,`svg`,16),Xs(27,`circle`,17)(28,`circle`,18)(29,`path`,19),id(),Ph(),xs(30,`span`,20),IT(31),id()()()()()()),n&2&&(GI(11),hm(`routerLinkActiveOptions`,xT(3,le)),GI(9),hm(`href`,`https://wa.me/`+r.paymentSettingsService.cleanPhoneSignal(),Dg),GI(11),Sm(r.cartService.cartCount()))},dependencies:[yv,D_,oc,g_],encapsulation:2})};var se=e=>[`/categories`,e];var de=(e,o)=>o.id;function ue(e,o){if(e&1&&(xs(0,`li`)(1,`a`,23),IT(2),id()()),e&2){let n=o.$implicit;GI(),hm(`routerLink`,kT(2,se,n.categorySlug||n.id)),GI(),Sm(n.name)}}var T=class e{constructor(o,n){this.productService=o;this.paymentSettingsService=n}productService;paymentSettingsService;categories=[];ngOnInit(){this.productService.fetchCategories().subscribe(o=>{this.categories=o.slice(0,6)})}static ɵfac=function(n){return new(n||e)(j$1(N),j$1(d))};static ɵcmp=ed({type:e,selectors:[[`app-footer`]],decls:63,vars:2,consts:[[`id`,`site-footer`,1,`site-footer`],[1,`wrap`],[1,`footer-grid`],[1,`footer-brand`],[`routerLink`,`/`,1,`brand`],[`src`,`assets/images/karthick-crackers-logo.jpg`,`alt`,`Karthick Crackers Logo`,1,`brand-mark`],[1,`brand-word`],[1,`footer-col`],[`routerLink`,`/`],[`routerLink`,`/quick-order`,2,`color`,`var(--mustard-2)`,`font-weight`,`700`],[`routerLink`,`/products`],[`routerLink`,`/cart`],[1,`footer-contact`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`1.6`],[`d`,`M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.7 2Z`],[2,`color`,`inherit`,`text-decoration`,`none`,3,`href`],[`x`,`2`,`y`,`4`,`width`,`20`,`height`,`16`,`rx`,`2`],[`d`,`m2 7 10 6 10-6`],[`href`,`https://www.google.com/maps/place/Karthick+Crackers/@9.4209365,77.7371372,783m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3b06c5c4d311314b:0x9b8974031480aa69!8m2!3d9.4209365!4d77.7371372!16s%2Fg%2F11zypv1z4_!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D`,`target`,`_blank`,2,`color`,`inherit`,`text-decoration`,`none`,`display`,`flex`,`align-items`,`flex-start`,`gap`,`8px`],[`d`,`M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z`],[`cx`,`12`,`cy`,`10`,`r`,`3`],[1,`footer-bottom`],[1,`footer-note`],[3,`routerLink`]],template:function(n,r){n&1&&(xs(0,`footer`,0)(1,`div`,1)(2,`div`,2)(3,`div`,3)(4,`a`,4),Xs(5,`img`,5),xs(6,`div`,6)(7,`b`),IT(8,`Karthick Crackers`),id(),xs(9,`span`),IT(10,`SIVAKASI · SINCE 2010`),id()()(),xs(11,`p`),IT(12,`Family-run fireworks manufacturer and retailer based in Sivakasi, Tamil Nadu — supplying tested, safety-compliant crackers across South India.`),id()(),xs(13,`div`,7)(14,`h5`),IT(15,`Quick links`),id(),xs(16,`ul`)(17,`li`)(18,`a`,8),IT(19,`Home`),id()(),xs(20,`li`)(21,`a`,9),IT(22,`⚡ Quick order sheet`),id()(),xs(23,`li`)(24,`a`,10),IT(25,`Shop all`),id()(),xs(26,`li`)(27,`a`,11),IT(28,`Your cart`),id()(),xs(29,`li`)(30,`a`,8),IT(31,`Bulk / wholesale orders`),id()()()(),xs(32,`div`,7)(33,`h5`),IT(34,`Categories`),id(),xs(35,`ul`),Ww(36,ue,3,4,`li`,null,de),id()(),xs(38,`div`,7)(39,`h5`),IT(40,`Get in touch`),id(),xs(41,`ul`,12)(42,`li`),kh(),xs(43,`svg`,13),Xs(44,`path`,14),id(),Ph(),xs(45,`a`,15),IT(46),id()(),xs(47,`li`),kh(),xs(48,`svg`,13),Xs(49,`rect`,16)(50,`path`,17),id(),IT(51,`orders.karthick.crackers@gmail.com`),id(),Ph(),xs(52,`li`)(53,`a`,18),kh(),xs(54,`svg`,13),Xs(55,`path`,19)(56,`circle`,20),id(),IT(57,`3/347/U, Inthira Group House, Maraneri Village, Sivakasi - 626124`),id()()()()(),Ph(),xs(58,`div`,21)(59,`span`),IT(60,`© 2026 Karthick Crackers. All rights reserved.`),id()()(),xs(61,`div`,22),IT(62,`Fireworks sale is subject to state and local regulations. Please use crackers responsibly, away from dry vegetation, and keep water nearby.`),id()()),n&2&&(GI(36),Zw(r.categories),GI(9),hm(`href`,`tel:+`+r.paymentSettingsService.cleanPhoneSignal(),Dg),GI(),Sm(r.paymentSettingsService.displayPhoneSignal()))},dependencies:[yv,D_,oc],encapsulation:2})};var R=class e{constructor(o){this.cartService=o}cartService;static ɵfac=function(n){return new(n||e)(j$1(S))};static ɵcmp=ed({type:e,selectors:[[`app-toast`]],decls:5,vars:3,consts:[[1,`toast`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`2`],[`d`,`M20 6 9 17l-5-5`]],template:function(n,r){n&1&&(sd(0,`div`,0),kh(),sd(1,`svg`,1),pm(2,`path`,2),ad(),Ph(),sd(3,`span`),IT(4),ad()()),n&2&&(wm(`is-show`,r.cartService.toastVisible()),GI(4),Sm(r.cartService.toastMessage()))},dependencies:[yv],encapsulation:2})};var D=class e{constructor(o){this.paymentSettingsService=o}paymentSettingsService;static ɵfac=function(n){return new(n||e)(j$1(d))};static ɵcmp=ed({type:e,selectors:[[`app-floating-contact`]],decls:8,vars:6,consts:[[1,`floating-contact-widget`],[`target`,`_blank`,1,`float-icon-btn`,`float-whatsapp`,3,`href`,`title`],[1,`pulse-ring`],[`viewBox`,`0 0 24 24`,`fill`,`currentColor`,`width`,`26`,`height`,`26`],[`d`,`M12 2C6.48 2 2 6.36 2 11.74c0 2.07.62 3.99 1.68 5.6L2 22l4.85-1.55A10.1 10.1 0 0 0 12 21.48c5.52 0 10-4.36 10-9.74S17.52 2 12 2Zm0 17.7c-1.65 0-3.2-.46-4.52-1.26l-.32-.19-3.1.99.97-3.05-.2-.32a7.86 7.86 0 0 1-1.24-4.13c0-4.4 3.72-7.98 8.41-7.98s8.41 3.58 8.41 7.98-3.72 7.96-8.41 7.96Zm4.53-5.87c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.13-1.06-.4-2.02-1.26-.75-.68-1.25-1.51-1.4-1.77-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.37-.77-1.87-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.11s.9 2.45 1.02 2.62c.13.17 1.77 2.77 4.29 3.78.6.26 1.07.42 1.43.53.6.19 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3Z`],[1,`float-icon-btn`,`float-call`,3,`href`,`title`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`2.2`,`width`,`22`,`height`,`22`],[`d`,`M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z`]],template:function(n,r){n&1&&(sd(0,`div`,0)(1,`a`,1),pm(2,`div`,2),kh(),sd(3,`svg`,3),pm(4,`path`,4),ad()(),Ph(),sd(5,`a`,5),kh(),sd(6,`svg`,6),pm(7,`path`,7),ad()()()),n&2&&(GI(),ym(`href`,`https://wa.me/`+r.paymentSettingsService.cleanPhoneSignal()+`?text=Hello%20Karthick%20Crackers%2C%20I%20have%20an%20enquiry%20regarding%20fireworks.`,Dg)(`title`,`Chat on WhatsApp (`+r.paymentSettingsService.displayPhoneSignal()+`)`),Ks(`aria-label`,`Chat on WhatsApp `+r.paymentSettingsService.displayPhoneSignal()),GI(4),ym(`href`,`tel:+`+r.paymentSettingsService.cleanPhoneSignal(),Dg)(`title`,`Call `+r.paymentSettingsService.displayPhoneSignal()),Ks(`aria-label`,`Call `+r.paymentSettingsService.displayPhoneSignal()))},dependencies:[yv],styles:[`.floating-contact-widget[_ngcontent-%COMP%]{position:fixed;bottom:24px;left:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;align-items:center;pointer-events:none}.float-icon-btn[_ngcontent-%COMP%]{pointer-events:auto;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;box-shadow:0 8px 20px #00000073,0 2px 6px #0000004d;transition:all .25s cubic-bezier(.22,.9,.3,1);position:relative}.float-icon-btn[_ngcontent-%COMP%]:hover{transform:translateY(-3px) scale(1.1);box-shadow:0 12px 28px #0009}.float-whatsapp[_ngcontent-%COMP%]{background:linear-gradient(135deg,#25d366,#128c7e);border:1px solid rgba(255,255,255,.25)}.float-whatsapp[_ngcontent-%COMP%]   .pulse-ring[_ngcontent-%COMP%]{position:absolute;inset:-5px;border-radius:50%;border:2px solid #25D366;animation:_ngcontent-%COMP%_waPulse 2s cubic-bezier(.22,.9,.3,1) infinite;pointer-events:none}.float-call[_ngcontent-%COMP%]{background:linear-gradient(135deg,#f5c242,#e5a93c);color:#000;border:1px solid rgba(255,255,255,.4)}.float-call[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%]{stroke:#000}@keyframes _ngcontent-%COMP%_waPulse{0%{transform:scale(.92);opacity:.8}50%{transform:scale(1.15);opacity:0}to{transform:scale(.92);opacity:0}}@media(max-width:768px){.floating-contact-widget[_ngcontent-%COMP%]{bottom:78px;left:14px;gap:10px}.float-icon-btn[_ngcontent-%COMP%]{width:46px;height:46px}.float-icon-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%]{width:22px;height:22px}}`]})};function fe(e,o){e&1&&(xs(0,`div`,4)(1,`span`),IT(2,`9:41`),id(),xs(3,`span`),IT(4,`●●● ▲ ■`),id()())}function he(e,o){e&1&&Xs(0,`app-header`)}function ge(e,o){e&1&&Xs(0,`app-footer`)}function ve(e,o){e&1&&Xs(0,`app-floating-contact`)}ab(class e{constructor(o){this.router=o;this.checkAdminRoute(this.router.url),this.router.events.pipe(D$1(n=>n instanceof xe)).subscribe(n=>{this.checkAdminRoute(n.urlAfterRedirects||n.url)})}router;title=`Karthick Crackers`;isAdminRoute=K(!1);checkAdminRoute(o){this.isAdminRoute.set(o.startsWith(`/admin`))}static ɵfac=function(n){return new(n||e)(j$1(at))};static ɵcmp=ed({type:e,selectors:[[`app-root`]],decls:9,vars:10,consts:[[`id`,`frame-outer`],[`id`,`viewport`],[`class`,`phone-chrome`,4,`ngIf`],[4,`ngIf`],[1,`phone-chrome`]],template:function(n,r){n&1&&(xs(0,`div`,0)(1,`div`,1),dm(2,fe,5,0,`div`,2)(3,he,1,0,`app-header`,3),xs(4,`main`),Xs(5,`router-outlet`),id(),dm(6,ge,1,0,`app-footer`,3),id()(),dm(7,ve,1,0,`app-floating-contact`,3),Xs(8,`app-toast`)),n&2&&(wm(`admin-layout`,r.isAdminRoute()),GI(),wm(`admin-viewport`,r.isAdminRoute()),GI(),hm(`ngIf`,!r.isAdminRoute()),GI(),hm(`ngIf`,!r.isAdminRoute()),GI(),wm(`admin-main`,r.isAdminRoute()),GI(2),hm(`ngIf`,!r.isAdminRoute()),GI(),hm(`ngIf`,!r.isAdminRoute()))},dependencies:[yv,BS,Ef,L,T,R,D],encapsulation:2})},ae).catch(e=>console.error(e));export{p as i,N as n,d as r,S as t};