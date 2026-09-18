import{Bt as tM,C as Le,Ct as kn,Dt as mS,E as M_,Et as m,G as Up,Gt as vt,I as Rv,It as qd,J as Wd,L as Sm,Lt as re,Mt as p$1,S as Jt,St as kN,T as M,Tt as lw,Vt as tT,W as Ua,Y as X,Yt as wy,Z as Y2,Zt as xv,bt as jN,c as E,ct as eh,d as FN,en as zc,f as Gd,ft as gS,g as HS,gt as hi,i as Bp,j as Pe,k as O,mt as hC,n as Ba,nt as _,ot as eM,p as Ge,qt as wa,r as Bd,s as Cv,st as eT,t as B,tn as zy,u as Ev,v as Iv,z as Sv,zt as s_}from"./chunk-DEj23OlA.js";var p=class r{constructor(e,t){this.http=e;this.router=t}http;router;TOKEN_KEY=`kc_admin_token`;USER_KEY=`kc_admin_user`;API_URL=`${Y2.apiUrl}/auth`;currentUser=re(this.getStoredUser());token=re(this.getStoredToken());login(e){return this.http.post(`${this.API_URL}/login`,e).pipe(Le({next:t=>{t&&t.token&&this.setSession(t)},error:t=>{console.error(`AuthService login error:`,t)}}))}logout(){localStorage.removeItem(this.TOKEN_KEY),localStorage.removeItem(this.USER_KEY),this.token.set(null),this.currentUser.set(null),this.router.navigate([`/admin/login`])}getToken(){return this.token()||localStorage.getItem(this.TOKEN_KEY)}isAuthenticated(){return!!this.getToken()}getMe(){return this.http.get(`${this.API_URL}/me`)}setSession(e){let t={userId:e.userId,email:e.email,role:e.role};localStorage.setItem(this.TOKEN_KEY,e.token),localStorage.setItem(this.USER_KEY,JSON.stringify(t)),this.token.set(e.token),this.currentUser.set(t)}getStoredToken(){return localStorage.getItem(this.TOKEN_KEY)}getStoredUser(){let e=localStorage.getItem(this.USER_KEY);if(!e)return null;try{return JSON.parse(e)}catch{return null}}static ɵfac=function(t){return new(t||r)(E(zy),E(vt))};static ɵprov=M({token:r,factory:r.ɵfac,providedIn:`root`})};var d=class a{http=p$1(zy);apiUrl=`${Y2.apiUrl}`;callNumberSignal=re(`+91 6380891094`);upiIdSignal=re(`9952378965@upi`);upiQrCodeUrlSignal=re(`assets/images/upi-qr.png`);cleanPhoneSignal=hi(()=>{let t=this.callNumberSignal().replace(/\D/g,``);return t.length===10?`91${t}`:t.startsWith(`91`)&&t.length===12?t:t||`916380891094`});displayPhoneSignal=hi(()=>{let t=this.callNumberSignal().trim();if(t.includes(` `))return t;let e=t.replace(/\D/g,``),i=e.startsWith(`91`)&&e.length===12?e.substring(2):e;return i.length===10?`+91 ${i.substring(0,5)} ${i.substring(5)}`:t||`+91 6380891094`});constructor(){this.refreshSettings()}updateState(t){t&&(t.callNumber&&this.callNumberSignal.set(t.callNumber),t.upiId&&this.upiIdSignal.set(t.upiId),t.upiQrCodeUrl&&this.upiQrCodeUrlSignal.set(t.upiQrCodeUrl))}refreshSettings(){this.getPublicPaymentSettings().subscribe({next:t=>this.updateState(t),error:()=>{}})}getPublicPaymentSettings(){return this.http.get(`${this.apiUrl}/settings/payment`).pipe(Le(t=>this.updateState(t)))}getAdminPaymentSettings(){return this.http.get(`${this.apiUrl}/admin/settings/payment`).pipe(Le(t=>this.updateState(t)))}updatePaymentSettings(t){return this.http.put(`${this.apiUrl}/admin/settings/payment`,t).pipe(Le(e=>this.updateState(e)))}uploadQrCode(t){let e=new FormData;return e.append(`file`,t),this.http.post(`${this.apiUrl}/admin/settings/payment/qr-code`,e).pipe(Le(i=>{i?.qrCodeUrl&&this.upiQrCodeUrlSignal.set(i.qrCodeUrl)}))}changePassword(t){return this.http.post(`${this.apiUrl}/admin/settings/change-password`,t)}static ɵfac=function(e){return new(e||a)};static ɵprov=M({token:a,factory:a.ɵfac,providedIn:`root`})};var N=class k{constructor(t){this.http=t;this.loadProductsFromStorage(),this.fetchProducts().subscribe()}http;apiUrl=`${Y2.apiUrl}/products`;categoryApiUrl=`${Y2.apiUrl}/categories`;STORAGE_KEY_PRODUCTS=`kc_master_products_cache_v3`;productsLoadedSignal=re(0);ICONS={sparklers:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 40 32 8"/><circle cx="32" cy="8" r="4" fill="currentColor" stroke="none"/><path d="M32 8 36 4M32 8 38 9M32 8 34 3" stroke-linecap="round"/></svg>`,"ground chakkars":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="30" r="7"/><path d="M24 30 8 18M24 30 40 18M24 30 6 30M24 30 42 30M24 30 12 40M24 30 36 40" stroke-linecap="round"/></svg>`,"flower pots":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 44 34 44 31 26 17 26Z"/><path d="M24 26 24 6M24 6 18 12M24 6 30 12M24 12 16 18M24 12 32 18" stroke-linecap="round"/></svg>`,"aerial shots":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="16" r="3" fill="currentColor" stroke="none"/><path d="M24 16 24 2M24 16 36 6M24 16 40 16M24 16 24 30M24 16 12 26M24 16 8 16M24 16 12 6" stroke-linecap="round"/><rect x="18" y="34" width="12" height="10" rx="1"/></svg>`,rockets:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M24 4C30 10 32 20 30 30l-12 0C16 20 18 10 24 4Z"/><path d="M18 30 12 40M30 30 36 40M20 30 20 40M28 30 28 40" stroke-linecap="round"/></svg>`,"kids novelty":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 15v18M15 24h18" stroke-linecap="round"/></svg>`,"sound crackers":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 20v8h6l10 8V12l-10 8Z"/><path d="M32 18a8 8 0 0 1 0 12M38 14a14 14 0 0 1 0 20" stroke-linecap="round"/></svg>`,"gift boxes":`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="18" width="32" height="24" rx="1.5"/><path d="M8 26h32M24 18v24"/><path d="M24 18c-6 0-9-3-9-6a4 4 0 0 1 8-1c1-3 4-5 7-3s2 7-3 10Z"/></svg>`};categoriesCache=[];rawCategoriesCache=[];masterProductsMap=new Map;filterActiveCategories(t){let e=Array.from(this.masterProductsMap.values()),r=t.map(i=>{let o=i.id.toString(),s=i.name.trim().toLowerCase(),u=e.length>0?e.filter(c=>c.categoryId&&c.categoryId.toString()===o||c.categoryName&&c.categoryName.trim().toLowerCase()===s||c.cat&&c.cat.trim().toLowerCase()===s).length:i.count;return O(m({},i),{count:u})});return e.length>0?r.filter(i=>{let o=i.name.toLowerCase().includes(`gift`);return i.count>0||o}):r}loadProductsFromStorage(){try{if(typeof window<`u`&&window.localStorage){let t=localStorage.getItem(this.STORAGE_KEY_PRODUCTS);if(t){let e=JSON.parse(t);Array.isArray(e)&&e.length>0&&(e.forEach(r=>this.masterProductsMap.set(r.code,r)),this.productsLoadedSignal.update(r=>r+1))}}}catch(t){console.error(`Error loading products cache from localStorage:`,t)}}saveProductsToStorage(){try{if(typeof window<`u`&&window.localStorage){let t=Array.from(this.masterProductsMap.values());localStorage.setItem(this.STORAGE_KEY_PRODUCTS,JSON.stringify(t))}}catch(t){console.error(`Error saving products cache to localStorage:`,t)}}fetchProducts(t,e){let r=new Jt;return t&&(r=r.set(`search`,t)),e&&e>0&&(r=r.set(`categoryId`,e.toString())),this.http.get(this.apiUrl,{params:r}).pipe(B(i=>{let o=i.map(s=>this.mapApiToProduct(s));return!t&&(!e||e===0)&&this.masterProductsMap.clear(),o.forEach(s=>this.masterProductsMap.set(s.code,s)),this.saveProductsToStorage(),this.rawCategoriesCache.length>0&&(this.categoriesCache=this.filterActiveCategories(this.rawCategoriesCache)),this.productsLoadedSignal.update(s=>s+1),o}),kn(i=>{console.error(`Error fetching customer products from API:`,i);let o=Array.from(this.masterProductsMap.values());return e&&e>0?_(o.filter(s=>s.categoryId===e)):_(o)}))}fetchProductByCode(t){return this.http.get(`${this.apiUrl}/${t}`).pipe(B(e=>{let r=this.mapApiToProduct(e);return this.masterProductsMap.set(r.code,r),r}),kn(()=>_(this.masterProductsMap.get(t))))}fetchCategories(){return this.http.get(this.categoryApiUrl).pipe(B(t=>{let e=t.map(r=>{let i=(r.categoryId||r.id||``).toString(),o=r.categoryName||r.name||``;return{id:i,name:o,count:0,icon:o.toLowerCase(),image:this.getCategoryDefaultImage(o),desc:r.description||r.desc||`${o} fireworks collection.`}});return this.rawCategoriesCache=e,this.categoriesCache=this.filterActiveCategories(e),this.categoriesCache}),kn(t=>(console.error(`Error fetching categories from API:`,t),_(this.categoriesCache))))}getProducts(){return Array.from(this.masterProductsMap.values())}getCategories(){return this.filterActiveCategories(this.rawCategoriesCache.length>0?this.rawCategoriesCache:this.categoriesCache)}getProductByCode(t){return this.masterProductsMap.get(t)}getCategoryById(t){return this.categoriesCache.find(e=>e.id===t||e.name.toLowerCase()===t.toLowerCase())}mapApiToProduct(t){let e=t.mrpPrice>0?t.mrpPrice:t.price>0?t.price:t.discountPrice,r=t.discountPrice>0?t.discountPrice:t.price,i=t.discountPercentage,o=t.productName||t.ProductName||``,s=(t.productCode||``).toString().trim(),u=o.toLowerCase(),c=t.imageUrl&&t.imageUrl.trim().length>0?t.imageUrl.trim():`/assets/images/sparklers.jpg`;return s===`32`||u.includes(`free fire`)?c=`/assets/images/5g-free-fire-gun.jpg`:(s===`33`||u.includes(`jackpot currency`))&&(c=`/assets/images/jackpot-currency.jpg`),{productId:t.productId,code:t.productCode,name:o,cat:t.categoryName?t.categoryName.toLowerCase().replace(/\s+/g,``):`sparklers`,categoryId:t.categoryId,categoryName:t.categoryName,price:r,mrpPrice:e,discountPercentage:i,discountPrice:r,totalQuantity:t.totalQuantity,unit:t.unit||`1 Box`,badge:i>0?`${i}% OFF`:t.totalQuantity<10?`Low Stock`:null,image:c,desc:t.description||`Premium Sivakasi ${o}. Factory tested & safety checked.`,specs:{"Net weight":`400 g`,"Burn type":`Standard Sivakasi Spec`,"Recommended use":`Open outdoor space`,"Stock Quantity":`${t.totalQuantity} Pcs Available`}}}getCategoryDefaultImage(t){let e=t.toLowerCase();return e.includes(`sparkler`)?`/assets/images/kambi-sparklers.jpg`:e.includes(`chakkar`)?`/assets/images/ashoka-chakkar.jpg`:e.includes(`flower`)||e.includes(`pot`)||e.includes(`fountain`)?`/assets/images/golden-fountain.jpg`:e.includes(`aerial`)||e.includes(`shot`)?`/assets/images/thunder-king.jpg`:e.includes(`rocket`)?`/assets/images/sky-rocket.jpg`:e.includes(`novelty`)||e.includes(`kid`)?`/assets/images/kids-novelty.jpg`:e.includes(`sound`)||e.includes(`bomb`)||e.includes(`bijili`)?`/assets/images/bijili-deluxe.jpg`:e.includes(`gift`)||e.includes(`box`)?`/assets/images/family-giftbox.jpg`:`/assets/images/sparklers.jpg`}getCategoryIcon(t){let e=(t||``).toLowerCase();return this.ICONS[e]?this.ICONS[e]:e.includes(`sparkler`)?this.ICONS.sparklers:e.includes(`chakkar`)||e.includes(`spinner`)||e.includes(`wheel`)?this.ICONS[`ground chakkars`]:e.includes(`flower`)||e.includes(`pot`)||e.includes(`fountain`)||e.includes(`kotti`)?this.ICONS[`flower pots`]:e.includes(`aerial`)||e.includes(`ariel`)||e.includes(`shot`)||e.includes(`fancy`)||e.includes(`sky`)||e.includes(`rider`)||e.includes(`musical`)||e.includes(`function`)?this.ICONS[`aerial shots`]:e.includes(`rocket`)||e.includes(`missile`)||e.includes(`lunik`)?this.ICONS.rockets:e.includes(`novelty`)||e.includes(`kid`)||e.includes(`toy`)||e.includes(`special`)?this.ICONS[`kids novelty`]:e.includes(`sound`)||e.includes(`bomb`)||e.includes(`bijili`)||e.includes(`wala`)||e.includes(`cracker`)||e.includes(`vedi`)?this.ICONS[`sound crackers`]:e.includes(`match`)||e.includes(`color`)||e.includes(`smoke`)?`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 38l16-28"/><path d="M32 10c2-2 5-2 7 0s2 5 0 7"/><path d="M12 42l8-4"/></svg>`:e.includes(`gift`)||e.includes(`box`)||e.includes(`pack`)?this.ICONS[`gift boxes`]:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="24" cy="24" r="16"/><path d="M24 14v20M14 24h20"/></svg>`}formatPrice(t){return`₹`+(t||0).toLocaleString(`en-IN`)}downloadPriceListPdfApi(t){let e=new Jt;return t&&t>0&&(e=e.set(`categoryId`,t.toString())),this.http.get(`${Y2.apiUrl}/products/price-list/pdf`,{params:e,responseType:`blob`})}triggerServerPdfDownload(t){this.downloadPriceListPdfApi(t).subscribe({next:e=>{if(e.size===0){alert(`Failed to download PDF: Received empty file from server.`);return}let r=window.URL.createObjectURL(e),i=document.createElement(`a`);i.href=r,i.download=`Karthick_Crackers_Price_List_2026.pdf`,document.body.appendChild(i),i.click(),document.body.removeChild(i),window.URL.revokeObjectURL(r)},error:e=>{console.error(`Error downloading server PDF:`,e),alert(`An error occurred while generating/downloading the PDF price list from the server. Please try again.`)}})}exportPriceListCsv(t,e,r){this.triggerServerPdfDownload(r)}generatePriceListPdf(t,e,r){if(!t||t.length===0)return;let i=new Map;t.forEach(g=>{let l=g.categoryName||(g.cat?g.cat.toUpperCase():`GENERAL`);i.has(l)||i.set(l,[]),i.get(l).push(g)});let o=Array.from(i.entries()),s=[`#8B0000`,`#006400`,`#1B4F72`,`#6C3483`,`#7D6608`,`#78281F`,`#117864`,`#4A235A`,`#7E5109`],u=o.map(([g,l],h)=>{let b=Math.min(...l.map(m=>m.discountPrice||m.price));return`
        <div class="summary-card">
          <div class="sc-title">${g}</div>
          <div class="sc-sub"><span>${l.length} Items</span> <b>From \u20B9${b.toFixed(0)}</b></div>
        </div>
      `}).join(``),c=1;o.map(([g,l],h)=>{let b=s[h%s.length],m=l.map(a=>{let C=a.mrpPrice&&a.mrpPrice>0?a.mrpPrice:a.price*2.22,P=a.discountPrice||a.price;return`
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
          <div class="category-header" style="background-color: ${b};">
            <span>${h+1}. ${g.toUpperCase()}</span>
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
              ${m}
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
        ${u}
      </div>
    </div>

    <!-- DETAILED CATEGORY TABLES -->
    ${o.map(([g,l],h)=>{let b=s[h%s.length],m=l.map(a=>{let C=a.mrpPrice&&a.mrpPrice>0?a.mrpPrice:a.price*2.22,P=a.discountPrice||a.price;return`
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
          <div class="category-header" style="background-color: ${b};">
            <span>${h+1}. ${g.toUpperCase()}</span>
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
              ${m}
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
    `;let f=document.createElement(`div`);f.style.flex=`1`,f.style.overflowY=`auto`,f.style.padding=`16px`,f.style.background=`#F8FAFC`,f.innerHTML=L,d.appendChild(p),d.appendChild(f),n.appendChild(d),document.body.appendChild(n);let B=()=>{document.body.contains(n)&&document.body.removeChild(n)},D=()=>{window.print()},A=p.querySelector(`#download-pdf-now-btn`),M=p.querySelector(`#close-modal-btn`);A&&A.addEventListener(`click`,D),M&&M.addEventListener(`click`,B)}static ɵfac=function(e){return new(e||k)(E(zy))};static ɵprov=M({token:k,factory:k.ɵfac,providedIn:`root`})};var S=class d{constructor(e){this.productService=e;this.loadCartFromStorage(),this.loadLastOrderFromStorage()}productService;MIN_ORDER_AMOUNT=2500;STORAGE_KEY_CART=`kc_cart_items_v1`;STORAGE_KEY_LAST_ORDER=`kc_last_order_v1`;cartItemsSignal=re([]);toastMessage=re(``);toastVisible=re(!1);toastTimeout;lastOrder=re(null);loadCartFromStorage(){try{if(typeof window<`u`&&window.localStorage){let e=localStorage.getItem(this.STORAGE_KEY_CART);if(e){let t=JSON.parse(e);Array.isArray(t)&&this.cartItemsSignal.set(t)}}}catch(e){console.error(`Error loading cart from localStorage:`,e)}}saveCartToStorage(e){try{typeof window<`u`&&window.localStorage&&localStorage.setItem(this.STORAGE_KEY_CART,JSON.stringify(e))}catch(t){console.error(`Error saving cart to localStorage:`,t)}}loadLastOrderFromStorage(){try{if(typeof window<`u`){let e=sessionStorage.getItem(this.STORAGE_KEY_LAST_ORDER)||localStorage.getItem(this.STORAGE_KEY_LAST_ORDER);if(e){let t=JSON.parse(e);t&&t.orderId&&this.lastOrder.set(t)}}}catch(e){console.error(`Error loading last order from storage:`,e)}}saveLastOrderToStorage(e){try{if(typeof window<`u`)if(e){let t=JSON.stringify(e);sessionStorage.setItem(this.STORAGE_KEY_LAST_ORDER,t),localStorage.setItem(this.STORAGE_KEY_LAST_ORDER,t)}else sessionStorage.removeItem(this.STORAGE_KEY_LAST_ORDER),localStorage.removeItem(this.STORAGE_KEY_LAST_ORDER)}catch(t){console.error(`Error saving last order to storage:`,t)}}get cartItems(){return this.cartItemsSignal.asReadonly()}cartCount=hi(()=>this.cartItemsSignal().reduce((e,t)=>e+t.qty,0));cartSubtotal=hi(()=>(this.productService.productsLoadedSignal(),this.cartItemsSignal().reduce((e,t)=>{let r=this.productService.getProductByCode(t.code);return e+(r?r.price*t.qty:0)},0)));cartDiscount=hi(()=>0);cartTotal=hi(()=>this.cartSubtotal());isMinimumOrderMet=hi(()=>this.cartTotal()>=this.MIN_ORDER_AMOUNT);minOrderShortfall=hi(()=>Math.max(0,this.MIN_ORDER_AMOUNT-this.cartTotal()));getItemQty(e){let t=this.cartItemsSignal().find(r=>r.code===e);return t?t.qty:0}addToCart(e,t=1){let r=[...this.cartItemsSignal()],a=r.findIndex(c=>c.code===e);a>-1?r[a]=O(m({},r[a]),{qty:r[a].qty+t}):r.push({code:e,qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r),this.showToast(`Added to cart`)}decrementQty(e){let t=[...this.cartItemsSignal()],r=t.findIndex(a=>a.code===e);r>-1&&(t[r].qty>1?(t[r]=O(m({},t[r]),{qty:t[r].qty-1}),this.cartItemsSignal.set(t),this.saveCartToStorage(t)):this.removeFromCart(e))}removeFromCart(e){let t=this.cartItemsSignal().filter(r=>r.code!==e);this.cartItemsSignal.set(t),this.saveCartToStorage(t)}setQty(e,t){if(t<1){this.removeFromCart(e);return}let r=[...this.cartItemsSignal()],a=r.findIndex(c=>c.code===e);a>-1?(r[a]=O(m({},r[a]),{qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r)):(r.push({code:e,qty:t}),this.cartItemsSignal.set(r),this.saveCartToStorage(r))}clearCart(){this.cartItemsSignal.set([]),this.saveCartToStorage([])}showToast(e){this.toastMessage.set(e),this.toastVisible.set(!0),this.toastTimeout&&clearTimeout(this.toastTimeout),this.toastTimeout=setTimeout(()=>{this.toastVisible.set(!1)},1800)}setLastOrder(e){this.lastOrder.set(e),this.saveLastOrderToStorage(e)}static ɵfac=function(t){return new(t||d)(E(N))};static ɵprov=M({token:d,factory:d.ɵfac,providedIn:`root`})};var x=(e,r)=>{let i=p$1(p),a=p$1(vt);return i.isAuthenticated()?!0:(a.navigate([`/admin/login`]),!1)};var te=[{path:``,redirectTo:`home`,pathMatch:`full`},{path:`home`,loadComponent:()=>import(`./chunk-nOxFaqAF.js`).then(e=>e.HomeComponent)},{path:`listing`,loadComponent:()=>import(`./chunk-DiSDb1vS.js`).then(e=>e.ListingComponent)},{path:`quick-order`,loadComponent:()=>import(`./chunk-Ds6rmB9f.js`).then(e=>e.QuickOrderComponent)},{path:`category`,redirectTo:`category/all`,pathMatch:`full`},{path:`category/:id`,loadComponent:()=>import(`./chunk-ANrT79dH.js`).then(e=>e.CategoryComponent)},{path:`detail/:code`,loadComponent:()=>import(`./chunk-CR8fHowC.js`).then(e=>e.DetailComponent)},{path:`cart`,loadComponent:()=>import(`./chunk-DpP5jZXZ.js`).then(e=>e.CartComponent)},{path:`checkout`,loadComponent:()=>import(`./chunk-D9gBpkDa.js`).then(e=>e.CheckoutComponent)},{path:`confirmation`,loadComponent:()=>import(`./chunk-DsDbdlfj.js`).then(e=>e.ConfirmationComponent)},{path:`admin/login`,loadComponent:()=>import(`./chunk-DnkqORv3.js`).then(e=>e.LoginComponent)},{path:`admin/dashboard`,loadComponent:()=>import(`./chunk-BEYdU-HD.js`).then(e=>e.DashboardComponent),canActivate:[x]},{path:`admin/products`,loadComponent:()=>import(`./chunk-Dhy_IPA6.js`).then(e=>e.AdminProductsComponent),canActivate:[x]},{path:`admin/customers`,loadComponent:()=>import(`./chunk-BRnRf4eQ.js`).then(e=>e.CustomersComponent),canActivate:[x]},{path:`admin/settings`,loadComponent:()=>import(`./chunk-Bs-XnOcW.js`).then(e=>e.AdminSettingsComponent),canActivate:[x]},{path:`**`,redirectTo:`home`}];var ne=(e,r)=>{let a=p$1(p).getToken();if(a)return r(e.clone({setHeaders:{Authorization:`Bearer ${a}`}}));return r(e)};var ie={providers:[lw(),FN(te),eM(tM([ne]))]};var ce=()=>({exact:!0});var I=class e{constructor(r,i){this.cartService=r;this.paymentSettingsService=i}cartService;paymentSettingsService;static ɵfac=function(i){return new(i||e)(X(S),X(d))};static ɵcmp=Bd({type:e,selectors:[[`app-header`]],decls:32,vars:4,consts:[[1,`site-header`],[1,`wrap`],[1,`header-inner`],[`routerLink`,`/home`,`aria-label`,`Karthick Crackers, go to home`,1,`brand`],[`src`,`assets/images/karthick-crackers-logo.jpg`,`alt`,`Karthick Crackers Logo`,1,`brand-mark`],[1,`brand-word`],[`aria-label`,`Primary`,1,`main-nav`],[`routerLink`,`/home`,`routerLinkActive`,`is-current`,1,`nav-link`,3,`routerLinkActiveOptions`],[`routerLink`,`/quick-order`,`routerLinkActive`,`is-current`,1,`nav-link`,2,`color`,`var(--mustard-2)`,`font-weight`,`700`],[`routerLink`,`/listing`,`routerLinkActive`,`is-current`,1,`nav-link`],[`routerLink`,`/category/all`,`routerLinkActive`,`is-current`,1,`nav-link`],[1,`header-actions`],[`target`,`_blank`,1,`btn`,`btn-whatsapp`,`btn-sm`,3,`href`],[`viewBox`,`0 0 24 24`,`fill`,`currentColor`],[`d`,`M12 2C6.48 2 2 6.36 2 11.74c0 2.07.62 3.99 1.68 5.6L2 22l4.85-1.55A10.1 10.1 0 0 0 12 21.48c5.52 0 10-4.36 10-9.74S17.52 2 12 2Zm0 17.7c-1.65 0-3.2-.46-4.52-1.26l-.32-.19-3.1.99.97-3.05-.2-.32a7.86 7.86 0 0 1-1.24-4.13c0-4.4 3.72-7.98 8.41-7.98s8.41 3.58 8.41 7.98-3.72 7.96-8.41 7.96Zm4.53-5.87c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.13-1.06-.4-2.02-1.26-.75-.68-1.25-1.51-1.4-1.77-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.37-.77-1.87-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.11s.9 2.45 1.02 2.62c.13.17 1.77 2.77 4.29 3.78.6.26 1.07.42 1.43.53.6.19 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3Z`],[`routerLink`,`/cart`,`aria-label`,`View cart`,1,`icon-btn`],[`width`,`17`,`height`,`17`,`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`1.8`],[`cx`,`9`,`cy`,`21`,`r`,`1.4`],[`cx`,`18`,`cy`,`21`,`r`,`1.4`],[`d`,`M2.5 3h2.4l2.6 12.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7.2H6.2`],[1,`cart-count`]],template:function(i,a){i&1&&(wa(0,`header`,0)(1,`div`,1)(2,`div`,2)(3,`a`,3),Ba(4,`img`,4),wa(5,`div`,5)(6,`b`),HS(7,`Karthick Crackers`),Gd(),wa(8,`span`),HS(9,`SIVAKASI · SINCE 2010`),Gd()()(),wa(10,`nav`,6)(11,`a`,7),HS(12,`Home`),Gd(),wa(13,`a`,8),HS(14,`⚡ Quick order`),Gd(),wa(15,`a`,9),HS(16,`Shop all`),Gd(),wa(17,`a`,10),HS(18,`Categories`),Gd()(),wa(19,`div`,11)(20,`a`,12),Up(),wa(21,`svg`,13),Ba(22,`path`,14),Gd(),Bp(),wa(23,`span`),HS(24,`WhatsApp`),Gd()(),wa(25,`a`,15),Up(),wa(26,`svg`,16),Ba(27,`circle`,17)(28,`circle`,18)(29,`path`,19),Gd(),Bp(),wa(30,`span`,20),HS(31),Gd()()()()()()),i&2&&(hC(11),Iv(`routerLinkActiveOptions`,eT(3,ce)),hC(9),Iv(`href`,`https://wa.me/`+a.paymentSettingsService.cleanPhoneSignal(),Sm),hC(11),xv(a.cartService.cartCount()))},dependencies:[wy,jN,zc,kN],encapsulation:2})};var pe=e=>[`/category`,e];var le=(e,r)=>r.id;function se(e,r){if(e&1&&(wa(0,`li`)(1,`a`,23),HS(2),Gd()()),e&2){let i=r.$implicit;hC(),Iv(`routerLink`,tT(2,pe,i.id)),hC(),xv(i.name)}}var R=class e{constructor(r,i){this.productService=r;this.paymentSettingsService=i}productService;paymentSettingsService;categories=[];ngOnInit(){this.productService.fetchCategories().subscribe(r=>{this.categories=r.slice(0,6)})}static ɵfac=function(i){return new(i||e)(X(N),X(d))};static ɵcmp=Bd({type:e,selectors:[[`app-footer`]],decls:63,vars:2,consts:[[`id`,`site-footer`,1,`site-footer`],[1,`wrap`],[1,`footer-grid`],[1,`footer-brand`],[`routerLink`,`/home`,1,`brand`],[`src`,`assets/images/karthick-crackers-logo.jpg`,`alt`,`Karthick Crackers Logo`,1,`brand-mark`],[1,`brand-word`],[1,`footer-col`],[`routerLink`,`/home`],[`routerLink`,`/quick-order`,2,`color`,`var(--mustard-2)`,`font-weight`,`700`],[`routerLink`,`/listing`],[`routerLink`,`/cart`],[1,`footer-contact`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`1.6`],[`d`,`M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.7 2Z`],[2,`color`,`inherit`,`text-decoration`,`none`,3,`href`],[`x`,`2`,`y`,`4`,`width`,`20`,`height`,`16`,`rx`,`2`],[`d`,`m2 7 10 6 10-6`],[`href`,`https://www.google.com/maps/place/Karthick+Crackers/@9.4209365,77.7371372,783m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3b06c5c4d311314b:0x9b8974031480aa69!8m2!3d9.4209365!4d77.7371372!16s%2Fg%2F11zypv1z4_!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D`,`target`,`_blank`,2,`color`,`inherit`,`text-decoration`,`none`,`display`,`flex`,`align-items`,`flex-start`,`gap`,`8px`],[`d`,`M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z`],[`cx`,`12`,`cy`,`10`,`r`,`3`],[1,`footer-bottom`],[1,`footer-note`],[3,`routerLink`]],template:function(i,a){i&1&&(wa(0,`footer`,0)(1,`div`,1)(2,`div`,2)(3,`div`,3)(4,`a`,4),Ba(5,`img`,5),wa(6,`div`,6)(7,`b`),HS(8,`Karthick Crackers`),Gd(),wa(9,`span`),HS(10,`SIVAKASI · SINCE 2010`),Gd()()(),wa(11,`p`),HS(12,`Family-run fireworks manufacturer and retailer based in Sivakasi, Tamil Nadu — supplying tested, safety-compliant crackers across South India.`),Gd()(),wa(13,`div`,7)(14,`h5`),HS(15,`Quick links`),Gd(),wa(16,`ul`)(17,`li`)(18,`a`,8),HS(19,`Home`),Gd()(),wa(20,`li`)(21,`a`,9),HS(22,`⚡ Quick order sheet`),Gd()(),wa(23,`li`)(24,`a`,10),HS(25,`Shop all`),Gd()(),wa(26,`li`)(27,`a`,11),HS(28,`Your cart`),Gd()(),wa(29,`li`)(30,`a`,8),HS(31,`Bulk / wholesale orders`),Gd()()()(),wa(32,`div`,7)(33,`h5`),HS(34,`Categories`),Gd(),wa(35,`ul`),gS(36,se,3,4,`li`,null,le),Gd()(),wa(38,`div`,7)(39,`h5`),HS(40,`Get in touch`),Gd(),wa(41,`ul`,12)(42,`li`),Up(),wa(43,`svg`,13),Ba(44,`path`,14),Gd(),Bp(),wa(45,`a`,15),HS(46),Gd()(),wa(47,`li`),Up(),wa(48,`svg`,13),Ba(49,`rect`,16)(50,`path`,17),Gd(),HS(51,`orders.karthick.crackers@gmail.com`),Gd(),Bp(),wa(52,`li`)(53,`a`,18),Up(),wa(54,`svg`,13),Ba(55,`path`,19)(56,`circle`,20),Gd(),HS(57,`3/347/U, Inthira Group House, Maraneri Village, Sivakasi - 626124`),Gd()()()()(),Bp(),wa(58,`div`,21)(59,`span`),HS(60,`© 2026 Karthick Crackers. All rights reserved.`),Gd()()(),wa(61,`div`,22),HS(62,`Fireworks sale is subject to state and local regulations. Please use crackers responsibly, away from dry vegetation, and keep water nearby.`),Gd()()),i&2&&(hC(36),mS(a.categories),hC(9),Iv(`href`,`tel:+`+a.paymentSettingsService.cleanPhoneSignal(),Sm),hC(),xv(a.paymentSettingsService.displayPhoneSignal()))},dependencies:[wy,jN,zc],encapsulation:2})};var T=class e{constructor(r){this.cartService=r}cartService;static ɵfac=function(i){return new(i||e)(X(S))};static ɵcmp=Bd({type:e,selectors:[[`app-toast`]],decls:5,vars:3,consts:[[1,`toast`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`2`],[`d`,`M20 6 9 17l-5-5`]],template:function(i,a){i&1&&(qd(0,`div`,0),Up(),qd(1,`svg`,1),Cv(2,`path`,2),Wd(),Bp(),qd(3,`span`),HS(4),Wd()()),i&2&&(Rv(`is-show`,a.cartService.toastVisible()),hC(4),xv(a.cartService.toastMessage()))},dependencies:[wy],encapsulation:2})};var D=class e{constructor(r){this.paymentSettingsService=r}paymentSettingsService;static ɵfac=function(i){return new(i||e)(X(d))};static ɵcmp=Bd({type:e,selectors:[[`app-floating-contact`]],decls:8,vars:6,consts:[[1,`floating-contact-widget`],[`target`,`_blank`,1,`float-icon-btn`,`float-whatsapp`,3,`href`,`title`],[1,`pulse-ring`],[`viewBox`,`0 0 24 24`,`fill`,`currentColor`,`width`,`26`,`height`,`26`],[`d`,`M12 2C6.48 2 2 6.36 2 11.74c0 2.07.62 3.99 1.68 5.6L2 22l4.85-1.55A10.1 10.1 0 0 0 12 21.48c5.52 0 10-4.36 10-9.74S17.52 2 12 2Zm0 17.7c-1.65 0-3.2-.46-4.52-1.26l-.32-.19-3.1.99.97-3.05-.2-.32a7.86 7.86 0 0 1-1.24-4.13c0-4.4 3.72-7.98 8.41-7.98s8.41 3.58 8.41 7.98-3.72 7.96-8.41 7.96Zm4.53-5.87c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.79.98-.15.17-.29.19-.54.06-.25-.13-1.06-.4-2.02-1.26-.75-.68-1.25-1.51-1.4-1.77-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.37-.77-1.87-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.11s.9 2.45 1.02 2.62c.13.17 1.77 2.77 4.29 3.78.6.26 1.07.42 1.43.53.6.19 1.15.17 1.58.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.11-.23-.17-.48-.3Z`],[1,`float-icon-btn`,`float-call`,3,`href`,`title`],[`viewBox`,`0 0 24 24`,`fill`,`none`,`stroke`,`currentColor`,`stroke-width`,`2.2`,`width`,`22`,`height`,`22`],[`d`,`M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z`]],template:function(i,a){i&1&&(qd(0,`div`,0)(1,`a`,1),Cv(2,`div`,2),Up(),qd(3,`svg`,3),Cv(4,`path`,4),Wd()(),Bp(),qd(5,`a`,5),Up(),qd(6,`svg`,6),Cv(7,`path`,7),Wd()()()),i&2&&(hC(),Sv(`href`,`https://wa.me/`+a.paymentSettingsService.cleanPhoneSignal()+`?text=Hello%20Karthick%20Crackers%2C%20I%20have%20an%20enquiry%20regarding%20fireworks.`,Sm)(`title`,`Chat on WhatsApp (`+a.paymentSettingsService.displayPhoneSignal()+`)`),Ua(`aria-label`,`Chat on WhatsApp `+a.paymentSettingsService.displayPhoneSignal()),hC(4),Sv(`href`,`tel:+`+a.paymentSettingsService.cleanPhoneSignal(),Sm)(`title`,`Call `+a.paymentSettingsService.displayPhoneSignal()),Ua(`aria-label`,`Call `+a.paymentSettingsService.displayPhoneSignal()))},dependencies:[wy],styles:[`.floating-contact-widget[_ngcontent-%COMP%]{position:fixed;bottom:24px;left:24px;z-index:99999;display:flex;flex-direction:column;gap:12px;align-items:center;pointer-events:none}.float-icon-btn[_ngcontent-%COMP%]{pointer-events:auto;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;box-shadow:0 8px 20px #00000073,0 2px 6px #0000004d;transition:all .25s cubic-bezier(.22,.9,.3,1);position:relative}.float-icon-btn[_ngcontent-%COMP%]:hover{transform:translateY(-3px) scale(1.1);box-shadow:0 12px 28px #0009}.float-whatsapp[_ngcontent-%COMP%]{background:linear-gradient(135deg,#25d366,#128c7e);border:1px solid rgba(255,255,255,.25)}.float-whatsapp[_ngcontent-%COMP%]   .pulse-ring[_ngcontent-%COMP%]{position:absolute;inset:-5px;border-radius:50%;border:2px solid #25D366;animation:_ngcontent-%COMP%_waPulse 2s cubic-bezier(.22,.9,.3,1) infinite;pointer-events:none}.float-call[_ngcontent-%COMP%]{background:linear-gradient(135deg,#f5c242,#e5a93c);color:#000;border:1px solid rgba(255,255,255,.4)}.float-call[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%]{stroke:#000}@keyframes _ngcontent-%COMP%_waPulse{0%{transform:scale(.92);opacity:.8}50%{transform:scale(1.15);opacity:0}to{transform:scale(.92);opacity:0}}@media(max-width:768px){.floating-contact-widget[_ngcontent-%COMP%]{bottom:78px;left:14px;gap:10px}.float-icon-btn[_ngcontent-%COMP%]{width:46px;height:46px}.float-icon-btn[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%]{width:22px;height:22px}}`]})};function de(e,r){e&1&&(wa(0,`div`,4)(1,`span`),HS(2,`9:41`),Gd(),wa(3,`span`),HS(4,`●●● ▲ ■`),Gd()())}function ue(e,r){e&1&&Ba(0,`app-header`)}function fe(e,r){e&1&&Ba(0,`app-footer`)}function he(e,r){e&1&&Ba(0,`app-floating-contact`)}M_(class e{constructor(r){this.router=r;this.checkAdminRoute(this.router.url),this.router.events.pipe(Pe(i=>i instanceof Ge)).subscribe(i=>{this.checkAdminRoute(i.urlAfterRedirects||i.url)})}router;title=`Karthick Crackers`;isAdminRoute=re(!1);checkAdminRoute(r){this.isAdminRoute.set(r.startsWith(`/admin`))}static ɵfac=function(i){return new(i||e)(X(vt))};static ɵcmp=Bd({type:e,selectors:[[`app-root`]],decls:9,vars:10,consts:[[`id`,`frame-outer`],[`id`,`viewport`],[`class`,`phone-chrome`,4,`ngIf`],[4,`ngIf`],[1,`phone-chrome`]],template:function(i,a){i&1&&(wa(0,`div`,0)(1,`div`,1),Ev(2,de,5,0,`div`,2)(3,ue,1,0,`app-header`,3),wa(4,`main`),Ba(5,`router-outlet`),Gd(),Ev(6,fe,1,0,`app-footer`,3),Gd()(),Ev(7,he,1,0,`app-floating-contact`,3),Ba(8,`app-toast`)),i&2&&(Rv(`admin-layout`,a.isAdminRoute()),hC(),Rv(`admin-viewport`,a.isAdminRoute()),hC(),Iv(`ngIf`,!a.isAdminRoute()),hC(),Iv(`ngIf`,!a.isAdminRoute()),hC(),Rv(`admin-main`,a.isAdminRoute()),hC(2),Iv(`ngIf`,!a.isAdminRoute()),hC(),Iv(`ngIf`,!a.isAdminRoute()))},dependencies:[wy,s_,eh,I,R,T,D],encapsulation:2})},ie).catch(e=>console.error(e));export{p as i,N as n,d as r,S as t};