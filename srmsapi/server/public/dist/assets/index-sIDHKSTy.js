(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&l(n)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const Ta=`
<!-- App shell: header (full width) -> content row (sidebar + main) -> footer (full width) -->
<div class="app-shell d-flex flex-column min-vh-100">

  <!-- Full-width header wrapper -->
  <div class="header-full w-100">
    <!-- Header component renders its own inner content; wrapper ensures full page width -->
    <Header :user="user" />
  </div>

  <!-- Content row: sidebar + main. main contains a container for aligned page content -->
  <div class="content-row d-flex flex-grow-1">
    <!-- Sidebar column (keeps sidebar between header & footer) -->
    <div class="sidebar-col">
      <Sidebar />
    </div>

    <!-- Main content area: keep content aligned using container / container-fluid -->
    <main class="main-content flex-fill p-4">
      <div class="container-fluid">
        <slot></slot>
      </div>
    </main>
  </div>

  <!-- Full-width footer wrapper -->
  <div class="footer-full w-100">
    <Footer />
  </div>

</div>
`,Pa=`
<header class="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
  <!-- Left: School info -->
  <div class="d-flex align-items-center">
    <img :src="logoUrl" alt="School Logo" height="40" class="me-2" />
    <h5 class="mb-0 fw-bold">{{ user.schoolName || 'School Result Management System' }}</h5>
  </div>

  <!-- Right: User dropdown -->
  <div class="dropdown">
    <button
      class="btn bg-transparent border-0 d-flex align-items-center dropdown-toggle"
      type="button"
      id="userDropdown"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <img
        :src="user.image || '/assets/avatar.png'"
        alt="User Avatar"
        class="rounded-circle me-2"
        height="36"
        width="36"
      />
      <span class="fw-semibold text-muted">{{ user.email|| user.username || 'Guest' }}</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
      <li>
        <a class="dropdown-item d-flex align-items-center" href="#/profile">
          <i class="fa-solid fa-user me-2 text-secondary"></i>
          Profile
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <button class="dropdown-item d-flex align-items-center text-danger" @click="handleLogout">
          <i class="fa-solid fa-right-from-bracket me-2"></i>
          Logout
        </button>
      </li>
    </ul>
  </div>
</header>


`,{onMounted:Ma,computed:si,ref:cs}=Vue,{useRouter:Ca}=VueRouter,La={name:"Header",props:{user:{type:Object,required:!0}},template:Pa,setup(){const e=Ca(),t=cs("/assets/school-logo.png"),s=cs({});return Ma(()=>{const a=JSON.parse(localStorage.getItem("user"))||JSON.parse(sessionStorage.getItem("user"))||{};s.value=a}),{logoUrl:t,user:s,handleLogout:()=>{var a;localStorage.removeItem("token"),localStorage.removeItem("user"),sessionStorage.clear(),(a=toast==null?void 0:toast.success)==null||a.call(toast,"Logged out successfully"),e.push("/")}}}},Oa=`
<div class="sidebar-wrap">
  <!-- overlay for mobile when sidebar is open -->
  <div v-if="mobile && mobileOpen" class="sidebar-overlay" @click="closeMobile"></div>

  <aside :class="['sidebar', { collapsed: collapsed, mobileOpen: mobileOpen && mobile }]" role="navigation">
    <div class="sidebar-top d-flex align-items-center justify-content-between px-3 py-2">
      <div class="d-flex align-items-center">
        <i class="fa-solid fa-school fa-lg me-2"></i>
        <span class="sidebar-brand" v-if="!collapsed">School</span>
      </div>

      <!-- toggle: visible on both mobile (to close) and desktop (to collapse) -->
      <button class="btn btn-sm btn-outline-secondary sidebar-toggle mr-2 p-0" @click="toggle">
        <i :class="collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'"></i>
      </button>
    </div>

    <nav class="nav flex-column px-2 py-3">
      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/dashboard') }" href="/dashboard">
        <i class="fa-solid fa-tachometer-alt me-3"></i>
        <span v-if="!collapsed">Dashboard</span>
      </a>

      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/students') }" href="/students">
        <i class="fa-solid fa-user-graduate me-3"></i>
        <span v-if="!collapsed">Students</span>
      </a>

      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/students/import') }" href="/students/import">
        <i class="fa-solid fa-upload me-3"></i>
        <span v-if="!collapsed">Import Students</span>
      </a>

      <!-- Academics group (collapsible) -->
      <div class="sidebar-section px-2 pt-2 mb-2">
        <div class="d-flex align-items-center justify-content-between px-2 py-2" style="cursor: pointer;" @click="toggleAcademics">
          <div class="small" v-if="!collapsed" style="color: white;">
            <strong>ACADEMICS</strong>
          </div>
          <button class="btn btn-sm btn-link p-0" style="font-size:12px; color: white;" @click.stop="toggleAcademics" v-if="!collapsed">
            <i :class="academicsOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>

        <div :class="{ 'collapse': !academicsOpen && !collapsed }" style="overflow: hidden;">
          <a class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/subjects') }" href="/subjects">
            <i class="fa-solid fa-book-open me-3"></i>
            <span v-if="!collapsed">Subjects</span>
          </a>

          <a class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/courses') }" href="/courses">
            <i class="fa-solid fa-graduation-cap me-3"></i>
            <span v-if="!collapsed">Courses</span>
          </a>

          <a class="nav-link d-flex align-items-center ps-3" :class="{ active: isActive('/exams') }" href="/exams">
            <i class="fa-solid fa-file-circle-check me-3"></i>
            <span v-if="!collapsed">Exams</span>
          </a>

          <!-- Results with sub-items -->
          <div class="nav-item">
            <div class="d-flex align-items-center justify-content-between px-2 py-1" style="cursor: pointer;">
              <a class="nav-link flex-grow-1 d-flex align-items-center ps-3" :class="{ active: isActive('/results') || isActive('/results/student-wise') || isActive('/results/course-wise') || isActive('/results/subject-wise') || isActive('/results/generate') }" href="#" @click.prevent="toggleResults">
                <i class="fa-solid fa-chart-line me-3"></i>
                <span v-if="!collapsed">Results</span>
              </a>
              <button class="btn btn-sm btn-link text-secondary p-0" style="font-size:12px;" @click.prevent.stop="toggleResults" v-if="!collapsed">
                <i :class="resultsOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              </button>
            </div>

            <div :class="{ 'collapse': !resultsOpen && !collapsed }" style="overflow: hidden;">
              <a class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/student-wise') }" href="/results/student-wise">
                <i class="fa-solid fa-user me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Student-wise</span>
              </a>
              <a class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/course-wise') }" href="/results/course-wise">
                <i class="fa-solid fa-book me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Course-wise</span>
              </a>
              <a class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/subject-wise') }" href="/results/subject-wise">
                <i class="fa-solid fa-book-open me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Subject-wise</span>
              </a>
              <a class="nav-link nav-link-sm d-flex align-items-center ps-5" :class="{ active: isActive('/results/generate') }" href="/results/generate">
                <i class="fa-solid fa-file-export me-2" style="font-size:0.85rem;"></i>
                <span v-if="!collapsed" style="font-size:0.9rem;">Generate Marksheet</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Book top-level group -->
      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/results/result-book') || isActive('/results/result-book/class-wise') || isActive('/results/result-book/student-wise') }" href="#" @click.prevent="toggleResultBook">
        <i class="fa-solid fa-book me-3"></i>
        <span v-if="!collapsed">Result Book</span>
      </a>
      <div :class="{ 'collapse': !resultBookOpen && !collapsed }" style="overflow: hidden;">
        <a class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/results/result-book/class-wise') }" href="/results/result-book/class-wise">
          <i class="fa-solid fa-layer-group me-2" style="font-size:0.85rem"></i>
          <span v-if="!collapsed" style="font-size:0.9rem;">Class-wise</span>
        </a>
        <a class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/results/result-book/student-wise') }" href="/results/result-book/student-wise">
          <i class="fa-solid fa-user me-2" style="font-size:0.85rem"></i>
          <span v-if="!collapsed" style="font-size:0.9rem;">Student-wise</span>
        </a>
      </div>

      <hr class="my-1" />

      <!-- Templates with sub-items -->
      <div class="sidebar-section px-2 pt-2 mb-2">
        <div class="d-flex align-items-center justify-content-between px-2 py-2" style="cursor: pointer;" @click="toggleTemplates">
          <div class="small" v-if="!collapsed" style="color: white;">
            <strong>TEMPLATES</strong>
          </div>
          <button class="btn btn-sm btn-link p-0" style="font-size:12px; color: white;" @click.stop="toggleTemplates" v-if="!collapsed">
            <i :class="templatesOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>

        <div :class="{ 'collapse': !templatesOpen && !collapsed }" style="overflow: hidden;">
          <a class="nav-link nav-link-sm d-flex align-items-center ps-3" :class="{ active: isActive('/templates/marksheets') }" href="/templates/marksheets">
            <i class="fa-solid fa-file-lines me-3" style="font-size:0.9rem;"></i>
            <span v-if="!collapsed" style="font-size:0.9rem;">Marksheets</span>
          </a>
        </div>
      </div>

      <hr class="my-2" />

      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/school/profile') }" href="/school/profile">
        <i class="fa-solid fa-landmark me-3"></i>
        <span v-if="!collapsed">School Profile</span>
      </a>

      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/settings') }" href="/settings">
        <i class="fa-solid fa-gear me-3"></i>
        <span v-if="!collapsed">Settings</span>
      </a>

      <a class="nav-link d-flex align-items-center" :class="{ active: isActive('/backup') }" href="/backup">
        <i class="fa-solid fa-cloud-arrow-up me-3"></i>
        <span v-if="!collapsed">Backup</span>
      </a>
    </nav>

    <div class="sidebar-bottom px-3 py-3" v-if="!collapsed">
      <small class="text-muted">v1.0 • © Hubi-Infotech</small>
    </div>
  </aside>
</div>
`,{ref:Ae,onMounted:Ia,onUnmounted:Na,computed:ai,watch:Fa}=Vue,{useRoute:$a}=VueRouter,Ua={name:"Sidebar",template:Oa,setup(){const e=$a(),t=Ae(!1),s=Ae(window.innerWidth<992),l=Ae(!1),a=()=>{s.value=window.innerWidth<992,s.value||(l.value=!1)};Ia(()=>{window.addEventListener("resize",a),s.value&&(t.value=!1),d(),i()}),Na(()=>{window.removeEventListener("resize",a)}),Fa(()=>e.path,()=>{d(),i()});const o=()=>{s.value?l.value=!l.value:t.value=!t.value},n=Ae(!0),r=()=>{n.value=!n.value},u=Ae(!1),c=()=>{u.value?u.value=!1:(u.value=!0,setTimeout(()=>{window.location.href="#/results/student-wise"},10))},m=Ae(!1),p=()=>{m.value?m.value=!1:(m.value=!0,setTimeout(()=>{window.location.href="#/templates/marksheets"},10))},b=Ae(!1),h=()=>{b.value?b.value=!1:(b.value=!0,setTimeout(()=>{window.location.href="#/results/result-book/class-wise"},10))},d=()=>{e.path.startsWith("/results")&&e.path!=="/results"?u.value=!0:u.value=!1},i=()=>{e.path.startsWith("/templates")?m.value=!0:m.value=!1};return{collapsed:t,mobile:s,mobileOpen:l,toggle:o,closeMobile:()=>{s.value&&(l.value=!1)},isActive:C=>{try{return e.path===C}catch{return!1}},academicsOpen:n,toggleAcademics:r,resultsOpen:u,toggleResults:c,templatesOpen:m,toggleTemplates:p,resultBookOpen:b,toggleResultBook:h,updateResultBookOpenState:()=>{e.path.startsWith("/results/result-book")?b.value=!0:b.value=!1}}}},Da=`
<footer class="bg-dark text-white text-center py-3 mt-auto">
  <small>
    &copy; Hubi-Infotech 2025 — All Rights Reserved
  </small>
</footer>
`,Ba={name:"Footer",template:Da},{ref:Ha,onMounted:qa}=Vue,$s={name:"AppLayout",components:{Header:La,Sidebar:Ua,Footer:Ba},template:Ta,setup(){const e=Ha({name:"Admin User",email:"admin@example.com",image:"/assets/avatar.png"});return qa(()=>{}),{user:e}}},Ya=`
<div class='auth-bg d-flex align-items-center justify-content-center min-vh-70'>
  <div class='auth-card card shadow-sm p-4' style=' width:100%; border-radius:10px;'>
    <slot></slot>
  </div>
</div>
`,za={name:"AuthLayout",template:Ya},{onMounted:Va,computed:Wa}=Vue,{useRoute:Xa}=VueRouter,Ja={name:"App",components:{AppLayout:$s,AuthLayout:za},setup(){const e=Xa(),t=Wa(()=>e.path.includes("/login")||e.path.includes("/register")?"auth":"app");return Va(()=>{}),{layout:t}},template:`
    <div>
      <!-- Auth pages (Login/Register) -->
      <AuthLayout v-if="layout === 'auth'">
        <router-view :key="$route.fullPath"></router-view>
      </AuthLayout>

      <!-- Main app pages (Dashboard, Students, etc.) -->
      <AppLayout v-else>
        <router-view :key="$route.fullPath"></router-view>
      </AppLayout>
    </div>
  `};function Us(e,t){return function(){return e.apply(t,arguments)}}const{toString:Ka}=Object.prototype,{getPrototypeOf:Kt}=Object,{iterator:St,toStringTag:Ds}=Symbol,_t=(e=>t=>{const s=Ka.call(t);return e[s]||(e[s]=s.slice(8,-1).toLowerCase())})(Object.create(null)),ue=e=>(e=e.toLowerCase(),t=>_t(t)===e),kt=e=>t=>typeof t===e,{isArray:Ve}=Array,qe=kt("undefined");function nt(e){return e!==null&&!qe(e)&&e.constructor!==null&&!qe(e.constructor)&&re(e.constructor.isBuffer)&&e.constructor.isBuffer(e)}const Bs=ue("ArrayBuffer");function Ga(e){let t;return typeof ArrayBuffer<"u"&&ArrayBuffer.isView?t=ArrayBuffer.isView(e):t=e&&e.buffer&&Bs(e.buffer),t}const Qa=kt("string"),re=kt("function"),Hs=kt("number"),rt=e=>e!==null&&typeof e=="object",Za=e=>e===!0||e===!1,ht=e=>{if(_t(e)!=="object")return!1;const t=Kt(e);return(t===null||t===Object.prototype||Object.getPrototypeOf(t)===null)&&!(Ds in e)&&!(St in e)},el=e=>{if(!rt(e)||nt(e))return!1;try{return Object.keys(e).length===0&&Object.getPrototypeOf(e)===Object.prototype}catch{return!1}},tl=ue("Date"),sl=ue("File"),al=ue("Blob"),ll=ue("FileList"),ol=e=>rt(e)&&re(e.pipe),nl=e=>{let t;return e&&(typeof FormData=="function"&&e instanceof FormData||re(e.append)&&((t=_t(e))==="formdata"||t==="object"&&re(e.toString)&&e.toString()==="[object FormData]"))},rl=ue("URLSearchParams"),[il,cl,dl,ul]=["ReadableStream","Request","Response","Headers"].map(ue),ml=e=>e.trim?e.trim():e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"");function it(e,t,{allOwnKeys:s=!1}={}){if(e===null||typeof e>"u")return;let l,a;if(typeof e!="object"&&(e=[e]),Ve(e))for(l=0,a=e.length;l<a;l++)t.call(null,e[l],l,e);else{if(nt(e))return;const o=s?Object.getOwnPropertyNames(e):Object.keys(e),n=o.length;let r;for(l=0;l<n;l++)r=o[l],t.call(null,e[r],r,e)}}function qs(e,t){if(nt(e))return null;t=t.toLowerCase();const s=Object.keys(e);let l=s.length,a;for(;l-- >0;)if(a=s[l],t===a.toLowerCase())return a;return null}const Ce=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:global,Ys=e=>!qe(e)&&e!==Ce;function $t(){const{caseless:e,skipUndefined:t}=Ys(this)&&this||{},s={},l=(a,o)=>{const n=e&&qs(s,o)||o;ht(s[n])&&ht(a)?s[n]=$t(s[n],a):ht(a)?s[n]=$t({},a):Ve(a)?s[n]=a.slice():(!t||!qe(a))&&(s[n]=a)};for(let a=0,o=arguments.length;a<o;a++)arguments[a]&&it(arguments[a],l);return s}const fl=(e,t,s,{allOwnKeys:l}={})=>(it(t,(a,o)=>{s&&re(a)?e[o]=Us(a,s):e[o]=a},{allOwnKeys:l}),e),pl=e=>(e.charCodeAt(0)===65279&&(e=e.slice(1)),e),vl=(e,t,s,l)=>{e.prototype=Object.create(t.prototype,l),e.prototype.constructor=e,Object.defineProperty(e,"super",{value:t.prototype}),s&&Object.assign(e.prototype,s)},bl=(e,t,s,l)=>{let a,o,n;const r={};if(t=t||{},e==null)return t;do{for(a=Object.getOwnPropertyNames(e),o=a.length;o-- >0;)n=a[o],(!l||l(n,e,t))&&!r[n]&&(t[n]=e[n],r[n]=!0);e=s!==!1&&Kt(e)}while(e&&(!s||s(e,t))&&e!==Object.prototype);return t},hl=(e,t,s)=>{e=String(e),(s===void 0||s>e.length)&&(s=e.length),s-=t.length;const l=e.indexOf(t,s);return l!==-1&&l===s},gl=e=>{if(!e)return null;if(Ve(e))return e;let t=e.length;if(!Hs(t))return null;const s=new Array(t);for(;t-- >0;)s[t]=e[t];return s},yl=(e=>t=>e&&t instanceof e)(typeof Uint8Array<"u"&&Kt(Uint8Array)),xl=(e,t)=>{const l=(e&&e[St]).call(e);let a;for(;(a=l.next())&&!a.done;){const o=a.value;t.call(e,o[0],o[1])}},wl=(e,t)=>{let s;const l=[];for(;(s=e.exec(t))!==null;)l.push(s);return l},Sl=ue("HTMLFormElement"),_l=e=>e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,function(s,l,a){return l.toUpperCase()+a}),ds=(({hasOwnProperty:e})=>(t,s)=>e.call(t,s))(Object.prototype),kl=ue("RegExp"),zs=(e,t)=>{const s=Object.getOwnPropertyDescriptors(e),l={};it(s,(a,o)=>{let n;(n=t(a,o,e))!==!1&&(l[o]=n||a)}),Object.defineProperties(e,l)},El=e=>{zs(e,(t,s)=>{if(re(e)&&["arguments","caller","callee"].indexOf(s)!==-1)return!1;const l=e[s];if(re(l)){if(t.enumerable=!1,"writable"in t){t.writable=!1;return}t.set||(t.set=()=>{throw Error("Can not rewrite read-only method '"+s+"'")})}})},Al=(e,t)=>{const s={},l=a=>{a.forEach(o=>{s[o]=!0})};return Ve(e)?l(e):l(String(e).split(t)),s},jl=()=>{},Rl=(e,t)=>e!=null&&Number.isFinite(e=+e)?e:t;function Tl(e){return!!(e&&re(e.append)&&e[Ds]==="FormData"&&e[St])}const Pl=e=>{const t=new Array(10),s=(l,a)=>{if(rt(l)){if(t.indexOf(l)>=0)return;if(nt(l))return l;if(!("toJSON"in l)){t[a]=l;const o=Ve(l)?[]:{};return it(l,(n,r)=>{const u=s(n,a+1);!qe(u)&&(o[r]=u)}),t[a]=void 0,o}}return l};return s(e,0)},Ml=ue("AsyncFunction"),Cl=e=>e&&(rt(e)||re(e))&&re(e.then)&&re(e.catch),Vs=((e,t)=>e?setImmediate:t?((s,l)=>(Ce.addEventListener("message",({source:a,data:o})=>{a===Ce&&o===s&&l.length&&l.shift()()},!1),a=>{l.push(a),Ce.postMessage(s,"*")}))(`axios@${Math.random()}`,[]):s=>setTimeout(s))(typeof setImmediate=="function",re(Ce.postMessage)),Ll=typeof queueMicrotask<"u"?queueMicrotask.bind(Ce):typeof process<"u"&&process.nextTick||Vs,Ol=e=>e!=null&&re(e[St]),v={isArray:Ve,isArrayBuffer:Bs,isBuffer:nt,isFormData:nl,isArrayBufferView:Ga,isString:Qa,isNumber:Hs,isBoolean:Za,isObject:rt,isPlainObject:ht,isEmptyObject:el,isReadableStream:il,isRequest:cl,isResponse:dl,isHeaders:ul,isUndefined:qe,isDate:tl,isFile:sl,isBlob:al,isRegExp:kl,isFunction:re,isStream:ol,isURLSearchParams:rl,isTypedArray:yl,isFileList:ll,forEach:it,merge:$t,extend:fl,trim:ml,stripBOM:pl,inherits:vl,toFlatObject:bl,kindOf:_t,kindOfTest:ue,endsWith:hl,toArray:gl,forEachEntry:xl,matchAll:wl,isHTMLForm:Sl,hasOwnProperty:ds,hasOwnProp:ds,reduceDescriptors:zs,freezeMethods:El,toObjectSet:Al,toCamelCase:_l,noop:jl,toFiniteNumber:Rl,findKey:qs,global:Ce,isContextDefined:Ys,isSpecCompliantForm:Tl,toJSONObject:Pl,isAsyncFn:Ml,isThenable:Cl,setImmediate:Vs,asap:Ll,isIterable:Ol};function F(e,t,s,l,a){Error.call(this),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack,this.message=e,this.name="AxiosError",t&&(this.code=t),s&&(this.config=s),l&&(this.request=l),a&&(this.response=a,this.status=a.status?a.status:null)}v.inherits(F,Error,{toJSON:function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:v.toJSONObject(this.config),code:this.code,status:this.status}}});const Ws=F.prototype,Xs={};["ERR_BAD_OPTION_VALUE","ERR_BAD_OPTION","ECONNABORTED","ETIMEDOUT","ERR_NETWORK","ERR_FR_TOO_MANY_REDIRECTS","ERR_DEPRECATED","ERR_BAD_RESPONSE","ERR_BAD_REQUEST","ERR_CANCELED","ERR_NOT_SUPPORT","ERR_INVALID_URL"].forEach(e=>{Xs[e]={value:e}});Object.defineProperties(F,Xs);Object.defineProperty(Ws,"isAxiosError",{value:!0});F.from=(e,t,s,l,a,o)=>{const n=Object.create(Ws);v.toFlatObject(e,n,function(m){return m!==Error.prototype},c=>c!=="isAxiosError");const r=e&&e.message?e.message:"Error",u=t==null&&e?e.code:t;return F.call(n,r,u,s,l,a),e&&n.cause==null&&Object.defineProperty(n,"cause",{value:e,configurable:!0}),n.name=e&&e.name||"Error",o&&Object.assign(n,o),n};const Il=null;function Ut(e){return v.isPlainObject(e)||v.isArray(e)}function Js(e){return v.endsWith(e,"[]")?e.slice(0,-2):e}function us(e,t,s){return e?e.concat(t).map(function(a,o){return a=Js(a),!s&&o?"["+a+"]":a}).join(s?".":""):t}function Nl(e){return v.isArray(e)&&!e.some(Ut)}const Fl=v.toFlatObject(v,{},null,function(t){return/^is[A-Z]/.test(t)});function Et(e,t,s){if(!v.isObject(e))throw new TypeError("target must be an object");t=t||new FormData,s=v.toFlatObject(s,{metaTokens:!0,dots:!1,indexes:!1},!1,function(i,f){return!v.isUndefined(f[i])});const l=s.metaTokens,a=s.visitor||m,o=s.dots,n=s.indexes,u=(s.Blob||typeof Blob<"u"&&Blob)&&v.isSpecCompliantForm(t);if(!v.isFunction(a))throw new TypeError("visitor must be a function");function c(d){if(d===null)return"";if(v.isDate(d))return d.toISOString();if(v.isBoolean(d))return d.toString();if(!u&&v.isBlob(d))throw new F("Blob is not supported. Use a Buffer instead.");return v.isArrayBuffer(d)||v.isTypedArray(d)?u&&typeof Blob=="function"?new Blob([d]):Buffer.from(d):d}function m(d,i,f){let g=d;if(d&&!f&&typeof d=="object"){if(v.endsWith(i,"{}"))i=l?i:i.slice(0,-2),d=JSON.stringify(d);else if(v.isArray(d)&&Nl(d)||(v.isFileList(d)||v.endsWith(i,"[]"))&&(g=v.toArray(d)))return i=Js(i),g.forEach(function(C,j){!(v.isUndefined(C)||C===null)&&t.append(n===!0?us([i],j,o):n===null?i:i+"[]",c(C))}),!1}return Ut(d)?!0:(t.append(us(f,i,o),c(d)),!1)}const p=[],b=Object.assign(Fl,{defaultVisitor:m,convertValue:c,isVisitable:Ut});function h(d,i){if(!v.isUndefined(d)){if(p.indexOf(d)!==-1)throw Error("Circular reference detected in "+i.join("."));p.push(d),v.forEach(d,function(g,y){(!(v.isUndefined(g)||g===null)&&a.call(t,g,v.isString(y)?y.trim():y,i,b))===!0&&h(g,i?i.concat(y):[y])}),p.pop()}}if(!v.isObject(e))throw new TypeError("data must be an object");return h(e),t}function ms(e){const t={"!":"%21","'":"%27","(":"%28",")":"%29","~":"%7E","%20":"+","%00":"\0"};return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g,function(l){return t[l]})}function Gt(e,t){this._pairs=[],e&&Et(e,this,t)}const Ks=Gt.prototype;Ks.append=function(t,s){this._pairs.push([t,s])};Ks.toString=function(t){const s=t?function(l){return t.call(this,l,ms)}:ms;return this._pairs.map(function(a){return s(a[0])+"="+s(a[1])},"").join("&")};function $l(e){return encodeURIComponent(e).replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+")}function Gs(e,t,s){if(!t)return e;const l=s&&s.encode||$l;v.isFunction(s)&&(s={serialize:s});const a=s&&s.serialize;let o;if(a?o=a(t,s):o=v.isURLSearchParams(t)?t.toString():new Gt(t,s).toString(l),o){const n=e.indexOf("#");n!==-1&&(e=e.slice(0,n)),e+=(e.indexOf("?")===-1?"?":"&")+o}return e}class fs{constructor(){this.handlers=[]}use(t,s,l){return this.handlers.push({fulfilled:t,rejected:s,synchronous:l?l.synchronous:!1,runWhen:l?l.runWhen:null}),this.handlers.length-1}eject(t){this.handlers[t]&&(this.handlers[t]=null)}clear(){this.handlers&&(this.handlers=[])}forEach(t){v.forEach(this.handlers,function(l){l!==null&&t(l)})}}const Qs={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1},Ul=typeof URLSearchParams<"u"?URLSearchParams:Gt,Dl=typeof FormData<"u"?FormData:null,Bl=typeof Blob<"u"?Blob:null,Hl={isBrowser:!0,classes:{URLSearchParams:Ul,FormData:Dl,Blob:Bl},protocols:["http","https","file","blob","url","data"]},Qt=typeof window<"u"&&typeof document<"u",Dt=typeof navigator=="object"&&navigator||void 0,ql=Qt&&(!Dt||["ReactNative","NativeScript","NS"].indexOf(Dt.product)<0),Yl=typeof WorkerGlobalScope<"u"&&self instanceof WorkerGlobalScope&&typeof self.importScripts=="function",zl=Qt&&window.location.href||"http://localhost",Vl=Object.freeze(Object.defineProperty({__proto__:null,hasBrowserEnv:Qt,hasStandardBrowserEnv:ql,hasStandardBrowserWebWorkerEnv:Yl,navigator:Dt,origin:zl},Symbol.toStringTag,{value:"Module"})),te={...Vl,...Hl};function Wl(e,t){return Et(e,new te.classes.URLSearchParams,{visitor:function(s,l,a,o){return te.isNode&&v.isBuffer(s)?(this.append(l,s.toString("base64")),!1):o.defaultVisitor.apply(this,arguments)},...t})}function Xl(e){return v.matchAll(/\w+|\[(\w*)]/g,e).map(t=>t[0]==="[]"?"":t[1]||t[0])}function Jl(e){const t={},s=Object.keys(e);let l;const a=s.length;let o;for(l=0;l<a;l++)o=s[l],t[o]=e[o];return t}function Zs(e){function t(s,l,a,o){let n=s[o++];if(n==="__proto__")return!0;const r=Number.isFinite(+n),u=o>=s.length;return n=!n&&v.isArray(a)?a.length:n,u?(v.hasOwnProp(a,n)?a[n]=[a[n],l]:a[n]=l,!r):((!a[n]||!v.isObject(a[n]))&&(a[n]=[]),t(s,l,a[n],o)&&v.isArray(a[n])&&(a[n]=Jl(a[n])),!r)}if(v.isFormData(e)&&v.isFunction(e.entries)){const s={};return v.forEachEntry(e,(l,a)=>{t(Xl(l),a,s,0)}),s}return null}function Kl(e,t,s){if(v.isString(e))try{return(t||JSON.parse)(e),v.trim(e)}catch(l){if(l.name!=="SyntaxError")throw l}return(s||JSON.stringify)(e)}const ct={transitional:Qs,adapter:["xhr","http","fetch"],transformRequest:[function(t,s){const l=s.getContentType()||"",a=l.indexOf("application/json")>-1,o=v.isObject(t);if(o&&v.isHTMLForm(t)&&(t=new FormData(t)),v.isFormData(t))return a?JSON.stringify(Zs(t)):t;if(v.isArrayBuffer(t)||v.isBuffer(t)||v.isStream(t)||v.isFile(t)||v.isBlob(t)||v.isReadableStream(t))return t;if(v.isArrayBufferView(t))return t.buffer;if(v.isURLSearchParams(t))return s.setContentType("application/x-www-form-urlencoded;charset=utf-8",!1),t.toString();let r;if(o){if(l.indexOf("application/x-www-form-urlencoded")>-1)return Wl(t,this.formSerializer).toString();if((r=v.isFileList(t))||l.indexOf("multipart/form-data")>-1){const u=this.env&&this.env.FormData;return Et(r?{"files[]":t}:t,u&&new u,this.formSerializer)}}return o||a?(s.setContentType("application/json",!1),Kl(t)):t}],transformResponse:[function(t){const s=this.transitional||ct.transitional,l=s&&s.forcedJSONParsing,a=this.responseType==="json";if(v.isResponse(t)||v.isReadableStream(t))return t;if(t&&v.isString(t)&&(l&&!this.responseType||a)){const n=!(s&&s.silentJSONParsing)&&a;try{return JSON.parse(t,this.parseReviver)}catch(r){if(n)throw r.name==="SyntaxError"?F.from(r,F.ERR_BAD_RESPONSE,this,null,this.response):r}}return t}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,maxBodyLength:-1,env:{FormData:te.classes.FormData,Blob:te.classes.Blob},validateStatus:function(t){return t>=200&&t<300},headers:{common:{Accept:"application/json, text/plain, */*","Content-Type":void 0}}};v.forEach(["delete","get","head","post","put","patch"],e=>{ct.headers[e]={}});const Gl=v.toObjectSet(["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"]),Ql=e=>{const t={};let s,l,a;return e&&e.split(`
`).forEach(function(n){a=n.indexOf(":"),s=n.substring(0,a).trim().toLowerCase(),l=n.substring(a+1).trim(),!(!s||t[s]&&Gl[s])&&(s==="set-cookie"?t[s]?t[s].push(l):t[s]=[l]:t[s]=t[s]?t[s]+", "+l:l)}),t},ps=Symbol("internals");function Je(e){return e&&String(e).trim().toLowerCase()}function gt(e){return e===!1||e==null?e:v.isArray(e)?e.map(gt):String(e)}function Zl(e){const t=Object.create(null),s=/([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;let l;for(;l=s.exec(e);)t[l[1]]=l[2];return t}const eo=e=>/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());function Rt(e,t,s,l,a){if(v.isFunction(l))return l.call(this,t,s);if(a&&(t=s),!!v.isString(t)){if(v.isString(l))return t.indexOf(l)!==-1;if(v.isRegExp(l))return l.test(t)}}function to(e){return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g,(t,s,l)=>s.toUpperCase()+l)}function so(e,t){const s=v.toCamelCase(" "+t);["get","set","has"].forEach(l=>{Object.defineProperty(e,l+s,{value:function(a,o,n){return this[l].call(this,t,a,o,n)},configurable:!0})})}let ie=class{constructor(t){t&&this.set(t)}set(t,s,l){const a=this;function o(r,u,c){const m=Je(u);if(!m)throw new Error("header name must be a non-empty string");const p=v.findKey(a,m);(!p||a[p]===void 0||c===!0||c===void 0&&a[p]!==!1)&&(a[p||u]=gt(r))}const n=(r,u)=>v.forEach(r,(c,m)=>o(c,m,u));if(v.isPlainObject(t)||t instanceof this.constructor)n(t,s);else if(v.isString(t)&&(t=t.trim())&&!eo(t))n(Ql(t),s);else if(v.isObject(t)&&v.isIterable(t)){let r={},u,c;for(const m of t){if(!v.isArray(m))throw TypeError("Object iterator must return a key-value pair");r[c=m[0]]=(u=r[c])?v.isArray(u)?[...u,m[1]]:[u,m[1]]:m[1]}n(r,s)}else t!=null&&o(s,t,l);return this}get(t,s){if(t=Je(t),t){const l=v.findKey(this,t);if(l){const a=this[l];if(!s)return a;if(s===!0)return Zl(a);if(v.isFunction(s))return s.call(this,a,l);if(v.isRegExp(s))return s.exec(a);throw new TypeError("parser must be boolean|regexp|function")}}}has(t,s){if(t=Je(t),t){const l=v.findKey(this,t);return!!(l&&this[l]!==void 0&&(!s||Rt(this,this[l],l,s)))}return!1}delete(t,s){const l=this;let a=!1;function o(n){if(n=Je(n),n){const r=v.findKey(l,n);r&&(!s||Rt(l,l[r],r,s))&&(delete l[r],a=!0)}}return v.isArray(t)?t.forEach(o):o(t),a}clear(t){const s=Object.keys(this);let l=s.length,a=!1;for(;l--;){const o=s[l];(!t||Rt(this,this[o],o,t,!0))&&(delete this[o],a=!0)}return a}normalize(t){const s=this,l={};return v.forEach(this,(a,o)=>{const n=v.findKey(l,o);if(n){s[n]=gt(a),delete s[o];return}const r=t?to(o):String(o).trim();r!==o&&delete s[o],s[r]=gt(a),l[r]=!0}),this}concat(...t){return this.constructor.concat(this,...t)}toJSON(t){const s=Object.create(null);return v.forEach(this,(l,a)=>{l!=null&&l!==!1&&(s[a]=t&&v.isArray(l)?l.join(", "):l)}),s}[Symbol.iterator](){return Object.entries(this.toJSON())[Symbol.iterator]()}toString(){return Object.entries(this.toJSON()).map(([t,s])=>t+": "+s).join(`
`)}getSetCookie(){return this.get("set-cookie")||[]}get[Symbol.toStringTag](){return"AxiosHeaders"}static from(t){return t instanceof this?t:new this(t)}static concat(t,...s){const l=new this(t);return s.forEach(a=>l.set(a)),l}static accessor(t){const l=(this[ps]=this[ps]={accessors:{}}).accessors,a=this.prototype;function o(n){const r=Je(n);l[r]||(so(a,n),l[r]=!0)}return v.isArray(t)?t.forEach(o):o(t),this}};ie.accessor(["Content-Type","Content-Length","Accept","Accept-Encoding","User-Agent","Authorization"]);v.reduceDescriptors(ie.prototype,({value:e},t)=>{let s=t[0].toUpperCase()+t.slice(1);return{get:()=>e,set(l){this[s]=l}}});v.freezeMethods(ie);function Tt(e,t){const s=this||ct,l=t||s,a=ie.from(l.headers);let o=l.data;return v.forEach(e,function(r){o=r.call(s,o,a.normalize(),t?t.status:void 0)}),a.normalize(),o}function ea(e){return!!(e&&e.__CANCEL__)}function We(e,t,s){F.call(this,e??"canceled",F.ERR_CANCELED,t,s),this.name="CanceledError"}v.inherits(We,F,{__CANCEL__:!0});function ta(e,t,s){const l=s.config.validateStatus;!s.status||!l||l(s.status)?e(s):t(new F("Request failed with status code "+s.status,[F.ERR_BAD_REQUEST,F.ERR_BAD_RESPONSE][Math.floor(s.status/100)-4],s.config,s.request,s))}function ao(e){const t=/^([-+\w]{1,25})(:?\/\/|:)/.exec(e);return t&&t[1]||""}function lo(e,t){e=e||10;const s=new Array(e),l=new Array(e);let a=0,o=0,n;return t=t!==void 0?t:1e3,function(u){const c=Date.now(),m=l[o];n||(n=c),s[a]=u,l[a]=c;let p=o,b=0;for(;p!==a;)b+=s[p++],p=p%e;if(a=(a+1)%e,a===o&&(o=(o+1)%e),c-n<t)return;const h=m&&c-m;return h?Math.round(b*1e3/h):void 0}}function oo(e,t){let s=0,l=1e3/t,a,o;const n=(c,m=Date.now())=>{s=m,a=null,o&&(clearTimeout(o),o=null),e(...c)};return[(...c)=>{const m=Date.now(),p=m-s;p>=l?n(c,m):(a=c,o||(o=setTimeout(()=>{o=null,n(a)},l-p)))},()=>a&&n(a)]}const wt=(e,t,s=3)=>{let l=0;const a=lo(50,250);return oo(o=>{const n=o.loaded,r=o.lengthComputable?o.total:void 0,u=n-l,c=a(u),m=n<=r;l=n;const p={loaded:n,total:r,progress:r?n/r:void 0,bytes:u,rate:c||void 0,estimated:c&&r&&m?(r-n)/c:void 0,event:o,lengthComputable:r!=null,[t?"download":"upload"]:!0};e(p)},s)},vs=(e,t)=>{const s=e!=null;return[l=>t[0]({lengthComputable:s,total:e,loaded:l}),t[1]]},bs=e=>(...t)=>v.asap(()=>e(...t)),no=te.hasStandardBrowserEnv?((e,t)=>s=>(s=new URL(s,te.origin),e.protocol===s.protocol&&e.host===s.host&&(t||e.port===s.port)))(new URL(te.origin),te.navigator&&/(msie|trident)/i.test(te.navigator.userAgent)):()=>!0,ro=te.hasStandardBrowserEnv?{write(e,t,s,l,a,o,n){if(typeof document>"u")return;const r=[`${e}=${encodeURIComponent(t)}`];v.isNumber(s)&&r.push(`expires=${new Date(s).toUTCString()}`),v.isString(l)&&r.push(`path=${l}`),v.isString(a)&&r.push(`domain=${a}`),o===!0&&r.push("secure"),v.isString(n)&&r.push(`SameSite=${n}`),document.cookie=r.join("; ")},read(e){if(typeof document>"u")return null;const t=document.cookie.match(new RegExp("(?:^|; )"+e+"=([^;]*)"));return t?decodeURIComponent(t[1]):null},remove(e){this.write(e,"",Date.now()-864e5,"/")}}:{write(){},read(){return null},remove(){}};function io(e){return/^([a-z][a-z\d+\-.]*:)?\/\//i.test(e)}function co(e,t){return t?e.replace(/\/?\/$/,"")+"/"+t.replace(/^\/+/,""):e}function sa(e,t,s){let l=!io(t);return e&&(l||s==!1)?co(e,t):t}const hs=e=>e instanceof ie?{...e}:e;function Ne(e,t){t=t||{};const s={};function l(c,m,p,b){return v.isPlainObject(c)&&v.isPlainObject(m)?v.merge.call({caseless:b},c,m):v.isPlainObject(m)?v.merge({},m):v.isArray(m)?m.slice():m}function a(c,m,p,b){if(v.isUndefined(m)){if(!v.isUndefined(c))return l(void 0,c,p,b)}else return l(c,m,p,b)}function o(c,m){if(!v.isUndefined(m))return l(void 0,m)}function n(c,m){if(v.isUndefined(m)){if(!v.isUndefined(c))return l(void 0,c)}else return l(void 0,m)}function r(c,m,p){if(p in t)return l(c,m);if(p in e)return l(void 0,c)}const u={url:o,method:o,data:o,baseURL:n,transformRequest:n,transformResponse:n,paramsSerializer:n,timeout:n,timeoutMessage:n,withCredentials:n,withXSRFToken:n,adapter:n,responseType:n,xsrfCookieName:n,xsrfHeaderName:n,onUploadProgress:n,onDownloadProgress:n,decompress:n,maxContentLength:n,maxBodyLength:n,beforeRedirect:n,transport:n,httpAgent:n,httpsAgent:n,cancelToken:n,socketPath:n,responseEncoding:n,validateStatus:r,headers:(c,m,p)=>a(hs(c),hs(m),p,!0)};return v.forEach(Object.keys({...e,...t}),function(m){const p=u[m]||a,b=p(e[m],t[m],m);v.isUndefined(b)&&p!==r||(s[m]=b)}),s}const aa=e=>{const t=Ne({},e);let{data:s,withXSRFToken:l,xsrfHeaderName:a,xsrfCookieName:o,headers:n,auth:r}=t;if(t.headers=n=ie.from(n),t.url=Gs(sa(t.baseURL,t.url,t.allowAbsoluteUrls),e.params,e.paramsSerializer),r&&n.set("Authorization","Basic "+btoa((r.username||"")+":"+(r.password?unescape(encodeURIComponent(r.password)):""))),v.isFormData(s)){if(te.hasStandardBrowserEnv||te.hasStandardBrowserWebWorkerEnv)n.setContentType(void 0);else if(v.isFunction(s.getHeaders)){const u=s.getHeaders(),c=["content-type","content-length"];Object.entries(u).forEach(([m,p])=>{c.includes(m.toLowerCase())&&n.set(m,p)})}}if(te.hasStandardBrowserEnv&&(l&&v.isFunction(l)&&(l=l(t)),l||l!==!1&&no(t.url))){const u=a&&o&&ro.read(o);u&&n.set(a,u)}return t},uo=typeof XMLHttpRequest<"u",mo=uo&&function(e){return new Promise(function(s,l){const a=aa(e);let o=a.data;const n=ie.from(a.headers).normalize();let{responseType:r,onUploadProgress:u,onDownloadProgress:c}=a,m,p,b,h,d;function i(){h&&h(),d&&d(),a.cancelToken&&a.cancelToken.unsubscribe(m),a.signal&&a.signal.removeEventListener("abort",m)}let f=new XMLHttpRequest;f.open(a.method.toUpperCase(),a.url,!0),f.timeout=a.timeout;function g(){if(!f)return;const C=ie.from("getAllResponseHeaders"in f&&f.getAllResponseHeaders()),P={data:!r||r==="text"||r==="json"?f.responseText:f.response,status:f.status,statusText:f.statusText,headers:C,config:e,request:f};ta(function(x){s(x),i()},function(x){l(x),i()},P),f=null}"onloadend"in f?f.onloadend=g:f.onreadystatechange=function(){!f||f.readyState!==4||f.status===0&&!(f.responseURL&&f.responseURL.indexOf("file:")===0)||setTimeout(g)},f.onabort=function(){f&&(l(new F("Request aborted",F.ECONNABORTED,e,f)),f=null)},f.onerror=function(j){const P=j&&j.message?j.message:"Network Error",_=new F(P,F.ERR_NETWORK,e,f);_.event=j||null,l(_),f=null},f.ontimeout=function(){let j=a.timeout?"timeout of "+a.timeout+"ms exceeded":"timeout exceeded";const P=a.transitional||Qs;a.timeoutErrorMessage&&(j=a.timeoutErrorMessage),l(new F(j,P.clarifyTimeoutError?F.ETIMEDOUT:F.ECONNABORTED,e,f)),f=null},o===void 0&&n.setContentType(null),"setRequestHeader"in f&&v.forEach(n.toJSON(),function(j,P){f.setRequestHeader(P,j)}),v.isUndefined(a.withCredentials)||(f.withCredentials=!!a.withCredentials),r&&r!=="json"&&(f.responseType=a.responseType),c&&([b,d]=wt(c,!0),f.addEventListener("progress",b)),u&&f.upload&&([p,h]=wt(u),f.upload.addEventListener("progress",p),f.upload.addEventListener("loadend",h)),(a.cancelToken||a.signal)&&(m=C=>{f&&(l(!C||C.type?new We(null,e,f):C),f.abort(),f=null)},a.cancelToken&&a.cancelToken.subscribe(m),a.signal&&(a.signal.aborted?m():a.signal.addEventListener("abort",m)));const y=ao(a.url);if(y&&te.protocols.indexOf(y)===-1){l(new F("Unsupported protocol "+y+":",F.ERR_BAD_REQUEST,e));return}f.send(o||null)})},fo=(e,t)=>{const{length:s}=e=e?e.filter(Boolean):[];if(t||s){let l=new AbortController,a;const o=function(c){if(!a){a=!0,r();const m=c instanceof Error?c:this.reason;l.abort(m instanceof F?m:new We(m instanceof Error?m.message:m))}};let n=t&&setTimeout(()=>{n=null,o(new F(`timeout ${t} of ms exceeded`,F.ETIMEDOUT))},t);const r=()=>{e&&(n&&clearTimeout(n),n=null,e.forEach(c=>{c.unsubscribe?c.unsubscribe(o):c.removeEventListener("abort",o)}),e=null)};e.forEach(c=>c.addEventListener("abort",o));const{signal:u}=l;return u.unsubscribe=()=>v.asap(r),u}},po=function*(e,t){let s=e.byteLength;if(s<t){yield e;return}let l=0,a;for(;l<s;)a=l+t,yield e.slice(l,a),l=a},vo=async function*(e,t){for await(const s of bo(e))yield*po(s,t)},bo=async function*(e){if(e[Symbol.asyncIterator]){yield*e;return}const t=e.getReader();try{for(;;){const{done:s,value:l}=await t.read();if(s)break;yield l}}finally{await t.cancel()}},gs=(e,t,s,l)=>{const a=vo(e,t);let o=0,n,r=u=>{n||(n=!0,l&&l(u))};return new ReadableStream({async pull(u){try{const{done:c,value:m}=await a.next();if(c){r(),u.close();return}let p=m.byteLength;if(s){let b=o+=p;s(b)}u.enqueue(new Uint8Array(m))}catch(c){throw r(c),c}},cancel(u){return r(u),a.return()}},{highWaterMark:2})},ys=64*1024,{isFunction:mt}=v,ho=(({Request:e,Response:t})=>({Request:e,Response:t}))(v.global),{ReadableStream:xs,TextEncoder:ws}=v.global,Ss=(e,...t)=>{try{return!!e(...t)}catch{return!1}},go=e=>{e=v.merge.call({skipUndefined:!0},ho,e);const{fetch:t,Request:s,Response:l}=e,a=t?mt(t):typeof fetch=="function",o=mt(s),n=mt(l);if(!a)return!1;const r=a&&mt(xs),u=a&&(typeof ws=="function"?(d=>i=>d.encode(i))(new ws):async d=>new Uint8Array(await new s(d).arrayBuffer())),c=o&&r&&Ss(()=>{let d=!1;const i=new s(te.origin,{body:new xs,method:"POST",get duplex(){return d=!0,"half"}}).headers.has("Content-Type");return d&&!i}),m=n&&r&&Ss(()=>v.isReadableStream(new l("").body)),p={stream:m&&(d=>d.body)};a&&["text","arrayBuffer","blob","formData","stream"].forEach(d=>{!p[d]&&(p[d]=(i,f)=>{let g=i&&i[d];if(g)return g.call(i);throw new F(`Response type '${d}' is not supported`,F.ERR_NOT_SUPPORT,f)})});const b=async d=>{if(d==null)return 0;if(v.isBlob(d))return d.size;if(v.isSpecCompliantForm(d))return(await new s(te.origin,{method:"POST",body:d}).arrayBuffer()).byteLength;if(v.isArrayBufferView(d)||v.isArrayBuffer(d))return d.byteLength;if(v.isURLSearchParams(d)&&(d=d+""),v.isString(d))return(await u(d)).byteLength},h=async(d,i)=>{const f=v.toFiniteNumber(d.getContentLength());return f??b(i)};return async d=>{let{url:i,method:f,data:g,signal:y,cancelToken:C,timeout:j,onDownloadProgress:P,onUploadProgress:_,responseType:x,headers:R,withCredentials:S="same-origin",fetchOptions:L}=aa(d),k=t||fetch;x=x?(x+"").toLowerCase():"text";let D=fo([y,C&&C.toAbortSignal()],j),G=null;const X=D&&D.unsubscribe&&(()=>{D.unsubscribe()});let E;try{if(_&&c&&f!=="get"&&f!=="head"&&(E=await h(R,g))!==0){let O=new s(i,{method:"POST",body:g,duplex:"half"}),$;if(v.isFormData(g)&&($=O.headers.get("content-type"))&&R.setContentType($),O.body){const[J,U]=vs(E,wt(bs(_)));g=gs(O.body,ys,J,U)}}v.isString(S)||(S=S?"include":"omit");const M=o&&"credentials"in s.prototype,N={...L,signal:D,method:f.toUpperCase(),headers:R.normalize().toJSON(),body:g,duplex:"half",credentials:M?S:void 0};G=o&&new s(i,N);let A=await(o?k(G,L):k(i,N));const I=m&&(x==="stream"||x==="response");if(m&&(P||I&&X)){const O={};["status","statusText","headers"].forEach(Y=>{O[Y]=A[Y]});const $=v.toFiniteNumber(A.headers.get("content-length")),[J,U]=P&&vs($,wt(bs(P),!0))||[];A=new l(gs(A.body,ys,J,()=>{U&&U(),X&&X()}),O)}x=x||"text";let T=await p[v.findKey(p,x)||"text"](A,d);return!I&&X&&X(),await new Promise((O,$)=>{ta(O,$,{data:T,headers:ie.from(A.headers),status:A.status,statusText:A.statusText,config:d,request:G})})}catch(M){throw X&&X(),M&&M.name==="TypeError"&&/Load failed|fetch/i.test(M.message)?Object.assign(new F("Network Error",F.ERR_NETWORK,d,G),{cause:M.cause||M}):F.from(M,M&&M.code,d,G)}}},yo=new Map,la=e=>{let t=e&&e.env||{};const{fetch:s,Request:l,Response:a}=t,o=[l,a,s];let n=o.length,r=n,u,c,m=yo;for(;r--;)u=o[r],c=m.get(u),c===void 0&&m.set(u,c=r?new Map:go(t)),m=c;return c};la();const Zt={http:Il,xhr:mo,fetch:{get:la}};v.forEach(Zt,(e,t)=>{if(e){try{Object.defineProperty(e,"name",{value:t})}catch{}Object.defineProperty(e,"adapterName",{value:t})}});const _s=e=>`- ${e}`,xo=e=>v.isFunction(e)||e===null||e===!1;function wo(e,t){e=v.isArray(e)?e:[e];const{length:s}=e;let l,a;const o={};for(let n=0;n<s;n++){l=e[n];let r;if(a=l,!xo(l)&&(a=Zt[(r=String(l)).toLowerCase()],a===void 0))throw new F(`Unknown adapter '${r}'`);if(a&&(v.isFunction(a)||(a=a.get(t))))break;o[r||"#"+n]=a}if(!a){const n=Object.entries(o).map(([u,c])=>`adapter ${u} `+(c===!1?"is not supported by the environment":"is not available in the build"));let r=s?n.length>1?`since :
`+n.map(_s).join(`
`):" "+_s(n[0]):"as no adapter specified";throw new F("There is no suitable adapter to dispatch the request "+r,"ERR_NOT_SUPPORT")}return a}const oa={getAdapter:wo,adapters:Zt};function Pt(e){if(e.cancelToken&&e.cancelToken.throwIfRequested(),e.signal&&e.signal.aborted)throw new We(null,e)}function ks(e){return Pt(e),e.headers=ie.from(e.headers),e.data=Tt.call(e,e.transformRequest),["post","put","patch"].indexOf(e.method)!==-1&&e.headers.setContentType("application/x-www-form-urlencoded",!1),oa.getAdapter(e.adapter||ct.adapter,e)(e).then(function(l){return Pt(e),l.data=Tt.call(e,e.transformResponse,l),l.headers=ie.from(l.headers),l},function(l){return ea(l)||(Pt(e),l&&l.response&&(l.response.data=Tt.call(e,e.transformResponse,l.response),l.response.headers=ie.from(l.response.headers))),Promise.reject(l)})}const na="1.13.2",At={};["object","boolean","number","function","string","symbol"].forEach((e,t)=>{At[e]=function(l){return typeof l===e||"a"+(t<1?"n ":" ")+e}});const Es={};At.transitional=function(t,s,l){function a(o,n){return"[Axios v"+na+"] Transitional option '"+o+"'"+n+(l?". "+l:"")}return(o,n,r)=>{if(t===!1)throw new F(a(n," has been removed"+(s?" in "+s:"")),F.ERR_DEPRECATED);return s&&!Es[n]&&(Es[n]=!0,console.warn(a(n," has been deprecated since v"+s+" and will be removed in the near future"))),t?t(o,n,r):!0}};At.spelling=function(t){return(s,l)=>(console.warn(`${l} is likely a misspelling of ${t}`),!0)};function So(e,t,s){if(typeof e!="object")throw new F("options must be an object",F.ERR_BAD_OPTION_VALUE);const l=Object.keys(e);let a=l.length;for(;a-- >0;){const o=l[a],n=t[o];if(n){const r=e[o],u=r===void 0||n(r,o,e);if(u!==!0)throw new F("option "+o+" must be "+u,F.ERR_BAD_OPTION_VALUE);continue}if(s!==!0)throw new F("Unknown option "+o,F.ERR_BAD_OPTION)}}const yt={assertOptions:So,validators:At},pe=yt.validators;let Le=class{constructor(t){this.defaults=t||{},this.interceptors={request:new fs,response:new fs}}async request(t,s){try{return await this._request(t,s)}catch(l){if(l instanceof Error){let a={};Error.captureStackTrace?Error.captureStackTrace(a):a=new Error;const o=a.stack?a.stack.replace(/^.+\n/,""):"";try{l.stack?o&&!String(l.stack).endsWith(o.replace(/^.+\n.+\n/,""))&&(l.stack+=`
`+o):l.stack=o}catch{}}throw l}}_request(t,s){typeof t=="string"?(s=s||{},s.url=t):s=t||{},s=Ne(this.defaults,s);const{transitional:l,paramsSerializer:a,headers:o}=s;l!==void 0&&yt.assertOptions(l,{silentJSONParsing:pe.transitional(pe.boolean),forcedJSONParsing:pe.transitional(pe.boolean),clarifyTimeoutError:pe.transitional(pe.boolean)},!1),a!=null&&(v.isFunction(a)?s.paramsSerializer={serialize:a}:yt.assertOptions(a,{encode:pe.function,serialize:pe.function},!0)),s.allowAbsoluteUrls!==void 0||(this.defaults.allowAbsoluteUrls!==void 0?s.allowAbsoluteUrls=this.defaults.allowAbsoluteUrls:s.allowAbsoluteUrls=!0),yt.assertOptions(s,{baseUrl:pe.spelling("baseURL"),withXsrfToken:pe.spelling("withXSRFToken")},!0),s.method=(s.method||this.defaults.method||"get").toLowerCase();let n=o&&v.merge(o.common,o[s.method]);o&&v.forEach(["delete","get","head","post","put","patch","common"],d=>{delete o[d]}),s.headers=ie.concat(n,o);const r=[];let u=!0;this.interceptors.request.forEach(function(i){typeof i.runWhen=="function"&&i.runWhen(s)===!1||(u=u&&i.synchronous,r.unshift(i.fulfilled,i.rejected))});const c=[];this.interceptors.response.forEach(function(i){c.push(i.fulfilled,i.rejected)});let m,p=0,b;if(!u){const d=[ks.bind(this),void 0];for(d.unshift(...r),d.push(...c),b=d.length,m=Promise.resolve(s);p<b;)m=m.then(d[p++],d[p++]);return m}b=r.length;let h=s;for(;p<b;){const d=r[p++],i=r[p++];try{h=d(h)}catch(f){i.call(this,f);break}}try{m=ks.call(this,h)}catch(d){return Promise.reject(d)}for(p=0,b=c.length;p<b;)m=m.then(c[p++],c[p++]);return m}getUri(t){t=Ne(this.defaults,t);const s=sa(t.baseURL,t.url,t.allowAbsoluteUrls);return Gs(s,t.params,t.paramsSerializer)}};v.forEach(["delete","get","head","options"],function(t){Le.prototype[t]=function(s,l){return this.request(Ne(l||{},{method:t,url:s,data:(l||{}).data}))}});v.forEach(["post","put","patch"],function(t){function s(l){return function(o,n,r){return this.request(Ne(r||{},{method:t,headers:l?{"Content-Type":"multipart/form-data"}:{},url:o,data:n}))}}Le.prototype[t]=s(),Le.prototype[t+"Form"]=s(!0)});let _o=class ra{constructor(t){if(typeof t!="function")throw new TypeError("executor must be a function.");let s;this.promise=new Promise(function(o){s=o});const l=this;this.promise.then(a=>{if(!l._listeners)return;let o=l._listeners.length;for(;o-- >0;)l._listeners[o](a);l._listeners=null}),this.promise.then=a=>{let o;const n=new Promise(r=>{l.subscribe(r),o=r}).then(a);return n.cancel=function(){l.unsubscribe(o)},n},t(function(o,n,r){l.reason||(l.reason=new We(o,n,r),s(l.reason))})}throwIfRequested(){if(this.reason)throw this.reason}subscribe(t){if(this.reason){t(this.reason);return}this._listeners?this._listeners.push(t):this._listeners=[t]}unsubscribe(t){if(!this._listeners)return;const s=this._listeners.indexOf(t);s!==-1&&this._listeners.splice(s,1)}toAbortSignal(){const t=new AbortController,s=l=>{t.abort(l)};return this.subscribe(s),t.signal.unsubscribe=()=>this.unsubscribe(s),t.signal}static source(){let t;return{token:new ra(function(a){t=a}),cancel:t}}};function ko(e){return function(s){return e.apply(null,s)}}function Eo(e){return v.isObject(e)&&e.isAxiosError===!0}const Bt={Continue:100,SwitchingProtocols:101,Processing:102,EarlyHints:103,Ok:200,Created:201,Accepted:202,NonAuthoritativeInformation:203,NoContent:204,ResetContent:205,PartialContent:206,MultiStatus:207,AlreadyReported:208,ImUsed:226,MultipleChoices:300,MovedPermanently:301,Found:302,SeeOther:303,NotModified:304,UseProxy:305,Unused:306,TemporaryRedirect:307,PermanentRedirect:308,BadRequest:400,Unauthorized:401,PaymentRequired:402,Forbidden:403,NotFound:404,MethodNotAllowed:405,NotAcceptable:406,ProxyAuthenticationRequired:407,RequestTimeout:408,Conflict:409,Gone:410,LengthRequired:411,PreconditionFailed:412,PayloadTooLarge:413,UriTooLong:414,UnsupportedMediaType:415,RangeNotSatisfiable:416,ExpectationFailed:417,ImATeapot:418,MisdirectedRequest:421,UnprocessableEntity:422,Locked:423,FailedDependency:424,TooEarly:425,UpgradeRequired:426,PreconditionRequired:428,TooManyRequests:429,RequestHeaderFieldsTooLarge:431,UnavailableForLegalReasons:451,InternalServerError:500,NotImplemented:501,BadGateway:502,ServiceUnavailable:503,GatewayTimeout:504,HttpVersionNotSupported:505,VariantAlsoNegotiates:506,InsufficientStorage:507,LoopDetected:508,NotExtended:510,NetworkAuthenticationRequired:511,WebServerIsDown:521,ConnectionTimedOut:522,OriginIsUnreachable:523,TimeoutOccurred:524,SslHandshakeFailed:525,InvalidSslCertificate:526};Object.entries(Bt).forEach(([e,t])=>{Bt[t]=e});function ia(e){const t=new Le(e),s=Us(Le.prototype.request,t);return v.extend(s,Le.prototype,t,{allOwnKeys:!0}),v.extend(s,t,null,{allOwnKeys:!0}),s.create=function(a){return ia(Ne(e,a))},s}const V=ia(ct);V.Axios=Le;V.CanceledError=We;V.CancelToken=_o;V.isCancel=ea;V.VERSION=na;V.toFormData=Et;V.AxiosError=F;V.Cancel=V.CanceledError;V.all=function(t){return Promise.all(t)};V.spread=ko;V.isAxiosError=Eo;V.mergeConfig=Ne;V.AxiosHeaders=ie;V.formToJSON=e=>Zs(v.isHTMLForm(e)?new FormData(e):e);V.getAdapter=oa.getAdapter;V.HttpStatusCode=Bt;V.default=V;const{Axios:ni,AxiosError:ri,CanceledError:ii,isCancel:ci,CancelToken:di,VERSION:ui,all:mi,Cancel:fi,isAxiosError:pi,spread:vi,toFormData:bi,AxiosHeaders:hi,HttpStatusCode:gi,formToJSON:yi,getAdapter:xi,mergeConfig:wi}=V,w=V.create({baseURL:"http://localhost:5050/"}),Ao=e=>{{delete w.defaults.headers.common.Authorization;try{localStorage.removeItem("token")}catch{}}},jo=()=>{try{return localStorage.getItem("token")}catch{return null}};w.interceptors.request.use(e=>{const t=jo();return t&&(e.headers=e.headers||{},!e.headers.Authorization&&!e.headers.authorization&&(e.headers.Authorization=`Bearer ${t}`)),e},e=>Promise.reject(e));w.interceptors.response.use(e=>e,async e=>{var s;const t=e==null?void 0:e.config;if(((s=e==null?void 0:e.response)==null?void 0:s.status)===401&&!(t!=null&&t._retry)){t._retry=!0,Ao();try{localStorage.removeItem("user")}catch{}return Promise.reject(e)}return Promise.reject(e)});w.setOnLogout=e=>{typeof e=="function"&&(w.__onLogout=e)};const Ro=`
<div class="dashboard-page">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-chart-line me-2"></i>Dashboard
    </h2>
    <router-link to="/students/import" class="btn btn-primary">
      <i class="fa-solid fa-file-import me-2"></i>Import Students
    </router-link>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else>
    <!-- stat cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#6ea8fe;">
          <div class="fs-2 fw-bold">{{ totals.students }}</div>
          <div class="small">Total Students</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#66cc99;">
          <div class="fs-2 fw-bold">{{ totals.subjects }}</div>
          <div class="small">Total Subjects</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#f6c85f;">
          <div class="fs-2 fw-bold">{{ totals.exams }}</div>
          <div class="small">Total Exams</div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="p-4 rounded-3 text-white" style="background:#f28b82;">
          <div class="fs-2 fw-bold">{{ totals.results }}</div>
          <div class="small">Total Results</div>
        </div>
      </div>
    </div>

    <!-- two-column area -->
    <div class="row g-3">
      <!-- Recent Students -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="fa-solid fa-users me-2"></i>Recent Students
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0 table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in recentStudents" :key="student.id">
                    <td>{{ student.name }}</td>
                    <td>{{ student.roll_number }}</td>
                    <td>
                      <span class="badge bg-success">Active</span>
                    </td>
                  </tr>
                  <tr v-if="recentStudents.length === 0">
                    <td colspan="3" class="text-center text-muted py-3">No students yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- recent exams -->
      <div class="col-12 col-lg-6">
        <div class="card h-100">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="fa-solid fa-file-text me-2"></i>Recent Exams
            </h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table mb-0 table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="exam in recentExams" :key="exam.id">
                    <td>{{ exam.name }}</td>
                    <td><code>{{ exam.code }}</code></td>
                  </tr>
                  <tr v-if="recentExams.length === 0">
                    <td colspan="2" class="text-center text-muted py-3">No exams yet</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,{ref:Mt,reactive:To,onMounted:Po}=Vue,{useRouter:Mo}=VueRouter,Co={name:"DashboardPage",components:{AppLayout:$s},template:Ro,setup(){const e=Mo(),t=To({students:0,subjects:0,exams:0,results:0}),s=Mt([]),l=Mt([]),a=Mt(!0),o=async()=>{var n,r,u,c,m,p,b,h,d,i,f,g,y,C,j,P;try{const[_,x,R,S]=await Promise.all([w.get("/students?limit=1"),w.get("/subjects?limit=1"),w.get("/exams?limit=1"),w.get("/results?limit=1")]);t.students=((u=(r=(n=_.data)==null?void 0:n.data)==null?void 0:r.meta)==null?void 0:u.total)||0,t.subjects=((p=(m=(c=x.data)==null?void 0:c.data)==null?void 0:m.meta)==null?void 0:p.total)||0,t.exams=((d=(h=(b=R.data)==null?void 0:b.data)==null?void 0:h.meta)==null?void 0:d.total)||0,t.results=((g=(f=(i=S.data)==null?void 0:i.data)==null?void 0:f.meta)==null?void 0:g.total)||0;const L=await w.get("/exams?limit=5&order=createdAt&sort=DESC");s.value=((C=(y=L.data)==null?void 0:y.data)==null?void 0:C.exams)||[];const k=await w.get("/students?limit=5&order=createdAt&sort=DESC");l.value=((P=(j=k.data)==null?void 0:j.data)==null?void 0:P.students)||[]}catch(_){console.error("Error fetching dashboard stats:",_)}finally{a.value=!1}};return Po(()=>{o()}),{totals:t,recentExams:s,recentStudents:l,loading:a,router:e}}},Lo=`
<div class="login-split min-vh-100 d-flex">
  <!-- Left -->
  <aside class="login-left d-flex flex-column justify-content-center align-items-start p-5">
    <div class="card left-card w-100 border-0 shadow-sm p-4">
      <div class="d-flex align-items-start gap-3">
        <div class="flex-fill ms-2">
          <img :src="app.logoUrl" alt="App Logo" class="mb-3 login-logo" style="height:120px; width:auto; max-width:100%;" />
          <h6 class="text-muted mb-1">Welcome To</h6>
          <h2 class="fw-bold mb-2">{{ app.name }}</h2>
          <p class="text-muted mb-3">{{ app.tagline }}</p>
          <ul class="list-unstyled text-muted small mb-0">
            <li class="mb-2"><i class="fa-solid fa-check text-success me-2"></i> Manage students & classes</li>
            <li class="mb-2"><i class="fa-solid fa-check text-success me-2"></i> Create exams & publish results</li>
            <li><i class="fa-solid fa-check text-success me-2"></i> Import / export & backups</li>
          </ul>
        </div>
      </div>
      <div class="mt-4 pt-3 border-top text-muted small">
        &copy; {{ year }} — Built by Hubi-Infotech
      </div>
    </div>
  </aside>

  <!-- Right -->
  <main class="login-right d-flex align-items-center justify-content-center p-4">
    <div class="card shadow-lg p-4" style="max-width:600px; width:100%; border-radius:12px;">
      <!-- LOGIN MODE -->
      <div v-if="!isRegisterMode">
        <div class="mb-3 text-center">
          <h5 class="mb-1">Sign in to continue</h5>
          <p class="text-muted small mb-0">Enter your credentials to access the admin panel</p>
        </div>

        <!-- Auto-validated form -->
        <form id="loginForm" data-vform @validated-submit="handleLogin" novalidate>
          <!-- Email -->
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              id="login_email"
              v-model.trim="email"
              type="email"
              class="form-control form-control-lg"
              placeholder="admin@example.com"
              data-vtype="email"
            />
          </div>

          <!-- PIN (shown in PIN mode) -->
          <div class="mb-3" v-if="isPinLogin">
            <label class="form-label">PIN</label>
            <div class="position-relative">
              <i class="fa-solid fa-key position-absolute"
                 style="left:14px; top:50%; transform:translateY(-50%); color:#6c757d;"></i>

              <input
                id="login_pin"
                :type="showPin ? 'text' : 'password'"
                v-model="pin"
                class="form-control"
                placeholder="••••"
                inputmode="numeric"
                maxlength="4"
                pattern="[0-9]*"
                @input="pin = pin.replace(/\\D/g, '').slice(0, 4)"
                @blur="handlePinBlur"
                style="
                  padding-left: 42px;
                  letter-spacing: 0.6rem;
                  font-size: 2.1rem;
                  height: 52px;
                  font-weight: 600;
                  text-align: center;
                "
                data-vtype="number"
                data-vmin="4" 
                data-vmax="4"   
              />
            </div>

            <div class="d-flex justify-content-between mt-1">
              <span class="small text-primary" style="cursor:pointer;" @click="showPin = !showPin">
                {{ showPin ? "Hide PIN" : "Show PIN" }}
              </span>
              <span class="small text-primary" style="cursor:pointer;" @click="switchToPassword">
                Use password instead
              </span>
            </div>

            <div class="form-text">PIN must be exactly 4 digits.</div>
          </div>

          <!-- Password (shown in password mode) -->
          <div class="mb-2" v-else>
            <label class="form-label">Password</label>
            <input
              id="login_password"
              :type="showPassword ? 'text' : 'password'"
              v-model.trim="password"
              class="form-control form-control-lg"
              placeholder="Enter password"
              data-vtype="text"
              data-vmin="4"
            />
            <div class="d-flex justify-content-between mt-1">
              <span class="small text-primary" style="cursor:pointer;" @click="showPassword = !showPassword">
                {{ showPassword ? "Hide Password" : "Show Password" }}
              </span>
              <span class="small text-primary" style="cursor:pointer;" @click="isPinLogin = true">
                Use PIN instead
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember" v-model="remember" />
              <label class="form-check-label small" for="remember">Remember me</label>
            </div>
            <a class="small" href="#/forgot">Forgot?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
            <span v-if="!loading">Login</span>
            <span v-else>Logging in…</span>
          </button>
        </form>

        <div class="text-center mt-3 small text-muted">
          Don't have an account? <a href="#" @click.prevent="isRegisterMode = true" class="text-primary fw-bold">Register here</a>
        </div>
      </div>

      <!-- REGISTER MODE -->
      <div v-else>
        <div class="mb-3 text-center">
          <h5 class="mb-1">Register Your School</h5>
          <p class="text-muted small mb-0">Setup your school account in 2 steps</p>
        </div>

        <form @submit.prevent="handleRegister">
          <!-- School Section -->
          <div class="mb-2">
            <small class="text-muted fw-bold d-block mb-2">📚 School Information</small>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">School Name *</label>
              <input v-model="schoolName" type="text" class="form-control form-control-sm" placeholder="School name" required minlength="3" />
            </div>
            <div class="col-6">
              <label class="form-label small">School Code *</label>
              <input v-model="schoolCode" type="text" class="form-control form-control-sm" placeholder="Code" required minlength="2" />
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label small">Email *</label>
            <input v-model="schoolEmail" type="email" class="form-control form-control-sm" placeholder="school@example.com" required />
          </div>

          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label small">Phone</label>
              <input v-model="schoolPhone" type="tel" class="form-control form-control-sm" placeholder="Phone" pattern="[0-9]{10}" />
            </div>
            <div class="col-6">
              <label class="form-label small">City</label>
              <input v-model="schoolCity" type="text" class="form-control form-control-sm" placeholder="City" minlength="2" />
            </div>
          </div>

          <!-- Admin Section -->
          <div class="mb-2 mt-3">
            <small class="text-muted fw-bold d-block mb-2">👤 Admin User</small>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">Username *</label>
              <input v-model="adminUsername" type="text" class="form-control form-control-sm" placeholder="Username" required minlength="3" />
            </div>
            <div class="col-6">
              <label class="form-label small">Email *</label>
              <input v-model="adminEmail" type="email" class="form-control form-control-sm" placeholder="Email" required />
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">Password *</label>
              <div class="input-group input-group-sm">
                <input 
                  v-model="adminPassword" 
                  :type="showRegisterPassword ? 'text' : 'password'" 
                  class="form-control form-control-sm" 
                  placeholder="Password"
                  required
                  minlength="6"
                />
                <button type="button" class="btn btn-outline-secondary" @click="showRegisterPassword = !showRegisterPassword" style="padding:0.25rem 0.5rem;">
                  <i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:0.75rem;"></i>
                </button>
              </div>
            </div>
            <div class="col-6">
              <label class="form-label small">Confirm *</label>
              <div class="input-group input-group-sm">
                <input 
                  v-model="adminConfirmPassword" 
                  :type="showRegisterConfirmPassword ? 'text' : 'password'" 
                  class="form-control form-control-sm" 
                  placeholder="Confirm"
                  required
                  minlength="6"
                />
                <button type="button" class="btn btn-outline-secondary" @click="showRegisterConfirmPassword = !showRegisterConfirmPassword" style="padding:0.25rem 0.5rem;">
                  <i :class="showRegisterConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:0.75rem;"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small">PIN (Optional)</label>
            <input v-model="adminPin" type="text" class="form-control form-control-sm" placeholder="4-digit" maxlength="4" inputmode="numeric" pattern="[0-9]{0,4}" />
          </div>

          <div class="form-check mb-3">
            <input v-model="agreeTerms" type="checkbox" class="form-check-input form-check-input-sm" id="agreeTerms" />
            <label class="form-check-label small" for="agreeTerms">
              I agree to <a href="#" @click.prevent class="text-primary">Terms & Conditions</a>
            </label>
          </div>

          <button type="submit" class="btn btn-success btn-sm w-100" :disabled="loading">
            <span v-if="!loading"><i class="fa-solid fa-check me-1"></i>Register</span>
            <span v-else><i class="fa-solid fa-spinner fa-spin me-1"></i>Registering...</span>
          </button>
        </form>

        <div class="text-center mt-3 small text-muted">
          Already have an account? <a href="#" @click.prevent="isRegisterMode = false" class="text-primary fw-bold">Login here</a>
        </div>
      </div>
    </div>
  </main>
</div>
`,Oo={name:"School Result Management System",shortName:"SRMS",tagline:"Manage students, exams and results — fast and reliable.",logoUrl:"/srms/assets/images/app-logo.png",accentColor:"#0d6efd"},{ref:q}=Vue,{useRouter:Io}=VueRouter,As={name:"LoginPage",template:Lo,setup(){const e=Io(),t=q({...Oo}),s=new Date().getFullYear(),l=q(!1),a=q(""),o=q(""),n=q(!0),r=q(!1),u=q(!1),c=q(!1),m=q(""),p=q(""),b=q(""),h=q(""),d=q(""),i=q(""),f=q(""),g=q(""),y=q(""),C=q(""),j=q(""),P=q(""),_=q(""),x=q(!1),R=q(!1),S=q(!1),L=q(!1),k=q("");return{app:t,year:s,isRegisterMode:l,email:a,password:o,isPinLogin:n,showPin:r,showPassword:u,remember:c,pin:k,schoolName:m,schoolCode:p,schoolEmail:b,schoolPhone:h,schoolAddress:d,schoolCity:i,schoolState:f,schoolPincode:g,adminUsername:y,adminEmail:C,adminPassword:j,adminConfirmPassword:P,adminPin:_,agreeTerms:x,showRegisterPassword:R,showRegisterConfirmPassword:S,loading:L,switchToPassword:()=>{n.value=!1,u.value=!1},switchToPin:()=>{n.value=!0,r.value=!1},handlePinBlur:()=>{r.value=!1},handleLogin:async()=>{var I,T,O,$,J,U,Y,K,ve;if(!((I=a.value)!=null&&I.trim())){toast.error("Please enter email.");return}if(n.value){if(k.value=(k.value||"").replace(/\D/g,"").slice(0,4),k.value.length!==4){toast.error("PIN must be exactly 4 digits.");return}}else if(!o.value){toast.error("Please enter your password.");return}const N=n.value?"/auth/login-pin":"/auth/login",A=n.value?{email:a.value.trim(),pin:k.value}:{username:a.value.trim(),password:o.value};L.value=!0;try{const B=await w.post(N,A);if(B.status===200&&((T=B.data)==null?void 0:T.status)==="success"){const Q=JSON.parse(JSON.stringify(((O=B.data)==null?void 0:O.data)||B.data)),me=Q.token||"",se=Q.user||{};toast.success("Login successful");const Z=localStorage;Z.setItem("token",me),Z.setItem("user",JSON.stringify({id:se.id,username:se.username,role:se.role,school:se.School})),w.defaults.headers.common.Authorization=`Bearer ${me}`,e.push({path:"/dashboard"})}else{const Q=(($=B==null?void 0:B.data)==null?void 0:$.message)||((J=B==null?void 0:B.data)==null?void 0:J.error)||"Login failed. Please try again.";toast.error(Q),e.push("/")}}catch(B){const Q=((Y=(U=B==null?void 0:B.response)==null?void 0:U.data)==null?void 0:Y.message)||((ve=(K=B==null?void 0:B.response)==null?void 0:K.data)==null?void 0:ve.error)||(B==null?void 0:B.message)||"Login failed. Please try again.";toast.error(Q)}L.value=!1},handleRegister:async()=>{var N,A,I,T,O,$,J,U;if(!((N=m.value)!=null&&N.trim())){toast.error("School name is required");return}if(!((A=p.value)!=null&&A.trim())){toast.error("School code is required");return}if(!((I=b.value)!=null&&I.trim())){toast.error("School email is required");return}if(!((T=y.value)!=null&&T.trim())){toast.error("Admin username is required");return}if(y.value.length<3){toast.error("Username must be at least 3 characters");return}if(!((O=C.value)!=null&&O.trim())){toast.error("Admin email is required");return}if(!(($=j.value)!=null&&$.trim())){toast.error("Password is required");return}if(j.value.length<6){toast.error("Password must be at least 6 characters");return}if(j.value!==P.value){toast.error("Passwords do not match");return}if(!x.value){toast.error("Please agree to terms and conditions");return}L.value=!0;try{const Y={school:{school_name:m.value,school_code:p.value,email:b.value,contact_number:h.value||null,address:d.value||null,city:i.value||null,state:f.value||null,pincode:g.value||null},admin:{username:y.value,email:C.value,password:j.value,pin:_.value||null}},K=await w.post("/school/register",Y);K.data.ok||K.status===200?(toast.success("Registration successful! Logging you in..."),l.value=!1,m.value="",p.value="",b.value="",h.value="",d.value="",i.value="",f.value="",g.value="",y.value="",C.value="",j.value="",P.value="",_.value="",x.value=!1,setTimeout(()=>{e.push("/dashboard")},2e3)):toast.error(K.data.message||"Registration failed")}catch(Y){const K=((U=(J=Y==null?void 0:Y.response)==null?void 0:J.data)==null?void 0:U.message)||(Y==null?void 0:Y.message)||"Registration failed";toast.error(K)}finally{L.value=!1}}}}},No=`
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Students</h2>
    <button class="btn btn-success" @click="addStudent">Add Student</button>
  </div>

  <!-- Student list component -->
  <StudentList ref="studentList" @edit="handleEdit" @view="handleView" @assign="handleAssign" />

  <!-- Add/Edit Modal -->
  <AddEditStudent v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :studentId="selectedStudentId"
    @close="closeStudent"
    @saved="onSaved"
  />

  <!-- View Modal -->
  <StudentProfile v-if="isView"
    :open="isView"
    :studentId="selectedStudentId"
    @edit="handleEdit"
    @close="closeStudent"
  />  

  <StudentSubjectsModal v-if="showSubjectsModal"
    :open="showSubjectsModal"
    entityType="student"
    :entityId="studentForSubjects"
    @close="showSubjectsModal = false"
    @saved="onSubjectsSaved"
  />
</section>
`,Fo=`
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35);">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-8">

      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>{{ mode === 'edit' ? 'Edit Student' : 'Add Student' }}</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form id="studentForm" data-vform @validated-submit="saveStudentDetails">

        <div class="card-body">
          <div class="row g-3">

            <!-- LEFT: PHOTO -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body d-flex flex-column align-items-center justify-content-center">

                  <!-- Student Photo -->
                  <div class="ratio ratio-1x1" style="width:100%; max-width:220px;">
                    <img
                      :src="previewUrl || student.image || placeholderImg"
                      class="img-fluid rounded border"
                      style="object-fit: cover;"
                    />
                  </div>

                  <!-- File Input -->
                  <div class="mt-3 w-100">
                    <input
                      ref="fileInputRef"
                      class="form-control"
                      type="file"
                      accept="image/*"
                      @change="onFileChange"
                    >
                  </div>

                  <!-- Clear Button -->
                  <div class="d-flex gap-2 mt-2">
                    <button
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      @click="clearFile"
                      :disabled="!hasFile"
                    >
                      Remove Photo
                    </button>
                  </div>

                </div>
              </div>
            </div>

            <!-- RIGHT: FORM -->
            <div class="col-md-8">
              <div class="row g-2">

                <div class="col-md-4">
                  <label class="form-label">Roll No</label>
                  <input class="form-control" v-model="student.roll_number" data-vtype="number" />
                </div>

                <div class="col-md-8">
                  <label class="form-label">Name</label>
                  <input class="form-control" v-model="student.name" data-vtype="text" data-vmin="2" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Father's Name</label>
                  <input class="form-control" v-model="student.father_name" data-vtype="text" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Mother's Name</label>
                  <input class="form-control" v-model="student.mother_name" data-vtype="text" />
                </div>

                <div class="col-md-8">
                  <label class="form-label">Address</label>
                  <textarea class="form-control" rows="1" v-model="student.address" data-vtype="text"></textarea>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Pincode</label>
                  <input class="form-control" v-model="student.pincode" data-vtype="number" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Class</label>
                  <select class="form-control" v-model="student.class" data-vtype="select">
                    <option value="">Select course</option>
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.course_name }} ({{ c.course_code }})</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Section</label>
                  <input class="form-control" v-model="student.section" data-vtype="text" />
                </div>

                <div class="col-md-4">
                  <label class="form-label">Gender</label>
                  <select class="form-control" v-model="student.gender" data-vtype="select">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">DOB</label>
                  <input type="date" class="form-control" v-model="student.dob" data-vtype="date" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Admission No</label>
                  <input class="form-control" v-model="student.admission_number" data-vtype="text" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">
                    {{ mode === 'edit' ? 'Academic Year (Upgrade)' : 'Academic Year' }}
                  </label>
                  <select 
                    v-model="student.academic_year_id" 
                    class="form-control"
                    :disabled="mode === 'create'"
                  >
                    <option v-if="mode === 'create'" :value="null" selected>
                      {{ currentYearName || 'Loading...' }}
                    </option>
                    <option v-else :value="null">Select Year</option>
                    <option v-for="year in academicYears" :key="year.id" :value="year.id">
                      {{ year.name }}
                    </option>
                  </select>
                  <small v-if="mode === 'create'" class="text-muted">Auto-assigned based on current year</small>
                  <small v-else class="text-muted">Select to upgrade to new academic year</small>
                </div>
            </div>

          </div>
        </div>

        <div class="card-footer d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" @click="close">Close</button>

          <button type="submit" class="btn btn-primary">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ mode === 'edit' ? 'Update' : 'Save' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</div>
`,{ref:ge,onMounted:$o,computed:js,nextTick:Si}=Vue,Uo={name:"AddEditStudent",template:Fo,props:{open:Boolean,mode:{type:String,default:"create"},studentId:{type:[Number,null],default:null}},emits:["close","saved"],setup(e,{emit:t}){const s=ge(!1),l=ge([]),a=ge([]),o=ge({roll_number:"",name:"",father_name:"",mother_name:"",address:"",pincode:"",class:"",section:"",gender:"",dob:"",admission_number:"",academic_year_id:null,image:""}),n=ge(null),r=ge(""),u=ge(null),c=ge(!1),m="/assets/placeholder-student.png",p=js(()=>!!n.value),b=js(()=>{if(!o.value.academic_year_id){const R=a.value[0];return(R==null?void 0:R.name)||"Current Year"}const x=a.value.find(R=>R.id===o.value.academic_year_id);return(x==null?void 0:x.name)||"Current Year"}),h=()=>{o.value={roll_number:"",name:"",father_name:"",mother_name:"",address:"",pincode:"",class:"",section:"",gender:"",dob:"",admission_number:"",academic_year_id:null,image:""},n.value=null,r.value="",c.value=!1,u.value&&(u.value.value="")},d=async()=>{var x;if(e.studentId){s.value=!0;try{const R=await w.get(`/students/${e.studentId}/details`);if(R.data&&R.data.status==="success"){const{studentData:S,imageData:L}=R.data.data||{};o.value={roll_number:(S==null?void 0:S.roll_number)||"",name:(S==null?void 0:S.name)||"",father_name:(S==null?void 0:S.father_name)||"",mother_name:(S==null?void 0:S.mother_name)||"",address:(S==null?void 0:S.address)||"",pincode:(S==null?void 0:S.pincode)||"",class:S!=null&&S.class?Number(S.class):"",section:(S==null?void 0:S.section)||"",gender:(S==null?void 0:S.gender)||"",dob:S!=null&&S.dob?S.dob.slice(0,10):"",admission_number:(S==null?void 0:S.admission_number)||"",academic_year_id:S!=null&&S.academic_year_id?Number(S.academic_year_id):null,image:(L==null?void 0:L.url)||(L==null?void 0:L.image)||(L==null?void 0:L.image_url)||(S==null?void 0:S.imageUrl)||(S==null?void 0:S.image)||""},r.value=o.value.image||""}else toast.error(((x=R.data)==null?void 0:x.message)||"Failed to load student")}catch{toast.error("Failed to load student")}finally{s.value=!1}}},i=async()=>{try{const x=await w.get("/options/academic-years/all");x.data&&Array.isArray(x.data.data)&&(a.value=x.data.data,a.value.sort((R,S)=>(S.start_date||"").localeCompare(R.start_date||"")))}catch{}},f=async()=>{try{const x=await w.get("/courses",{params:{limit:200}});if(x.data&&(x.data.status==="success"||x.data.success===!0)){const R=x.data.data||{};l.value=R.courses||[]}}catch{}};$o(()=>{f(),i(),e.mode==="edit"&&e.studentId?d():h()});const g=x=>{var L;const R=(L=x.target.files)==null?void 0:L[0];if(!R)return;n.value=R;const S=new FileReader;S.onload=k=>{r.value=k.target.result},S.readAsDataURL(R)},y=()=>{n.value=null,r.value=o.value.image||"",u.value&&(u.value.value="")},C=async()=>{if(!n.value)return toast.error("Select a file first");if(e.mode==="edit"&&!e.studentId)return toast.error("Missing student ID");await P()},j=x=>new Promise((R,S)=>{const L=new FileReader;L.onload=k=>R(k.target.result),L.onerror=S,L.readAsDataURL(x)}),P=async()=>{var x,R;s.value=!0,c.value=!!n.value;try{const S="/students/save",L={...o.value};e.studentId&&(L.studentId=e.studentId),n.value&&(L.image=await j(n.value));const k=await w.post(S,L);((x=k.data)==null?void 0:x.status)==="success"?(toast.success(e.mode==="edit"?"Updated":"Created"),t("saved",k.data.data),_()):toast.error(((R=k.data)==null?void 0:R.message)||"Save failed")}catch(S){toast.error(S.message||"Save failed")}finally{s.value=!1,c.value=!1}},_=()=>{h(),t("close")};return{saving:s,student:o,courses:l,academicYears:a,currentYearName:b,selectedFile:n,previewUrl:r,uploading:c,placeholderImg:m,hasFile:p,fileInputRef:u,getStudentDetails:d,onFileChange:g,clearFile:y,uploadPhotoNow:C,saveStudentDetails:P,close:_}}},Do=`
<div>
  <!-- Search -->
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 220px" v-model="searchTerm" placeholder="Search name / roll / admission" />
    <input class="form-control" style="max-width: 120px" v-model="classId" placeholder="Class" />
    <input class="form-control" style="max-width: 120px" v-model="section" placeholder="Section" />
    <button class="btn btn-primary" @click="getStudentList" :disabled="loading">Search</button>
  </div>

  <div class="table-responsive">
    <table class="table table-bordered table-sm align-middle">
      <thead class="table-light">
        <tr>
          <th style="width: 60px;">ID</th>
          <th>Roll</th>
          <th>Name</th>
          <th>Class</th>
          <th>Section</th>
          <th>Gender</th>
          <th>DOB</th>
          <th>Admission #</th>
          <th style="width: 160px;" class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.id }}</td>
          <td>{{ student.roll_number }}</td>
          <td>{{ student.name }}</td>
          <td>{{ student.class }}</td>
          <td>{{ student.section }}</td>
          <td>{{ student.gender }}</td>
          <td>{{ student.dob ? student.dob.slice(0,10) : '' }}</td>
          <td>{{ student.admission_number }}</td>
          <td class="text-center">

            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" title="View Profile" @click="viewStudent(student.id)">
                <i class="fa-solid fa-user"></i>
              </button>
              <button class="btn btn-light border" title="Edit" @click="editStudent(student.id)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-light border" title="Assign Subjects" @click="assignStudent(student.id)">
                <i class="fa-solid fa-book-open"></i>
              </button>
              <button class="btn btn-light border text-danger" title="Delete" @click="deleteStudent(student.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

          </td>
        </tr>

        <tr v-if="!students.length && !loading">
          <td colspan="9" class="text-center py-4">No students found</td>
        </tr>

        <tr v-if="loading">
          <td colspan="9" class="text-center py-4">Loading…</td>
        </tr>

      </tbody>
    </table>
  </div>

  <!-- Pager -->
  <div class="d-flex justify-content-between align-items-center">
    <div>Total: {{ total }}</div>
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="prev">Prev</button>
      <span>Page {{ page }}</span>
      <button class="btn btn-sm btn-outline-secondary" :disabled="students.length < pageSize" @click="next">Next</button>
      <select class="form-select form-select-sm" style="width: 80px" :value="pageSize" @change="changePageSize($event.target.value)">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</div>
`,{ref:ye,onMounted:Bo}=Vue,Ho={name:"StudentList",template:Do,emits:["edit","view","assign"],setup(e,{emit:t}){const s=ye(!1),l=ye([]),a=ye(0),o=ye(""),n=ye(""),r=ye(""),u=ye(1),c=ye(20),m=()=>({page:u.value,limit:c.value,...o.value&&{q:o.value},...n.value&&{class:n.value},...r.value&&{section:r.value}}),p=_=>{var L,k;const x=((L=_==null?void 0:_.data)==null?void 0:L.data)??(_==null?void 0:_.data)??{},R=x.students??x.results??x.items??[],S=((k=x.meta)==null?void 0:k.total)??x.total??x.count??0;return{studentsList:R,totalCount:S}},b=async()=>{var _;s.value=!0;try{const x=m(),R=await w.get("/students",{params:x}),{studentsList:S,totalCount:L}=p(R);l.value=Array.isArray(S)?S:[],a.value=Number(L)||0}catch(x){(_=toast==null?void 0:toast.error)==null||_.call(toast,"Failed to load students: "+((x==null?void 0:x.message)||x))}finally{s.value=!1}},h=_=>{_&&t("edit",_)},d=_=>{_&&t("view",_)},i=_=>{_&&t("assign",_)},f=async _=>{var x;if(confirm("Delete this student?"))try{await w.delete(`/students/${_}`),await b()}catch(R){(x=toast==null?void 0:toast.error)==null||x.call(toast,"Delete failed: "+((R==null?void 0:R.message)||R))}},g=()=>{u.value>1&&(u.value--,b())},y=()=>{l.value.length>=c.value&&(u.value++,b())},C=_=>{c.value=Number(_)||20,u.value=1,b()},j=()=>{u.value=1,b()},P=()=>{u.value=1,b()};return Bo(b),{loading:s,students:l,total:a,searchTerm:o,classId:n,section:r,page:u,pageSize:c,getStudentList:b,editStudent:h,viewStudent:d,assignStudent:i,deleteStudent:f,prev:g,next:y,changePageSize:C,applySearch:j,applyFilters:P}}},qo=`
<div 
  class="modal fade show d-block" 
  tabindex="-1"
  style="background: rgba(0,0,0,0.5);" 
  role="dialog"
  aria-modal="true"
  v-if="isFetched"
>
  <div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content shadow-lg">

      <!-- Modal Header -->
      <div class="modal-header">
        <h5 class="modal-title">Student Profile</h5>
        <button type="button" class="btn-close" @click="$emit('close')"></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body p-0">
        <div class="student-profile py-3 px-3">

          <div class="container-fluid">
            <div class="row">

              <!-- Left: Photo + quick info -->
              <div class="col-lg-4 mb-3">
                <div class="card shadow-sm">
                  <div class="card-header bg-transparent text-center">
                    <img 
                      class="profile_img img-fluid rounded border"
                      :src="photoUrl || placeholderImg"
                      alt="student photo"
                      style="width: 100%; max-width: 260px; object-fit: cover;"
                    >
                    <h3 class="mt-2">{{ student?.name || '—' }}</h3>
                  </div>
                  <div class="card-body">
                    <p class="mb-2"><strong class="me-1">Student ID:</strong>{{ student?.id ?? '—' }}</p>
                    <p class="mb-2">
                      <strong class="me-1">Class:</strong>{{ student?.class || '—' }}
                      <strong class="ms-3 me-1">Section:</strong>{{ student?.section || '—' }}
                    </p>
                    <p class="mb-2"><strong class="me-1">Admission #:</strong>{{ student?.admission_number || '—' }}</p>
                    <p class="mb-0"><strong class="me-1">Roll:</strong>{{ student?.roll_number || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Right: Details -->
              <div class="col-lg-8">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-transparent border-0">
                    <h3 class="mb-0">
                      <i class="far fa-clone me-1"></i> General Information
                    </h3>
                  </div>
                  <div class="card-body pt-0">
                    <table class="table table-bordered mb-0">
                      <tbody>
                        <tr>
                          <th width="30%">Roll</th>
                          <td width="2%">:</td>
                          <td>{{ student?.roll_number || '—' }}</td>
                        </tr>

                        <tr>
                          <th>Gender</th>
                          <td>:</td>
                          <td>{{ student?.gender || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Religion</th>
                          <td>:</td>
                          <td>{{ student?.religion || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Blood Group</th>
                          <td>:</td>
                          <td>{{ student?.blood_group || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Date of Birth</th>
                          <td>:</td>
                          <td>{{ student?.dob ? student.dob.slice(0,10) : '—' }}</td>
                        </tr>
                        <tr>
                          <th>Contact</th>
                          <td>:</td>
                          <td>{{ student?.contact || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Address</th>
                          <td>:</td>
                          <td>{{ student?.address || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="card shadow-sm">
                  <div class="card-header bg-transparent border-0 d-flex align-items-center justify-content-between">
                    <h3 class="mb-0">
                      <i class="far fa-clone me-1"></i> Other Information
                    </h3>
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-secondary btn-sm" @click="$emit('close')">Back to list</button>
                      <button class="btn btn-primary btn-sm" @click="editStudent(student.id)">Edit</button>
                    </div>
                  </div>
                  <div class="card-body pt-0">
                    <div class="mb-2">
                      <h6>Subjects</h6>
                      <div v-if="assignedSubjects && assignedSubjects.length">
                        <span class="badge bg-secondary me-1" v-for="s in assignedSubjects" :key="s.id">{{ s.subject_name }}</span>
                      </div>
                      <div v-else class="text-muted">No subjects assigned</div>
                    </div>

                    <p class="mb-0" v-if="student?.notes">{{ student.notes }}</p>
                    <p class="mb-0 text-muted" v-else>No additional notes.</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>
`,{ref:Ke,onUnmounted:_i,onMounted:Yo}=Vue,zo={name:"StudentProfile",template:qo,props:{open:Boolean,studentId:{type:[Number,String],required:!1,default:null}},emits:["edit","close"],setup(e,{emit:t}){const s=Ke(!1),l=Ke(null),a=Ke(!1),o=Ke(""),n=Ke([]),r="https://source.unsplash.com/600x300/?student";let u=null;const c=()=>{if(u){try{URL.revokeObjectURL(u)}catch{}u=null}},m=async(d,i)=>{c();try{if(!d){o.value=i||"";return}if(typeof d=="string"){o.value=d;return}if(d.url){o.value=d.url;return}if(d.image_url){o.value=d.image_url;return}if(d.image&&typeof d.image=="string"){const f=d.image;o.value=f.startsWith("data:")?f:`data:image/jpeg;base64,${f}`;return}if(d.blob instanceof Blob){u=URL.createObjectURL(d.blob),o.value=u;return}o.value=i||""}catch{o.value=i||""}},p=async()=>{var d,i,f;if(e.studentId){s.value=!0;try{const g=await w.get(`/students/${e.studentId}/details`);if(((d=g==null?void 0:g.data)==null?void 0:d.status)==="success"){const{studentData:y={},imageData:C=null}=g.data.data||{};l.value={id:y.id||e.studentId||null,roll_number:y.roll_number||"",name:y.name||"",father_name:y.father_name||"",mother_name:y.mother_name||"",address:y.address||"",pincode:y.pincode||"",class:y.class||"",section:y.section||"",gender:y.gender||"",dob:y.dob?String(y.dob).slice(0,10):"",admission_number:y.admission_number||"",image:y.imageUrl||y.image||""},await m(C,l.value.image);try{const j=await w.get(`/students/${e.studentId}/subjects`);((i=j==null?void 0:j.data)==null?void 0:i.status)==="success"?n.value=j.data.data||[]:n.value=[]}catch{n.value=[]}a.value=!0}else{const y=((f=g==null?void 0:g.data)==null?void 0:f.message)||"Failed to load student";typeof toast<"u"&&(toast!=null&&toast.error)&&toast.error(y)}}catch(g){typeof toast<"u"&&(toast!=null&&toast.error)&&toast.error("Failed to load student: "+((g==null?void 0:g.message)||g))}finally{s.value=!1}}};e.studentId&&p();const b=()=>p(),h=d=>{t("edit",d)};return Yo(()=>{e.open&&e.studentId&&p()}),{loading:s,student:l,previewUrl:o,photoUrl:o,placeholderImg:r,assignedSubjects:n,isFetched:a,getStudentDetails:p,reload:b,editStudent:h,applyImageData:m}}},Vo=`
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">
      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>Assign Subjects</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center">Loading…</div>

        <div v-else>
          <div class="mb-2">
            <label class="form-label">Add subjects</label>
            <input class="form-control" v-model="filter" placeholder="Search by id or name" @focus="openDropdown = true" @input="openDropdown = true" @keydown.down.prevent="highlightNext" @keydown.up.prevent="highlightPrev" @keydown.enter.prevent="selectHighlighted" />

            <div v-if="openDropdown && filteredSubjects.length" class="border bg-white mt-1" style="max-height:220px; overflow:auto; position:relative; z-index:1060;">
              <div v-for="(subject, idx) in filteredSubjects" :key="subject.id" class="px-2 py-1 d-flex justify-content-between align-items-center" :class="{'bg-light': idx === highlightedIndex }" style="cursor:pointer;" @mousedown.prevent="addSubject(subject.id)">
                <div class="text-muted small me-3" style="width:70px;">{{ subject.id }}</div>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ subject.subject_name }}</div>
                  <div class="small text-muted">{{ subject.subject_code }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Selected Subjects</label>
            <div class="d-flex flex-wrap">
              <div v-for="subject in selectedSubjects" :key="subject.id" class="card me-2 mb-2 col-5" >
                <div class="card-body p-2 d-flex align-items-center justify-content-between">
                  <div>
                    <div class="small text-muted">Subject ID: <strong>{{ subject.id }}</strong></div>
                    <div><strong>{{ subject.subject_name }}</strong></div>
                    <div class="small text-muted">Code:{{ subject.subject_code }}</div>
                  </div>
                  <div>
                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeSubject(subject.id)">Remove</button>
                  </div>
                </div>
              </div>

              <div v-if="!selectedSubjects.length" class="text-muted">No subjects selected</div>
            </div>
          </div>

        </div>
      </div>

      <div class="card-footer d-flex justify-content-end gap-2">
        <button class="btn btn-light" @click="close">Close</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving...' : 'Save' }}</button>
      </div>
    </div>
  </div>
</div>
`,{ref:je,computed:Rs,onMounted:Wo}=Vue,Ht={name:"AssignSubjectModal",template:Vo,props:{open:Boolean,entityType:{type:String,default:"course"},entityId:{type:[String,Number],default:null}},emits:["close","saved"],setup(e,{emit:t}){const s=je(!1),l=je(!1),a=je([]),o=je([]),n=je(""),r=je(!1),u=je(-1),c=Rs(()=>{const j=(n.value||"").toLowerCase().trim(),_=(a.value||[]).filter(x=>!o.value.includes(Number(x.id)));return j?_.filter(x=>String(x.id||"").includes(j)||(x.subject_name||"").toLowerCase().includes(j)||(x.subject_code||"").toLowerCase().includes(j)):_}),m=Rs(()=>o.value.map(j=>a.value.find(P=>P.id===j)).filter(Boolean)),p=j=>{if(!j)return;const P=Number(j);o.value.includes(P)||o.value.push(P),n.value="",r.value=!1,u.value=-1},b=j=>{if(!j)return;const P=Number(j);o.value=o.value.filter(_=>_!==P)},h=()=>{c.value.length&&(u.value=Math.min(u.value+1,c.value.length-1))},d=()=>{c.value.length&&(u.value=Math.max(u.value-1,0))},i=()=>{u.value>=0&&c.value[u.value]&&p(c.value[u.value].id)},f=async()=>{var j,P,_;s.value=!0;try{const x=await w.get("/subjects",{params:{limit:1e3}});((j=x==null?void 0:x.data)==null?void 0:j.status)==="success"?a.value=((P=x.data.data)==null?void 0:P.subjects)||x.data.subjects||[]:a.value=[]}catch(x){(_=toast==null?void 0:toast.error)==null||_.call(toast,"Failed to load subjects: "+((x==null?void 0:x.message)||x))}finally{s.value=!1}},g=async()=>{var j;if(e.entityId){s.value=!0;try{const P=e.entityType==="student"?`/students/${e.entityId}/subjects`:`/courses/${e.entityId}/subjects`,_=await w.get(P);if(((j=_==null?void 0:_.data)==null?void 0:j.status)==="success"){console.log("response",_);const x=(_.data.data||[]).map(R=>R.subject&&R.subject.id);console.log("ids",x),o.value=x.filter(Boolean)}else o.value=[]}catch{o.value=[]}finally{s.value=!1}}},y=()=>{t("close"),n.value="",o.value=[],u.value=-1},C=async()=>{var j,P,_,x,R,S;if(!e.entityId)return(j=toast==null?void 0:toast.error)==null?void 0:j.call(toast,"Missing entity id");l.value=!0;try{const L=e.entityType==="student"?`/students/${e.entityId}/subjects`:`/courses/${e.entityId}/subjects`,k=e.entityType==="student"?{subjects:o.value}:{subject_ids:o.value},D=await w.post(L,k);((P=D==null?void 0:D.data)==null?void 0:P.status)==="success"?((_=toast==null?void 0:toast.success)==null||_.call(toast,"Assigned"),t("saved"),y()):(R=toast==null?void 0:toast.error)==null||R.call(toast,((x=D==null?void 0:D.data)==null?void 0:x.message)||"Save failed")}catch(L){(S=toast==null?void 0:toast.error)==null||S.call(toast,"Save failed: "+((L==null?void 0:L.message)||L))}finally{l.value=!1}};return Wo(()=>{e.open&&e.entityId&&(f(),g())}),{loading:s,saving:l,subjects:a,selectedIds:o,filter:n,filteredSubjects:c,close:y,save:C,openDropdown:r,highlightedIndex:u,addSubject:p,removeSubject:b,selectedSubjects:m,highlightNext:h,highlightPrev:d,selectHighlighted:i}}},{ref:xe}=Vue,Xo={name:"StudentsIndex",template:No,components:{AddEditStudent:Uo,StudentList:Ho,StudentProfile:zo,AssignSubjectModal:Ht,StudentSubjectsModal:Ht},setup(){const e=xe(!1),t=xe(!1),s=xe("create"),l=xe(null),a=xe(null),o=xe(!1),n=xe(null),r=xe({roll_number:"",name:"",class:"",section:"",gender:"",dob:"",admission_number:"",image:""});return{isEdit:e,isView:t,mode:s,selectedStudentId:l,student:r,studentList:a,showSubjectsModal:o,studentForSubjects:n,addStudent:()=>{s.value="create",l.value=null,r.value={roll_number:"",name:"",class:"",section:"",gender:"",dob:"",admission_number:"",image:""},e.value=!0},handleView:i=>{s.value="view",l.value=i,t.value=!0},handleEdit:i=>{s.value="edit",l.value=i,e.value=!0,t.value=!1},closeStudent:()=>{e.value=!1,t.value=!1},onSaved:()=>{e.value=!1,t.value=!1;try{a.value&&typeof a.value.getStudentList=="function"&&a.value.getStudentList()}catch{}},handleAssign:i=>{n.value=i,o.value=!0},onSubjectsSaved:()=>{o.value=!1,n.value=null;try{a.value&&typeof a.value.getStudentList=="function"&&a.value.getStudentList()}catch{}}}}},Jo=`
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Subjects</h2>
    <button class="btn btn-success" @click="addSubject">Add Subject</button>
  </div>

  <SubjectList ref="subjectList" @edit="handleEdit" />

  <AddEditSubject v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :subjectId="selectedSubjectId"
    @close="closeSubject"
    @saved="onSaved"
  />
</section>
`,Ko=`
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35);">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">

      <div class="card-header d-flex justify-content-between align-items-center">
        <strong>{{ mode === 'edit' ? 'Edit Subject' : 'Add Subject' }}</strong>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form id="subjectForm" data-vform @validated-submit="saveSubject">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-12">
              <label class="form-label">Subject Name</label>
              <input class="form-control" v-model="subject.subject_name" data-vtype="text" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Subject Code</label>
              <input class="form-control" v-model="subject.subject_code" data-vtype="text" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Theory</label>
              <select class="form-control" v-model="subject.has_theory">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Lab</label>
              <select class="form-control" v-model="subject.has_lab">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label">Has Attendance</label>
              <select class="form-control" v-model="subject.has_attendance">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
            
            <div class="col-md-3">
              <label class="form-label">Has Activity</label>
              <select class="form-control" v-model="subject.has_activity">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

          </div>
        </div>

        <div class="card-footer d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" @click="close">Close</button>
          <button type="submit" class="btn btn-primary">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ mode === 'edit' ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
`,{ref:Ts,onMounted:Go}=Vue,Qo={name:"AddEditSubject",template:Ko,props:{open:Boolean,mode:{type:String,default:"create"},subjectId:{type:[String,Number],default:null}},emits:["close","saved"],setup(e,{emit:t}){const s=Ts(!1),l=Ts({subject_name:"",subject_code:"",has_theory:!0,has_lab:!1,has_attendance:!1,has_activity:!1}),a=async()=>{var r,u;if(e.subjectId)try{const c=await w.get(`/subjects/${e.subjectId}/details`);((r=c==null?void 0:c.data)==null?void 0:r.status)==="success"?l.value=c.data.data||l.value:toast.error(((u=c==null?void 0:c.data)==null?void 0:u.message)||"Failed to load subject")}catch(c){toast.error("Failed to load subject: "+((c==null?void 0:c.message)||c))}};return Go(()=>{e.mode==="edit"&&e.subjectId&&a()}),{saving:s,subject:l,close:()=>t("close"),saveSubject:async()=>{var r,u;s.value=!0;try{const c={...l.value};e.mode==="edit"&&e.subjectId&&(c.subjectId=e.subjectId);const m=await w.post("/subjects/save",c);((r=m==null?void 0:m.data)==null?void 0:r.status)==="success"?(toast.success("Saved"),t("saved")):toast.error(((u=m==null?void 0:m.data)==null?void 0:u.message)||"Save failed")}catch(c){toast.error("Save failed: "+((c==null?void 0:c.message)||c))}finally{s.value=!1}}}}},Zo=`
<div>
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 320px" v-model="searchTerm" placeholder="Search name / code" />
    <button class="btn btn-primary" @click="getSubjectList" :disabled="loading">Search</button>
  </div>

  <div class="table-responsive">
    <table class="table table-bordered table-sm align-middle">
      <thead class="table-light">
        <tr>
          <th style="width: 60px;">ID</th>
          <th>Code</th>
          <th>Name</th>
          <th>Theory</th>
          <th>Lab</th>
          <th style="width: 160px;" class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in subjects" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.subject_code }}</td>
          <td>{{ s.subject_name }}</td>
          <td>{{ s.has_theory ? 'Yes' : 'No' }}</td>
          <td>{{ s.has_lab ? 'Yes' : 'No' }}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-light border" title="Edit" @click="editSubject(s.id)">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-light border text-danger" title="Delete" @click="deleteSubject(s.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!subjects.length && !loading">
          <td colspan="6" class="text-center py-4">No subjects found</td>
        </tr>

        <tr v-if="loading">
          <td colspan="6" class="text-center py-4">Loading…</td>
        </tr>

      </tbody>
    </table>
  </div>

  <div class="d-flex justify-content-between align-items-center">
    <div>Total: {{ total }}</div>
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="prev">Prev</button>
      <span>Page {{ page }}</span>
      <button class="btn btn-sm btn-outline-secondary" :disabled="subjects.length < pageSize" @click="next">Next</button>
      <select class="form-select form-select-sm" style="width: 80px" :value="pageSize" @change="changePageSize($event.target.value)">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</div>
`,{ref:Fe,onMounted:en}=Vue,tn={name:"SubjectList",template:Zo,emits:["edit"],setup(e,{emit:t}){const s=Fe(!1),l=Fe([]),a=Fe(1),o=Fe(20),n=Fe(0),r=Fe(""),u=async()=>{var d,i,f;s.value=!0;try{const g=await w.get("/subjects",{params:{page:a.value,limit:o.value,q:r.value}});((d=g==null?void 0:g.data)==null?void 0:d.status)==="success"?(l.value=g.data.data.subjects||[],n.value=((i=g.data.data.meta)==null?void 0:i.total)||0):typeof toast<"u"&&(toast!=null&&toast.error)&&toast.error(((f=g==null?void 0:g.data)==null?void 0:f.message)||"Failed to load subjects")}catch(g){typeof toast<"u"&&(toast!=null&&toast.error)&&toast.error("Failed to load subjects: "+((g==null?void 0:g.message)||g))}finally{s.value=!1}},c=d=>t("edit",d),m=async d=>{var i,f;if(confirm("Delete subject?"))try{const g=await w.delete(`/subjects/${d}`);((i=g==null?void 0:g.data)==null?void 0:i.status)==="success"?(u(),toast.success("Subject deleted")):toast.error(((f=g==null?void 0:g.data)==null?void 0:f.message)||"Delete failed")}catch(g){toast.error("Delete failed: "+((g==null?void 0:g.message)||g))}},p=()=>{a.value>1&&(a.value--,u())},b=()=>{a.value++,u()},h=d=>{o.value=Number(d||20),a.value=1,u()};return en(()=>{u()}),{loading:s,subjects:l,page:a,pageSize:o,total:n,searchTerm:r,getSubjectList:u,editSubject:c,deleteSubject:m,prev:p,next:b,changePageSize:h}}},{ref:Ge}=Vue,sn={name:"SubjectsIndex",template:Jo,components:{AddEditSubject:Qo,SubjectList:tn},setup(){const e=Ge(!1),t=Ge("create"),s=Ge(null),l=Ge(null),a=Ge({subject_name:"",subject_code:"",has_theory:!0,has_lab:!1});return{isEdit:e,mode:t,selectedSubjectId:s,subject:a,addSubject:()=>{t.value="create",s.value=null,a.value={subject_name:"",subject_code:"",has_theory:!0,has_lab:!1},e.value=!0},handleEdit:c=>{t.value="edit",s.value=c,e.value=!0},closeSubject:()=>{e.value=!1},onSaved:()=>{e.value=!1;try{l.value&&typeof l.value.getSubjectList=="function"&&l.value.getSubjectList()}catch{}},subjectList:l}}},an=`
<section class="container py-3">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2 class="m-0">Courses</h2>
    <button class="btn btn-success" @click="addCourse">Add Course</button>
  </div>

  <CourseList ref="courseList" @edit="handleEdit" @openAssignModal="openAssignModal" />

  <AddEditCourse v-if="isEdit"
    :open="isEdit"
    :mode="mode"
    :courseId="selectedCourseId"
    @close="closeCourse"
    @saved="onSaved"
  />

  <AssignSubjectModal v-if="showAssignModal"
    :open="showAssignModal"
    :entityType="selectedEntityType"
    :entityId="selectedEntityId"
    @close="showAssignModal = false"
    @saved="onAssignModalSaved"
  />
</section>
`,ln=`
<div>
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 320px" v-model="searchTerm" placeholder="Search name / code" />
    <button class="btn btn-primary" @click="getCourseList" :disabled="loading">Search</button>
  </div>

  <div class="table-responsive">
    <table class="table table-bordered table-sm align-middle">
      <thead class="table-light">
        <tr>
          
          <div>
            <div class="row">
              <div class="col-8">
                <h5 class="mb-0">Course Name</h5>
              </div>
              <div class="col-4 text-end">
                 <h5 class="mb-0">Actions</h5>
              </div>
            </div>
            <div class="accordion-list">
              <div class="mb-2" v-for="course in courses" :key="course.id">
                <div class="card shadow-sm rounded-0">
                  <div class="card-header d-flex align-items-center justify-content-between" style="cursor: pointer;" @click="toggleRow(course.id)">
                    <div>
                      <div class="h5 mb-0">{{ course.course_name }}</div>
                      <div class="small text-muted">{{ course.course_code }} · {{ course.description }}</div>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                      <div class="btn-group btn-group-sm" @click.stop>
                        <button class="btn btn-light" title="Edit" @click="$emit('edit', course.id)"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-light" title="Assign Subject" @click="openAssign(course)"><i class="fa-solid fa-plus"></i></button>
                        <button class="btn btn-light text-danger" title="Delete" @click="deleteCourse(course.id)"><i class="fa-solid fa-trash"></i></button>
                      </div>
                      <button class="btn btn-sm btn-link" @click.stop="toggleRow(course.id)">
                        <i :class="expandedRows[course.id] ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
                      </button>
                    </div>
                  </div>

                  <div v-if="expandedRows[course.id]" class="card-body">
                    <div class="mb-2">
                      <div class="row">
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Course Name</div>
                          <div>{{ course.course_name }}</div>
                        </div>
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Course Code</div>
                          <div>{{ course.course_code }}</div>
                        </div>
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Description</div>
                          <div>{{ course.description || '-' }}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 class="mb-2">Assigned Subjects</h6>
                      <div v-if="loadingSubjects[course.id]" class="text-muted">Loading subjects…</div>
                      <ul v-else class="list-group">
                        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="cs in course.subjects" :key="cs.subject.id">
                          <div>
                            <strong>{{ cs.subject.subject_name }}</strong>
                            <div class="small text-muted">{{ cs.subject.subject_code }}</div>
                          </div>
                          <div>
                            <button class="btn btn-sm btn-danger" title="Remove subject" @click="removeSubject(course.id, cs.subject.id)"><i class="fa-solid fa-trash"></i></button>
                          </div>
                        </li>
                        <li v-if="!course.subjects.length" class="list-group-item text-muted">No subjects assigned</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="loading" class="text-center">Loading…</div>
          </div>
          `,{ref:Ct,reactive:Ps,onMounted:on}=Vue,nn={name:"CourseList",template:ln,props:[],setup(e,{emit:t}){const s=Ct(""),l=Ct(!1),a=Ct([]),o=Ps({}),n=Ps({}),r=async()=>{var h;l.value=!0;try{const d=await w.get("/courses",{params:{q:s.value,limit:100}});if(d.data&&d.data.status==="success"){const i=d.data.data||{};a.value=i.courses||[];for(const f of a.value)f.subjects=f.subjects||[],o[f.id]=o[f.id]||!1,n[f.id]=!1}else toast.error(((h=d.data)==null?void 0:h.message)||"Failed to load courses")}catch{toast.error("Failed to load courses")}finally{l.value=!1}},u=async h=>{o[h]=!o[h],o[h]&&await c(h)},c=async h=>{n[h]=!0;try{const d=await w.get(`/courses/${h}/subjects`);if(d.data&&d.data.status==="success"){const i=a.value.findIndex(f=>f.id==h);i>=0&&(a.value[i].subjects=d.data.data||[])}}catch{toast.error("Failed to load course subjects")}finally{n[h]=!1}},m=async(h,d)=>{try{const f=(a.value.find(y=>y.id==h).subjects||[]).map(y=>y.subject.id).filter(Boolean).filter(y=>y!=d),g=await w.post(`/courses/${h}/subjects`,{subject_ids:f});g.data&&g.data.status==="success"&&(toast.success("Subject removed"),await c(h))}catch{toast.error("Failed to remove subject")}},p=h=>{t("openAssignModal",h.id)},b=async h=>{if(confirm("Delete course?"))try{const d=await w.delete(`/courses/${h}`);d.data&&d.data.status==="success"&&(toast.success("Deleted"),r())}catch{toast.error("Delete failed")}};return on(()=>{r(),window.addEventListener("openAssignModal",h=>{const d=document.querySelector("assign-subject-modal");try{d&&d.__vue__&&typeof d.__vue__.open=="function"&&d.__vue__.open(h.detail.courseId,h.detail.onSaved)}catch{}})}),{searchTerm:s,loading:l,courses:a,expandedRows:o,loadingSubjects:n,getCourseList:r,toggleRow:u,loadSubjects:c,removeSubject:m,openAssign:p,deleteCourse:b}}},rn=`
<div v-if="open" class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="m-0">{{ mode === 'edit' ? 'Edit Course' : 'Add Course' }}</h5>
        <button type="button" class="btn-close" @click="close"></button>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input class="form-control" v-model="course.course_name" />
        </div>
        <div class="mb-3">
          <label class="form-label">Code</label>
          <input class="form-control" v-model="course.course_code" />
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" v-model="course.description"></textarea>
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="close">Close</button>
          <button class="btn btn-primary" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>
`,{ref:Ms,onMounted:cn}=Vue,dn={name:"AddEditCourse",template:rn,props:{open:Boolean,mode:{type:String,default:"create"},courseId:{type:[Number,null],default:null}},emits:["close","saved"],setup(e,{emit:t}){const s=Ms(!1),l=Ms({course_name:"",course_code:"",description:""}),a=async()=>{if(e.courseId){s.value=!0;try{const r=await w.get(`/courses/${e.courseId}`);r.data&&r.data.status==="success"&&(l.value=r.data.data||l.value)}catch{toast.error("Failed to load course")}finally{s.value=!1}}},o=async()=>{s.value=!0;try{const r={...l.value};e.mode==="edit"&&(r.id=e.courseId);const u=await w.post("/courses/save",r);u.data&&u.data.status==="success"?(toast.success("Saved"),t("saved")):toast.error("Save failed")}catch{toast.error("Save failed")}finally{s.value=!1}};return cn(()=>{e.mode==="edit"&&e.courseId&&a()}),{saving:s,course:l,getCourse:a,save:o,close:()=>{t("close")}}}},{ref:Re}=Vue,un={name:"CoursesIndex",template:an,components:{CourseList:nn,AddEditCourse:dn,AssignSubjectModal:Ht},setup(){const e=Re(!1),t=Re("create"),s=Re(null),l=Re(null),a=Re(!1),o=Re(null),n=Re("course");return{isEdit:e,mode:t,selectedCourseId:s,courseList:l,addCourse:()=>{t.value="create",s.value=null,e.value=!0},handleEdit:h=>{t.value="edit",s.value=h,e.value=!0},closeCourse:()=>{e.value=!1},onSaved:()=>{e.value=!1;try{l.value&&typeof l.value.getCourseList=="function"&&l.value.getCourseList()}catch{}},showAssignModal:a,selectedEntityId:o,selectedEntityType:n,openAssignModal:h=>{o.value=h,n.value="course",a.value=!0},onAssignModalSaved:()=>{a.value=!1;try{l.value&&typeof l.value.getCourseList=="function"&&l.value.getCourseList()}catch{}}}}},mn=`<div class="container-fluid">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="m-0">Exams</h3>
    <button class="btn btn-primary" @click="addExam">Add Exam</button>
  </div>

  <ExamList ref="examListRef" @editExam="handleEdit" />

  <AddEditExam v-if="isEdit" :mode="mode" :examId="selectedExamId" @close="close" @saved="onSaved" />
</div>`,fn=`<div class="position-fixed top-0 start-0 w-100 h-100" style="background: rgba(0,0,0,.35); z-index: 1050;">
  <div class="d-flex h-100 align-items-center justify-content-center">
    <div class="card shadow col-6">

      <div class="card-header d-flex justify-content-between align-items-center">
        <h5>{{ mode === 'edit' ? 'Edit Exam' : 'Add Exam' }}</h5>
        <button class="btn-close" @click="close"></button>
      </div>

      <div v-if="loading" class="py-3">Loading...</div>
      <div v-else>
        <div class="card-body mb-2">
          <label class="form-label">Name</label>
          <input v-model="exam.exam_name" class="form-control" />
        </div>
        <div class="card-body mb-2">
          <label class="form-label">Max Marks</label>
          <input type="number" v-model.number="exam.max_marks" class="form-control" />
        </div>
        <div class="card-body mb-2">
          <label class="form-label">Academic Year</label>
          <select v-model="exam.academic_year_id" class="form-select">
            <option :value="null">-- choose --</option>
            <option v-for="y in years" :value="y.id" :key="y.id">{{ y.name }}</option>
          </select>
        </div>

        <div class="d-flex justify-content-end m-3">
          <button class="btn btn-secondary me-2" @click="close">Cancel</button>
          <button class="btn btn-primary" :disabled="saving" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</div>
</div>`,{ref:ft,onMounted:pn,watch:vn}=Vue,bn={name:"AddEditExam",template:fn,props:{mode:{type:String,default:"create"},examId:{type:[String,Number],default:null}},emits:["close","saved"],setup(e,{emit:t}){const s=ft(!1),l=ft(!1),a=ft({exam_name:"",max_marks:100,academic_year_id:null}),o=ft([]),n=async()=>{var c;s.value=!0;try{const m=await w.get("/options/academic-years/all");if(m!=null&&m.data&&Array.isArray(m.data.data)?o.value=m.data.data:o.value=[],e.mode==="edit"&&e.examId){const p=await w.get(`/exams/${e.examId}`);(c=p==null?void 0:p.data)!=null&&c.success&&(a.value=p.data.data||{})}}catch{}finally{s.value=!1}},r=async()=>{var c,m,p,b;l.value=!0;try{const h={...a.value},d=await w.post("/exams/save",h);(c=d==null?void 0:d.data)!=null&&c.success?t("saved"):(p=toast==null?void 0:toast.error)==null||p.call(toast,((m=d==null?void 0:d.data)==null?void 0:m.message)||"Save failed")}catch{(b=toast==null?void 0:toast.error)==null||b.call(toast,"Save failed")}finally{l.value=!1}};return pn(()=>{n()}),vn(()=>e.examId,c=>{e.mode==="edit"&&n()}),{loading:s,saving:l,exam:a,years:o,save:r,close:()=>t("close")}}},hn=`<div>
  <div v-if="loading" class="text-center py-4">Loading...</div>
  <table v-else class="table table-striped">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Max Marks</th>
        <th>Academic Year</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="exam in exams" :key="exam.id">
        <td>{{ exam.id }}</td>
        <td>{{ exam.exam_name }}</td>
        <td>{{ exam.max_marks }}</td>
        <td>{{ exam.academic_year && exam.academic_year.name ? exam.academic_year.name : '-' }}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" @click="editExam(exam.id)">Edit</button>
        </td>
      </tr>
      <tr v-if="exams.length === 0">
        <td colspan="5" class="text-center text-muted">No exams found</td>
      </tr>
    </tbody>
  </table>
</div>`,{ref:Cs,onMounted:gn}=Vue,yn={name:"ExamList",template:hn,emits:["editExam"],setup(e,{emit:t}){const s=Cs([]),l=Cs(!1),a=async()=>{var n;l.value=!0;try{const r=await w.get("/exams");(n=r==null?void 0:r.data)!=null&&n.success?s.value=r.data.data.exams||r.data.data||[]:s.value=[]}catch{s.value=[]}finally{l.value=!1}},o=n=>{t("editExam",n)};return gn(()=>{a()}),{exams:s,loading:l,getExamList:a,editExam:o}}},{ref:pt}=Vue,xn={name:"ExamsIndex",template:mn,components:{AddEditExam:bn,ExamList:yn},setup(){const e=pt(!1),t=pt("create"),s=pt(null),l=pt(null);return{isEdit:e,mode:t,selectedExamId:s,examListRef:l,addExam:()=>{t.value="create",s.value=null,e.value=!0},handleEdit:u=>{t.value="edit",s.value=u,e.value=!0},close:()=>{e.value=!1},onSaved:()=>{e.value=!1;try{l.value.getExamList&&l.value.getExamList()}catch{}}}}},wn=`<div class="container-fluid">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="m-0">Results</h3>
    <button class="btn btn-primary" @click="addResult">Add Result</button>
  </div>

  <ResultList ref="resultListRef" @editResult="handleEdit" />

  <AddEditResult v-if="isEdit" :mode="mode" :resultId="selectedResultId" @close="close" @saved="onSaved" />
</div>`,{ref:Sn}=Vue,_n={name:"ResultsIndex",template:wn,setup(){return{message:Sn("Results UI coming soon.")}}},kn=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-chart-line me-2"></i>
      Student-wise Results
    </h2>
  </div>

  <!-- Filters -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Student</label>
          <select v-model="filters.student_id" class="form-select">
            <option :value="null">All Students</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.roll_number }})
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Exam</label>
          <select v-model="filters.exam_id" class="form-select">
            <option :value="null">All Exams</option>
            <option v-for="exam in exams" :key="exam.id" :value="exam.id">
              {{ exam.exam_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="filters.academic_year_id" class="form-select">
            <option :value="null">All Years</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end gap-2">
          <button @click="applyFilters" class="btn btn-primary">
            <i class="fa-solid fa-search me-2"></i>Filter
          </button>
          <button @click="resetFilters" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Results ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Exam</th>
            <th>Subject</th>
            <th>Theory Marks</th>
            <th>Lab Marks</th>
            <th>Attendance</th>
            <th>Activity</th>
            <th>Total Marks</th>
            <th>Academic Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="10">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="results.length === 0" class="text-center">
            <td colspan="10" class="text-muted">No results found</td>
          </tr>
          <tr v-for="result in results" :key="result.id">
            <td>{{ result.Student?.name || '-' }}</td>
            <td>{{ result.Student?.roll_number || '-' }}</td>
            <td>{{ result.Exam?.name || '-' }}</td>
            <td>{{ result.Subject?.name || '-' }}</td>
            <td>{{ result.theory_marks || 0 }}</td>
            <td>{{ result.lab_marks || 0 }}</td>
            <td>{{ result.attendance_marks || 0 }}</td>
            <td>{{ result.activity_marks || 0 }}</td>
            <td><strong>{{ result.total_marks || 0 }}</strong></td>
            <td>{{ result.AcademicYear?.name || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="filters.page === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(filters.page - 1)" :disabled="filters.page === 1">
              Previous
            </button>
          </li>

          <li v-for="page in 5" :key="page" :class="{ active: filters.page === page }" class="page-item" v-if="page <= totalPages()">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>

          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(filters.page + 1)" :disabled="filters.page === totalPages()">
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="filters.page === totalPages()">
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`,{ref:Te,onMounted:En}=Vue,{useRouter:An,useRoute:jn}=VueRouter,Rn={name:"StudentWiseResults",template:kn,setup(){jn(),An();const e=Te([]),t=Te([]),s=Te([]),l=Te([]),a=Te({student_id:null,exam_id:null,academic_year_id:null,page:1,limit:50}),o=Te(!1),n=Te(0),r=async()=>{try{const i=await w.get("/students?limit=1000");i.data&&i.data.data&&i.data.data.students&&(t.value=i.data.data.students)}catch(i){console.error("Error fetching students:",i)}},u=async()=>{try{const i=await w.get("/options/academic-years/all");i.data&&Array.isArray(i.data.data)&&(s.value=i.data.data)}catch(i){console.error("Error fetching academic years:",i)}},c=async()=>{try{const i=await w.get("/exams?limit=1000");i.data&&i.data.data&&i.data.data.exams&&(l.value=i.data.data.exams)}catch(i){console.error("Error fetching exams:",i)}},m=async()=>{o.value=!0;try{const i=new URLSearchParams;a.value.student_id&&i.append("student_id",a.value.student_id),a.value.exam_id&&i.append("exam_id",a.value.exam_id),a.value.academic_year_id&&i.append("academic_year_id",a.value.academic_year_id),i.append("page",a.value.page),i.append("limit",a.value.limit);const f=await w.get(`/results?${i.toString()}`);f.data&&f.data.data&&(e.value=f.data.data.results||[],f.data.data.meta&&(n.value=f.data.data.meta.total||0))}catch(i){console.error("Error fetching results:",i)}finally{o.value=!1}},p=()=>{a.value.page=1,m()},b=()=>{a.value={student_id:null,exam_id:null,academic_year_id:null,page:1,limit:50},m()},h=i=>{a.value.page=i,m()},d=()=>Math.ceil(n.value/a.value.limit);return En(()=>{r(),u(),c(),m()}),{results:e,students:t,academicYears:s,exams:l,filters:a,loading:o,totalRecords:n,fetchResults:m,applyFilters:p,resetFilters:b,goToPage:h,totalPages:d}}},Tn=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-book me-2"></i>
      Course-wise Results
    </h2>
  </div>

  <!-- Filters -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Course</label>
          <select v-model="filters.course_id" class="form-select">
            <option :value="null">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Exam</label>
          <select v-model="filters.exam_id" class="form-select">
            <option :value="null">All Exams</option>
            <option v-for="exam in exams" :key="exam.id" :value="exam.id">
              {{ exam.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="filters.academic_year_id" class="form-select">
            <option :value="null">All Years</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end gap-2">
          <button @click="applyFilters" class="btn btn-primary">
            <i class="fa-solid fa-search me-2"></i>Filter
          </button>
          <button @click="resetFilters" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Results ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Exam</th>
            <th>Subject</th>
            <th>Theory Marks</th>
            <th>Lab Marks</th>
            <th>Attendance</th>
            <th>Activity</th>
            <th>Total Marks</th>
            <th>Academic Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="10">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="results.length === 0" class="text-center">
            <td colspan="10" class="text-muted">No results found</td>
          </tr>
          <tr v-for="result in results" :key="result.id">
            <td>{{ result.Student?.name || '-' }}</td>
            <td>{{ result.Student?.roll_number || '-' }}</td>
            <td>{{ result.Exam?.name || '-' }}</td>
            <td>{{ result.Subject?.name || '-' }}</td>
            <td>{{ result.theory_marks || 0 }}</td>
            <td>{{ result.lab_marks || 0 }}</td>
            <td>{{ result.attendance_marks || 0 }}</td>
            <td>{{ result.activity_marks || 0 }}</td>
            <td><strong>{{ result.total_marks || 0 }}</strong></td>
            <td>{{ result.AcademicYear?.name || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="filters.page === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(filters.page - 1)" :disabled="filters.page === 1">
              Previous
            </button>
          </li>

          <li v-for="page in 5" :key="page" :class="{ active: filters.page === page }" class="page-item" v-if="page <= totalPages()">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>

          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(filters.page + 1)" :disabled="filters.page === totalPages()">
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="filters.page === totalPages()">
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`,{ref:Pe,onMounted:Pn}=Vue,{useRouter:Mn}=VueRouter,Cn={name:"CourseWiseResults",template:Tn,setup(){useRoute(),Mn();const e=Pe([]),t=Pe([]),s=Pe([]),l=Pe([]),a=Pe({course_id:null,exam_id:null,academic_year_id:null,page:1,limit:50}),o=Pe(!1),n=Pe(0),r=async()=>{try{const i=await w.get("/courses?limit=1000");i.data&&i.data.data&&i.data.data.courses&&(t.value=i.data.data.courses)}catch(i){console.error("Error fetching courses:",i)}},u=async()=>{try{const i=await w.get("/options/academic-years/all");i.data&&Array.isArray(i.data.data)&&(s.value=i.data.data)}catch(i){console.error("Error fetching academic years:",i)}},c=async()=>{try{const i=await w.get("/exams?limit=1000");i.data&&i.data.data&&i.data.data.exams&&(l.value=i.data.data.exams)}catch(i){console.error("Error fetching exams:",i)}},m=async()=>{o.value=!0;try{const i=new URLSearchParams;a.value.course_id&&i.append("course_id",a.value.course_id),a.value.exam_id&&i.append("exam_id",a.value.exam_id),a.value.academic_year_id&&i.append("academic_year_id",a.value.academic_year_id),i.append("page",a.value.page),i.append("limit",a.value.limit);const f=await w.get(`/results?${i.toString()}`);f.data&&f.data.data&&(e.value=f.data.data.results||[],f.data.data.meta&&(n.value=f.data.data.meta.total||0))}catch(i){console.error("Error fetching results:",i)}finally{o.value=!1}},p=()=>{a.value.page=1,m()},b=()=>{a.value={course_id:null,exam_id:null,academic_year_id:null,page:1,limit:50},m()},h=i=>{a.value.page=i,m()},d=()=>Math.ceil(n.value/a.value.limit);return Pn(()=>{r(),u(),c(),m()}),{results:e,courses:t,academicYears:s,exams:l,filters:a,loading:o,totalRecords:n,fetchResults:m,applyFilters:p,resetFilters:b,goToPage:h,totalPages:d}}},Ln=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-book-open me-2"></i>
      Subject-wise Results
    </h2>
  </div>

  <!-- Filters -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Subject</label>
          <select v-model="filters.subject_id" class="form-select">
            <option :value="null">All Subjects</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
              {{ subject.subject_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Exam</label>
          <select v-model="filters.exam_id" class="form-select">
            <option :value="null">All Exams</option>
            <option v-for="exam in exams" :key="exam.id" :value="exam.id">
              {{ exam.exam_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="filters.academic_year_id" class="form-select">
            <option :value="null">All Years</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end gap-2">
          <button @click="applyFilters" class="btn btn-primary">
            <i class="fa-solid fa-search me-2"></i>Filter
          </button>
          <button @click="resetFilters" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Results Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Results ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Exam</th>
            <th>Subject</th>
            <th>Theory Marks</th>
            <th>Lab Marks</th>
            <th>Attendance</th>
            <th>Activity</th>
            <th>Total Marks</th>
            <th>Academic Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="10">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="results.length === 0" class="text-center">
            <td colspan="10" class="text-muted">No results found</td>
          </tr>
          <tr v-for="result in results" :key="result.id">
            <td>{{ result.Student?.name || '-' }}</td>
            <td>{{ result.Student?.roll_number || '-' }}</td>
            <td>{{ result.Exam?.name || '-' }}</td>
            <td>{{ result.Subject?.name || '-' }}</td>
            <td>{{ result.theory_marks || 0 }}</td>
            <td>{{ result.lab_marks || 0 }}</td>
            <td>{{ result.attendance_marks || 0 }}</td>
            <td>{{ result.activity_marks || 0 }}</td>
            <td><strong>{{ result.total_marks || 0 }}</strong></td>
            <td>{{ result.AcademicYear?.name || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="filters.page === 1">
              First
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === 1 }">
            <button class="page-link" @click="goToPage(filters.page - 1)" :disabled="filters.page === 1">
              Previous
            </button>
          </li>

          <li v-for="page in 5" :key="page" :class="{ active: filters.page === page }" class="page-item" v-if="page <= totalPages()">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>

          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(filters.page + 1)" :disabled="filters.page === totalPages()">
              Next
            </button>
          </li>
          <li class="page-item" :class="{ disabled: filters.page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="filters.page === totalPages()">
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`,{ref:Me,onMounted:On}=Vue,{useRouter:In}=VueRouter,Nn={name:"SubjectWiseResults",template:Ln,setup(){useRoute(),In();const e=Me([]),t=Me([]),s=Me([]),l=Me([]),a=Me({subject_id:null,exam_id:null,academic_year_id:null,page:1,limit:50}),o=Me(!1),n=Me(0),r=async()=>{try{const i=await w.get("/subjects?limit=1000");i.data&&i.data.data&&i.data.data.subjects&&(t.value=i.data.data.subjects)}catch(i){console.error("Error fetching subjects:",i)}},u=async()=>{try{const i=await w.get("/options/academic-years/all");i.data&&Array.isArray(i.data.data)&&(s.value=i.data.data)}catch(i){console.error("Error fetching academic years:",i)}},c=async()=>{try{const i=await w.get("/exams?limit=1000");i.data&&i.data.data&&i.data.data.exams&&(l.value=i.data.data.exams)}catch(i){console.error("Error fetching exams:",i)}},m=async()=>{o.value=!0;try{const i=new URLSearchParams;a.value.subject_id&&i.append("subject_id",a.value.subject_id),a.value.exam_id&&i.append("exam_id",a.value.exam_id),a.value.academic_year_id&&i.append("academic_year_id",a.value.academic_year_id),i.append("page",a.value.page),i.append("limit",a.value.limit);const f=await w.get(`/results?${i.toString()}`);f.data&&f.data.data&&(e.value=f.data.data.results||[],f.data.data.meta&&(n.value=f.data.data.meta.total||0))}catch(i){console.error("Error fetching results:",i)}finally{o.value=!1}},p=()=>{a.value.page=1,m()},b=()=>{a.value={subject_id:null,exam_id:null,academic_year_id:null,page:1,limit:50},m()},h=i=>{a.value.page=i,m()},d=()=>Math.ceil(n.value/a.value.limit);return On(()=>{r(),u(),c(),m()}),{results:e,subjects:t,academicYears:s,exams:l,filters:a,loading:o,totalRecords:n,fetchResults:m,applyFilters:p,resetFilters:b,goToPage:h,totalPages:d}}},Fn=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-file-export me-2"></i>
      Generate Marksheet
    </h2>
  </div>

  <!-- Selection Form -->
  <div class="card mb-4">
    <div class="card-header bg-light">
      <h5 class="mb-0">Marksheet Configuration</h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Template *</label>
          <select v-model="selectedTemplate" class="form-select">
            <option :value="null">Select Template</option>
            <option v-for="template in templates" :key="template.id" :value="template.id">
              {{ template.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Student *</label>
          <select v-model="selectedStudent" class="form-select">
            <option :value="null">Select Student</option>
            <option value="__ALL__" style="font-weight: bold; background-color: #f0f0f0;">
              ✓ All Students ({{ students.length }})
            </option>
            <option value="__ALL__" disabled style="border-top: 1px solid #ddd;"></option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.roll_number }})
            </option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Exams (Select Multiple) *</label>
          <div class="exam-checkboxes" style="border: 1px solid #ddd; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto; background-color: #f9f9f9;">
            <div v-if="exams.length === 0" class="text-muted small">No exams available</div>
            <div v-for="exam in exams" :key="exam.id" class="form-check">
              <input 
                type="checkbox" 
                :id="'exam-' + exam.id"
                class="form-check-input"
                :checked="isExamSelected(exam.id)"
                @change="toggleExam(exam.id)"
              />
              <label class="form-check-label" :for="'exam-' + exam.id" style="cursor: pointer; font-size: 0.9rem;">
                {{ exam.exam_name }}
              </label>
            </div>
          </div>
          <small class="text-muted d-block mt-1">
            Selected: {{ selectedExams.length }} exam{{ selectedExams.length !== 1 ? 's' : '' }}
          </small>
        </div>

        <div class="col-md-3">
          <label class="form-label">Course</label>
          <select v-model="selectedCourse" class="form-select">
            <option :value="null">Select Course</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.course_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">Academic Year</label>
          <select v-model="selectedAcademicYear" class="form-select">
            <option :value="null">Select Year</option>
            <option v-for="year in academicYears" :key="year.id" :value="year.id">
              {{ year.name }}
            </option>
          </select>
        </div>

        <div class="col-md-9 d-flex align-items-end">
          <button 
            @click="generatePreview" 
            :disabled="!canGenerate || loading"
            class="btn btn-primary me-2"
          >
            <i class="fa-solid fa-eye me-2"></i>
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>Generating...
            </span>
            <span v-else>
              Preview Marksheet{{ selectedExams.length > 1 ? 's' : '' }}
              <span v-if="isAllStudentsSelected"> for All Students</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Preview Modal -->
  <div v-if="showPreview" class="modal-backdrop fade show" style="display: block;"></div>
  <div v-if="showPreview" class="modal fade show d-block" style="display: block !important; position: fixed; top: 0; left: 0; z-index: 1050;">
    <div class="modal-dialog modal-xl" style="margin: 1.75rem auto; width: 90%; max-width: 80vw;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Marksheet Preview
            <span v-if="Array.isArray(previewHTML)" class="badge bg-info ms-2">
              {{ previewHTML.length }} marksheet(s)
            </span>
          </h5>
          <button type="button" class="btn-close" @click="showPreview = false"></button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <!-- Single marksheet -->
          <div v-if="previewHTML && !Array.isArray(previewHTML)" v-html="previewHTML" style="padding: 20px; background: white; border: 1px solid #ddd;"></div>
          
          <!-- Multiple marksheets -->
          <div v-else-if="Array.isArray(previewHTML)">
            <div v-for="(sheet, index) in previewHTML" :key="index" style="margin-bottom: 30px; page-break-after: always;">
              <div style="padding: 10px; background: #f8f9fa; border-bottom: 2px solid #dee2e6; margin-bottom: 10px;">
                <strong>{{ sheet.studentName }}</strong> ({{ index + 1 }} of {{ previewHTML.length }})
              </div>
              <div v-html="sheet.html" style="padding: 20px; background: white; border: 1px solid #ddd;"></div>
            </div>
          </div>
          
          <div v-else class="text-center text-muted">
            <p>Loading preview...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPreview = false">Close</button>
          <button 
            type="button" 
            class="btn btn-success"
            @click="issueMarksheet"
            :disabled="saving"
          >
            <i class="fa-solid fa-check me-2"></i>
            <span v-if="saving">Issuing...</span>
            <span v-else>Issue Marksheet</span>
          </button>
          <button 
            type="button" 
            class="btn btn-info"
            @click="upgradeStudent"
            :disabled="saving || !selectedAcademicYear"
          >
            <i class="fa-solid fa-arrow-up me-2"></i>
            <span v-if="saving">Upgrading...</span>
            <span v-else>Upgrade to Next Year</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`,{ref:le,onMounted:$n,computed:Lt}=Vue,{useRoute:Un,useRouter:Dn}=VueRouter,Bn={name:"GenerateMarksheet",template:Fn,setup(){Un(),Dn();const e=le([]),t=le([]),s=le([]),l=le([]),a=le([]),o=le(null),n=le(null),r=le([]),u=le(null),c=le(null),m=le(""),p=le(!1),b=le(!1),h=le(!1),d=Lt(()=>n.value==="__ALL__"),i=Lt(()=>d.value?t.value.map(k=>k.id):n.value?[n.value]:[]),f=k=>{const D=r.value.indexOf(k);D>-1?r.value.splice(D,1):r.value.push(k)},g=k=>r.value.includes(k),y=async()=>{try{const k=await w.get("/marksheet-templates?limit=100");k.data&&k.data.data&&k.data.data.templates&&(e.value=k.data.data.templates.filter(D=>D.is_active))}catch(k){console.error("Error fetching templates:",k)}},C=async()=>{try{const k=await w.get("/students?limit=1000");k.data&&k.data.data&&k.data.data.students&&(t.value=k.data.data.students)}catch(k){console.error("Error fetching students:",k)}},j=async()=>{try{const k=await w.get("/exams?limit=1000");k.data&&k.data.data&&k.data.data.exams&&(s.value=k.data.data.exams)}catch(k){console.error("Error fetching exams:",k)}},P=async()=>{try{const k=await w.get("/courses?limit=1000");k.data&&k.data.data&&k.data.data.courses&&(l.value=k.data.data.courses)}catch(k){console.error("Error fetching courses:",k)}},_=async()=>{try{const k=await w.get("/options/academic-years/all");k.data&&Array.isArray(k.data.data)&&(a.value=k.data.data)}catch(k){console.error("Error fetching academic years:",k)}},x=async()=>{var k,D,G,X,E,M,N,A,I,T,O,$,J,U,Y,K,ve,B,Q,me;if(!o.value){(k=toast==null?void 0:toast.error)==null||k.call(toast,"Please select a marksheet template");return}if(!n.value){(D=toast==null?void 0:toast.error)==null||D.call(toast,"Please select at least one student");return}if(!r.value||r.value.length===0){(G=toast==null?void 0:toast.error)==null||G.call(toast,"Please select at least one exam");return}b.value=!0;try{console.log("=== Marksheet Generation Start ==="),console.log("Template ID:",o.value),console.log("Selected template object:",e.value.find(Z=>Z.id===o.value)),console.log("Student(s):",i.value),console.log("Exam IDs:",r.value),console.log("Exams detail:",s.value.filter(Z=>r.value.includes(Z.id))),console.log("Academic Year ID:",c.value);const se=i.value;if(d.value){console.log(`Generating marksheets for all ${se.length} students`);const Z=[];let fe=0,he=0;for(const ce of se)try{const Ee={student_id:ce,exam_ids:r.value,template_id:o.value,academic_year_id:c.value||null};console.log(`[${ce}] Posting payload:`,JSON.stringify(Ee));const Xe=await w.post("/results/generate-marksheet",Ee);if(console.log(`[${ce}] Response:`,Xe.data),Xe.data.success&&((X=Xe.data.data)!=null&&X.html))Z.push({studentId:ce,html:Xe.data.data.html,studentName:((E=t.value.find(ut=>ut.id===ce))==null?void 0:E.name)||`Student ${ce}`}),fe++,console.log(`[${ce}] ✓ Success`);else{he++;const ut=Xe.data.error||"Unknown error";console.warn(`[${ce}] ✗ Failed: ${ut}`),(M=toast==null?void 0:toast.error)==null||M.call(toast,`Failed for student ${ce}: ${ut}`)}}catch(Ee){he++,console.error(`[${ce}] ✗ Exception:`,Ee),console.error(`[${ce}] Response data:`,(N=Ee.response)==null?void 0:N.data),(T=toast==null?void 0:toast.error)==null||T.call(toast,`Error for student ${ce}: ${((I=(A=Ee.response)==null?void 0:A.data)==null?void 0:I.error)||Ee.message}`)}if(Z.length===0){console.error("No marksheets generated:",{successCount:fe,failCount:he}),(O=toast==null?void 0:toast.error)==null||O.call(toast,`Failed to generate any marksheets (${he} failed)`),b.value=!1;return}console.log(`Generated ${fe} marksheets, ${he} failed`),m.value=Z,p.value=!0,($=toast==null?void 0:toast.success)==null||$.call(toast,`Generated ${Z.length} marksheet(s)`)}else{const Z={student_id:n.value,exam_ids:r.value,template_id:o.value,academic_year_id:c.value||null};console.log("Generating single marksheet with payload:",JSON.stringify(Z));const fe=await w.post("/results/generate-marksheet",Z);if(console.log("Response:",fe.data),!fe.data.success){const he=fe.data.error||"Unknown error";console.error("Marksheet generation failed:",he),(J=toast==null?void 0:toast.error)==null||J.call(toast,`Error: ${he}`),b.value=!1;return}if(!((U=fe.data.data)!=null&&U.html)){console.error("No HTML returned in response:",fe.data),(Y=toast==null?void 0:toast.error)==null||Y.call(toast,"Error: No marksheet HTML generated"),b.value=!1;return}m.value=fe.data.data.html,p.value=!0,(K=toast==null?void 0:toast.success)==null||K.call(toast,"Marksheet generated successfully")}}catch(se){console.error("=== Marksheet Generation Exception ==="),console.error("Error:",se),console.error("Response:",(ve=se.response)==null?void 0:ve.data);const Z=((Q=(B=se.response)==null?void 0:B.data)==null?void 0:Q.error)||se.message||"Error generating preview";(me=toast==null?void 0:toast.error)==null||me.call(toast,Z)}finally{b.value=!1}},R=async()=>{var k,D,G,X,E;if(!n.value||r.value.length===0){(k=toast==null?void 0:toast.error)==null||k.call(toast,"Please select student and at least one exam");return}h.value=!0;try{for(const M of r.value){const N=new URLSearchParams;N.append("student_id",n.value),N.append("exam_id",M);const I=((G=(D=(await w.get(`/results?${N.toString()}`)).data)==null?void 0:D.data)==null?void 0:G.results)||[]}(X=toast==null?void 0:toast.success)==null||X.call(toast,`Marksheet issued for ${r.value.length} exam(s)`),p.value=!1}catch(M){console.error("Error issuing marksheet:",M),(E=toast==null?void 0:toast.error)==null||E.call(toast,"Error issuing marksheet")}finally{h.value=!1}},S=async()=>{var k,D,G,X;if(!n.value||!c.value){(k=toast==null?void 0:toast.error)==null||k.call(toast,"Please select student and current academic year");return}h.value=!0;try{const E=a.value.findIndex(N=>N.id===parseInt(c.value));if(E===-1||E===a.value.length-1){(D=toast==null?void 0:toast.error)==null||D.call(toast,"Next academic year not found");return}const M=a.value[E+1];(G=toast==null?void 0:toast.success)==null||G.call(toast,`Student upgraded from ${a.value[E].name} to ${M.name}`),p.value=!1}catch(E){console.error("Error upgrading student:",E),(X=toast==null?void 0:toast.error)==null||X.call(toast,"Error upgrading student")}finally{h.value=!1}},L=Lt(()=>o.value&&n.value&&r.value.length>0);return $n(()=>{y(),C(),j(),P(),_()}),{templates:e,students:t,exams:s,courses:l,academicYears:a,selectedTemplate:o,selectedStudent:n,selectedExams:r,selectedCourse:u,selectedAcademicYear:c,previewHTML:m,showPreview:p,loading:b,saving:h,isAllStudentsSelected:d,selectedStudentIds:i,generatePreview:x,issueMarksheet:R,upgradeStudent:S,canGenerate:L,toggleExam:f,isExamSelected:g}}},Hn=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-file-lines me-2"></i>
      Marksheet Templates
    </h2>
    <button @click="addTemplate" class="btn btn-primary">
      <i class="fa-solid fa-plus me-2"></i>Add Template
    </button>
  </div>

  <!-- Search -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-2">
        <div class="col-md-6">
          <input 
            v-model="search" 
            type="text" 
            class="form-control" 
            placeholder="Search templates..."
            @keyup.enter="searchTemplates"
          />
        </div>
        <div class="col-md-6">
          <button @click="searchTemplates" class="btn btn-primary me-2">
            <i class="fa-solid fa-search me-2"></i>Search
          </button>
          <button @click="resetSearch" class="btn btn-secondary">
            <i class="fa-solid fa-redo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Templates Table -->
  <div class="card">
    <div class="card-header bg-light">
      <h5 class="mb-0">Templates ({{ totalRecords }})</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Template Name</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td colspan="4">
              <span class="spinner-border spinner-border-sm me-2"></span>Loading...
            </td>
          </tr>
          <tr v-else-if="templates.length === 0" class="text-center">
            <td colspan="4" class="text-muted">No templates found</td>
          </tr>
          <tr v-for="tmpl in templates" :key="tmpl.id">
            <td>{{ tmpl.name }}</td>
            <td>
              <span v-if="tmpl.is_active" class="badge bg-success">Active</span>
              <span v-else class="badge bg-secondary">Inactive</span>
            </td>
            <td>{{ new Date(tmpl.created_at).toLocaleDateString() }}</td>
            <td>
              <div class="btn-group btn-group-sm" role="group">
                <button 
                  @click="editTemplate(tmpl.id)" 
                  class="btn btn-outline-primary"
                  title="Edit"
                >
                  <i class="fa-solid fa-edit"></i>
                </button>
                <button 
                  @click="toggleActive(tmpl)" 
                  :class="['btn', tmpl.is_active ? 'btn-outline-warning' : 'btn-outline-success']"
                  :title="tmpl.is_active ? 'Deactivate' : 'Activate'"
                >
                  <i :class="tmpl.is_active ? 'fa-solid fa-times' : 'fa-solid fa-check'"></i>
                </button>
                <button 
                  @click="deleteTemplate(tmpl.id)" 
                  class="btn btn-outline-danger"
                  title="Delete"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages() > 1" class="card-footer bg-light">
      <nav aria-label="pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="page === 1">First</button>
          </li>
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button class="page-link" @click="goToPage(page - 1)" :disabled="page === 1">Previous</button>
          </li>

          <li v-for="p in 5" :key="p" :class="{ active: page === p }" class="page-item" v-if="p <= totalPages()">
            <button class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages() }">
            <button class="page-link" @click="goToPage(page + 1)" :disabled="page === totalPages()">Next</button>
          </li>
          <li class="page-item" :class="{ disabled: page === totalPages() }">
            <button class="page-link" @click="goToPage(totalPages())" :disabled="page === totalPages()">Last</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</div>
`,{ref:$e,onMounted:qn}=Vue,{useRouter:Yn}=VueRouter,zn={name:"MarksheetTemplatesList",template:Hn,setup(){const e=Yn(),t=$e([]),s=$e(""),l=$e(1),a=$e(50),o=$e(0),n=$e(!1),r=async()=>{n.value=!0;try{const f=new URLSearchParams;s.value&&f.append("q",s.value),f.append("page",l.value),f.append("limit",a.value);const g=await w.get(`/marksheet-templates?${f.toString()}`);g.data&&g.data.data&&(t.value=g.data.data.templates||[],g.data.data.meta&&(o.value=g.data.data.meta.total||0))}catch(f){console.error("Error fetching templates:",f)}finally{n.value=!1}},u=async f=>{var g,y;if(confirm("Are you sure you want to delete this template?"))try{await w.delete(`/marksheet-templates/${f}`),(g=toast==null?void 0:toast.success)==null||g.call(toast,"Template deleted successfully"),r()}catch(C){console.error("Error deleting template:",C),(y=toast==null?void 0:toast.error)==null||y.call(toast,"Error deleting template")}},c=f=>{e.push(`/templates/marksheets/${f}/edit`)},m=()=>{e.push("/templates/marksheets/add")},p=()=>{l.value=1,r()},b=()=>{s.value="",l.value=1,r()},h=async f=>{var g,y;try{const C=await w.post("/marksheet-templates/save",{id:f.id,is_active:!f.is_active});(g=toast==null?void 0:toast.success)==null||g.call(toast,"Template updated successfully"),r()}catch(C){console.error("Error updating template:",C),(y=toast==null?void 0:toast.error)==null||y.call(toast,"Error updating template")}},d=f=>{l.value=f,r()},i=()=>Math.ceil(o.value/a.value);return qn(()=>{r()}),{templates:t,search:s,page:l,totalRecords:o,loading:n,fetchTemplates:r,deleteTemplate:u,editTemplate:c,addTemplate:m,searchTemplates:p,resetSearch:b,toggleActive:h,goToPage:d,totalPages:i}}},Vn=`
<div class="container-fluid p-22">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="mb-0">
      <i class="fa-solid fa-file-lines me-2"></i>
      {{ isEdit ? 'Edit' : 'Add' }} Marksheet Template
    </h3>
    <button @click="router.back()" class="btn btn-sm btn-secondary">
      <i class="fa-solid fa-arrow-left me-2"></i>Back
    </button>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else class="row g-4">
    <!-- Editor Panel -->
    <div class="col-lg-12">
      <div class="card">
        <div class="d-flex justify-content-between card-header bg-light">
          <h5 class="mb-0">Template Details</h5>
          <button 
              @click="saveTemplate" 
              :disabled="saving"
              class="btn btn-sm btn-primary"
            >
              <i class="fa-solid fa-save me-2"></i>
              <span v-if="saving">Saving...</span>
              <span v-else>Save Template</span>
            </button>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-4">
              <label class="form-label">Template Name *</label>
              <input class="form-control"
                v-model="form.name" 
                type="text" 
                placeholder="e.g., Professional Classic"
              />
              
            </div>
            <div class="col-2">
             <label class="form-label">Active *</label>
              <input class="form-check-input"
              v-model="form.is_active" 
              type="checkbox" 
              class="form-check-input" 
              id="isActive"
            />
            </div>
            <div class="col-4" v-if="isEdit">
              <label class="form-label">Template ID *</label>
              <input class="form-control"
                v-model="form.id" 
                type="text" 
                placeholder="e.g., 12345"
              />
              
            </div>  
          </div>

          <div class="mb-3">
            <textarea v-model="form.html_content"
              id="html_editor"
              style="height: 400px; border: 1px solid #ddd; border-radius: 4px;">
            </textarea>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>

`,{ref:Qe,onMounted:Wn,computed:Ls}=Vue,{useRoute:Xn,useRouter:Jn}=VueRouter,Os={name:"AddEditMarksheetTemplate",template:Vn,setup(){const e=Xn(),t=Jn(),s=Ls(()=>e.params.id!==void 0),l=Ls(()=>e.params.id),a=Qe({name:"",html_content:"",is_active:!0}),o=Qe(!1),n=Qe(!1),r=Qe(!1),u=Qe("code"),c=async()=>{var d;o.value=!0;try{const i=await w.get(`/marksheet-templates/${l.value}`);i.data&&i.data.data&&(a.value={name:i.data.data.name,html_content:i.data.data.html_content,is_active:i.data.data.is_active,id:i.data.data.id})}catch(i){console.error("Error fetching template:",i),(d=toast==null?void 0:toast.error)==null||d.call(toast,"Error loading template")}finally{o.value=!1}},m=async()=>{var d,i,f;if(!a.value.name||!a.value.html_content){(d=toast==null?void 0:toast.error)==null||d.call(toast,"Please fill in all required fields");return}n.value=!0;try{const g={name:a.value.name,html_content:a.value.html_content,is_active:a.value.is_active};s.value&&(g.id=l.value);const y=await w.post("/marksheet-templates/save",g);(i=toast==null?void 0:toast.success)==null||i.call(toast,s.value?"Template updated successfully":"Template created successfully"),t.push("/templates/marksheets")}catch(g){console.error("Error saving template:",g),(f=toast==null?void 0:toast.error)==null||f.call(toast,"Error saving template")}finally{n.value=!1}},p=d=>{a.value.html_content+=d},b=[{text:"Student Name",value:"{{student_name}}"},{text:"Roll Number",value:"{{roll_number}}"},{text:"Exam Name",value:"{{exam_name}}"},{text:"Course/Class",value:"{{class}}"},{text:"Academic Year",value:"{{session}}"},{text:"School Name",value:"{{school_name}}"},{text:"Current Date",value:"{{current_date}}"},{text:"Marks Rows",value:"{{marks_rows}}"},{text:"Overall Total",value:"{{overall_total}}"},{text:"Overall Grade",value:"{{overall_grade}}"},{text:"Total Theory",value:"{{total_theory}}"},{text:"Total Lab",value:"{{total_lab}}"},{text:"Total Attendance",value:"{{total_attendance}}"},{text:"Total Activity",value:"{{total_activity}}"},{text:"Remarks",value:"{{remarks}}"}],h=()=>{a.value.html_content=`
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 15px;">
    <h2 style="margin: 0;">{{school_name}}</h2>
    <h3 style="margin: 5px 0 0 0; color: #666;">MARKSHEET</h3>
  </div>

  <div style="margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
    <div><strong>Student Name:</strong> {{student_name}}</div>
    <div><strong>Roll Number:</strong> {{roll_number}}</div>
    <div><strong>Class:</strong> {{class}}</div>
    <div><strong>Academic Year:</strong> {{session}}</div>
    <div><strong>Exam:</strong> {{exam_name}}</div>
    <div><strong>Date:</strong> {{current_date}}</div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
    <thead>
      <tr style="background-color: #f0f0f0; border: 1px solid #ddd;">
        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Subject</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Theory</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Lab</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Attendance</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Activity</th>
        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{marks_rows}}
    </tbody>
  </table>

  <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; font-size: 14px;">
    <div><strong>Overall Total Marks:</strong> {{overall_total}}</div>
    <div><strong>Overall Grade:</strong> {{overall_grade}}</div>
    <div style="margin-top: 10px;">Remarks: {{remarks}}</div>
  </div>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px;">
    <div>___________________<br/>Teacher Signature</div>
    <div>___________________<br/>Principal Signature</div>
  </div>
</div>
      `};return Wn(()=>{s.value&&c(),setTimeout(()=>{const d=new FroalaEditor("#html_editor",{heightMin:350,heightMax:350,toolbarButtons:["bold","italic","underline","strikethrough","|","formatOL","formatUL","|","align","indent","outdent","|","insertTable","|","createLink","insertImage","|","undo","redo","|","html"],codeMirror:!0,codeMirrorOptions:{indentType:"tab",tabSize:2}});s.value&&a.value.html_content&&d.html.set(a.value.html_content),d.events.on("contentChanged",function(){a.value.html_content=this.html.get()})},100)}),{form:a,loading:o,saving:n,showPreview:r,editorMode:u,isEdit:s,saveTemplate:m,insertPlaceholder:p,placeholders:b,insertSampleMarksheet:h,router:t}}},Kn=`
<div class="container-fluid p-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-upload me-2"></i>Import Students
    </h2>
  </div>

  <div class="row">
    <div class="col-lg-8">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">Upload Student Data</h5>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-5">
            <span class="spinner-border"></span>
          </div>

          <div v-else>
            <div class="mb-3">
              <label class="form-label">Select Class/Course *</label>
              <select v-model="selectedCourse" class="form-select">
                <option :value="null">Select Course</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">
                  {{ course.course_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Upload File (CSV/XLSX) *</label>
              <input 
                type="file" 
                @change="onFileChange" 
                accept=".csv,.xlsx,.xls"
                class="form-control"
              />
              <small class="text-muted">
                Supported formats: CSV, XLSX, XLS
              </small>
            </div>

            <div v-if="file" class="alert alert-success">
              <i class="fa-solid fa-check me-2"></i>File selected: <strong>{{ file.name }}</strong>
            </div>

            <div class="d-flex gap-2">
              <button 
                @click="importStudents" 
                :disabled="!file || !selectedCourse || uploading"
                class="btn btn-primary"
              >
                <i class="fa-solid fa-upload me-2"></i>
                <span v-if="uploading">Importing...</span>
                <span v-else>Import Students</span>
              </button>
              <button @click="downloadTemplate" class="btn btn-outline-secondary">
                <i class="fa-solid fa-download me-2"></i>Download Template
              </button>
            </div>

            <!-- Import Results -->
            <div v-if="importResults.success > 0 || importResults.failed > 0" class="mt-4">
              <div class="alert alert-info">
                <h6>Import Summary</h6>
                <p class="mb-0">
                  <span class="badge bg-success me-2">Success: {{ importResults.success }}</span>
                  <span class="badge bg-danger">Failed: {{ importResults.failed }}</span>
                </p>
              </div>

              <div v-if="importResults.errors.length > 0" class="alert alert-warning">
                <h6>Errors</h6>
                <ul class="mb-0">
                  <li v-for="(error, idx) in importResults.errors.slice(0, 10)" :key="idx">
                    {{ error }}
                  </li>
                  <li v-if="importResults.errors.length > 10" class="text-muted">
                    ... and {{ importResults.errors.length - 10 }} more errors
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">File Format</h5>
        </div>
        <div class="card-body">
          <p class="text-muted small">Your file should contain the following columns:</p>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Column</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>name</code></td>
                  <td>John Doe</td>
                </tr>
                <tr>
                  <td><code>roll_number</code></td>
                  <td>STU001</td>
                </tr>
                <tr>
                  <td><code>father_name</code></td>
                  <td>Mr. Doe</td>
                </tr>
                <tr>
                  <td><code>mother_name</code></td>
                  <td>Mrs. Doe</td>
                </tr>
                <tr>
                  <td><code>address</code></td>
                  <td>123 Main St</td>
                </tr>
                <tr>
                  <td><code>pincode</code></td>
                  <td>110001</td>
                </tr>
                <tr>
                  <td><code>class</code></td>
                  <td>Class 10</td>
                </tr>
                <tr>
                  <td><code>section</code></td>
                  <td>A</td>
                </tr>
                <tr>
                  <td><code>gender</code></td>
                  <td>Male</td>
                </tr>
                <tr>
                  <td><code>dob</code></td>
                  <td>2008-05-15</td>
                </tr>
                <tr>
                  <td><code>admission_number</code></td>
                  <td>ADM2024001</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="alert alert-info mt-3">
            <strong>File Format:</strong> Excel/CSV file with columns:
            <br><code>name, roll_number, father_name, mother_name, address, pincode, class, section, gender, dob, admission_number</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,{ref:Ue,reactive:Gn,onMounted:Qn}=Vue,Zn={name:"StudentImport",template:Kn,setup(){const e=Ue([]),t=Ue(null),s=Ue(null),l=Ue(!1),a=Ue(!1),o=Ue(0),n=Gn({success:0,failed:0,errors:[]}),r=async()=>{var p,b,h,d,i;l.value=!0;try{console.log("Fetching courses from /options/courses/all");const f=await w.get("/options/courses/all");console.log("Courses response:",f.data),e.value=((p=f.data)==null?void 0:p.data)||[],console.log("Courses loaded:",e.value.length),e.value.length===0&&console.warn("No courses found in database")}catch(f){console.error("Error fetching courses:",f),console.error("Error details:",((b=f.response)==null?void 0:b.data)||f.message),(i=toast==null?void 0:toast.error)==null||i.call(toast,"Error loading courses: "+(((d=(h=f.response)==null?void 0:h.data)==null?void 0:d.message)||f.message))}finally{l.value=!1}},u=p=>{t.value=p.target.files&&p.target.files[0]?p.target.files[0]:null},c=async()=>{var p,b,h,d,i,f,g;if(!t.value){(p=toast==null?void 0:toast.error)==null||p.call(toast,"Please select a file");return}if(!s.value){(b=toast==null?void 0:toast.error)==null||b.call(toast,"Please select a course/class");return}a.value=!0,o.value=0,n.success=0,n.failed=0,n.errors=[];try{const y=new FormData;y.append("file",t.value),y.append("course_id",s.value);const C=await w.post("/students/import",y,{headers:{"Content-Type":"multipart/form-data"}});(h=C.data)!=null&&h.data&&(n.success=C.data.data.success||0,n.failed=C.data.data.failed||0,n.errors=C.data.data.errors||[]),(d=toast==null?void 0:toast.success)==null||d.call(toast,`Import completed! Success: ${n.success}, Failed: ${n.failed}`),t.value=null}catch(y){console.error("Error importing students:",y),(g=toast==null?void 0:toast.error)==null||g.call(toast,"Error importing students: "+(((f=(i=y.response)==null?void 0:i.data)==null?void 0:f.message)||y.message))}finally{a.value=!1}},m=()=>{const p=`name,roll_number,father_name,mother_name,address,pincode,class,section,gender,dob,admission_number
John Doe,STU001,Mr. Doe,Mrs. Doe,123 Main St,110001,Class 10,A,Male,2008-05-15,ADM2024001
Jane Smith,STU002,Mr. Smith,Mrs. Smith,456 Oak Ave,110002,Class 10,A,Female,2008-06-20,ADM2024002
Bob Johnson,STU003,Mr. Johnson,Mrs. Johnson,789 Pine Rd,110003,Class 10,B,Male,2008-07-10,ADM2024003`,b=new Blob([p],{type:"text/csv"}),h=window.URL.createObjectURL(b),d=document.createElement("a");d.href=h,d.download="student_import_template.csv",d.click(),window.URL.revokeObjectURL(h)};return Qn(()=>{r()}),{courses:e,file:t,selectedCourse:s,loading:l,uploading:a,importProgress:o,importResults:n,onFileChange:u,importStudents:c,downloadTemplate:m}}},ca=()=>new Promise((e,t)=>{if(typeof window>"u")return t(new Error("Not running in browser"));if(window.XLSX)return e(window.XLSX);const s="/assets/js/xlsx.min.js";if(document.querySelector(`script[src="${s}"]`)){let a=0;const o=setInterval(()=>{a++,window.XLSX&&(clearInterval(o),e(window.XLSX)),a>20&&(clearInterval(o),t(new Error("XLSX not available")))},100)}else{const a=document.createElement("script");a.src=s,a.async=!0,a.onload=()=>{if(window.XLSX)return e(window.XLSX);t(new Error("XLSX loaded but not found"))},a.onerror=()=>t(new Error("Failed to load xlsx.min.js")),document.head.appendChild(a)}}),er=e=>e.replace(/[\\/?*\[\]:]/g,"").substring(0,31),tr=async(e,t,s,l,a="")=>{await ca();const o=window.XLSX,n=o.utils.book_new();e.forEach(u=>{const c=u.subject||u;if(!c)return;const m=["Student ID","Student Name","Class"];c.has_theory&&m.push("Theory"),c.has_lab&&m.push("Lab"),c.has_activity&&m.push("Activity"),c.has_attendance&&m.push("Attendance");const p=[];t.forEach(i=>{const f=[i.id,i.name,a||s];c.has_theory&&f.push(""),c.has_lab&&f.push(""),c.has_activity&&f.push(""),c.has_attendance&&f.push(""),p.push(f)});const b=o.utils.aoa_to_sheet([m,...p]),h=[{wch:12},{wch:22},{wch:12}];c.has_theory&&h.push({wch:12}),c.has_lab&&h.push({wch:10}),c.has_activity&&h.push({wch:12}),c.has_attendance&&h.push({wch:12}),b["!cols"]=h;const d=er(c.subject_code||c.subject_name||"Subject");o.utils.book_append_sheet(n,b,d)});const r=`Results_${s}_${l}.xlsx`;o.writeFile(n,r)},sr=`
<div class="container-fluid p-4">

  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">
      <i class="fa-solid fa-book me-2"></i>Result Book
    </h2>
  </div>

  <div v-if="loading" class="text-center py-5">
    <span class="spinner-border"></span>
  </div>

  <div v-else>

    <!-- Selection Card -->
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Select Exam & Class</h5>
      </div>

      <div class="card-body">

        <div class="row g-3">

          <div class="col-md-3">
            <label class="form-label">Academic Year</label>
            <select v-model="selectedAcademicYear" class="form-select">
              <option :value="null">Select Year</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">
                {{ year.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Exam *</label>
            <select v-model="selectedExam" class="form-select">
              <option :value="null">Select Exam</option>
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.exam_name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Class/Course *</label>
            <select v-model="selectedCourse" @change="fetchStudentsByClass" class="form-select">
              <option :value="null">Select Class</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.course_name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Mode</label>
            <select v-model="importMode" class="form-select">
              <option value="manual">Manual Entry</option>
              <option value="file">Import from File</option>
            </select>
          </div>

        </div>

      </div>
    </div>

    <!-- MANUAL ENTRY MODE -->
    <div v-if="importMode === 'manual'" class="row g-4">

      <div v-if="viewMode === 'class'" class="col-12">

        <div class="card mb-4">

          <div class="card-header bg-light">
            <h5 class="mb-0">Class-wise Entry</h5>
          </div>

          <div class="card-body">

            <div class="row mb-3">

              <div class="col-md-6">
                <label class="form-label">Subject</label>
                <select v-model="selectedSubjectForClass" @change="loadStudentsForSubject" class="form-select">
                  <option :value="null">Select Subject</option>
                  <option v-for="s in subjectsForCourse" :key="s.id" :value="s.id">
                    {{ s.subject_name }}
                  </option>
                </select>
              </div>

            </div>

            <ClassWiseTable
              v-if="selectedSubjectForClass"
              :students="studentsForSubject"
              :subject-id="selectedSubjectForClass"
              :exam-id="selectedExam"
              :subject="selectedSubjectObj"
              :exam="selectedExamObj"
              :course="selectedCourseObj"
              :academic-year="selectedAcademicYearObj"
              :max-marks="selectedMaxMarks"
              @save="handleClasswiseSave"
              @update="handleRowUpdate"
              @error="notifyOrAlert"
            />

          </div>

        </div>

      </div>

    </div>

    <!-- FILE IMPORT MODE -->
    <div v-if="importMode === 'file'" class="card">

      <div class="card-header bg-light">
        <h5 class="mb-0">
          <i class="fa-solid fa-file-upload me-2"></i>Import Results from File
        </h5>
      </div>

      <div class="card-body">

        <div class="row mb-3">

          <div class="col-md-5">

            <label class="form-label">Subject (or select All)</label>

            <select v-model="selectedSubjectForClass" class="form-select">
              <option :value="null">Select Subject</option>
              <option value="__ALL__">All Subjects</option>
              <option v-for="s in subjectsForCourse" :key="s.id" :value="s.id">
                {{ s.subject_name }}
              </option>
            </select>

          </div>

          <div class="col-md-7">

            <label class="form-label">&nbsp;</label>

            <button
              @click="downloadResultsTemplate"
              :disabled="!selectedExam || !selectedCourse || !selectedSubjectForClass"
              class="btn btn-outline-secondary w-100"
            >
              <i class="fa-solid fa-download me-2"></i>Download Template
            </button>

          </div>

        </div>

        <div class="alert alert-info">
          <strong>File Format:</strong> Excel file with Student ID, Student Name and marks columns.
          <br>
          <strong>Tip:</strong> Download the template above to see the correct format.
        </div>

        <div class="mb-3">

          <label class="form-label">Upload File *</label>

          <input
            type="file"
            @change="onFileChange"
            accept=".xlsx,.xls,.csv"
            class="form-control"
          />

          <small class="text-muted">Supported formats: XLSX, XLS, CSV</small>

        </div>

        <div v-if="file" class="alert alert-success">
          <i class="fa-solid fa-check me-2"></i>File selected: {{ file.name }}
        </div>

        <button
          @click="importResultsFromFile"
          :disabled="!file || !selectedExam || !selectedCourse || uploading"
          class="btn btn-primary"
        >
          <i class="fa-solid fa-upload me-2"></i>
          <span v-if="uploading">Importing...</span>
          <span v-else>Import Results</span>
        </button>

      </div>

    </div>

  </div>

</div>
`,ar={name:"ClassWiseTable",props:{students:{type:Array,default:()=>[]},subjectId:{type:[Number,String],default:null},examId:{type:[Number,String],default:null},subject:{type:Object,default:null},exam:{type:Object,default:null},course:{type:Object,default:null},academicYear:{type:Object,default:null},maxMarks:{type:Number,default:100}},template:`
  <div>

    <div v-if="!subjectId" class="text-muted">
      Select a subject to load students
    </div>

    <div v-else>

      <!-- Exam Info Card -->
      <div class="card mb-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="card-body text-white">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-file-text fa-2x opacity-75"></i>
                </div>
                <div>
                  <div class="small text-white-50">Exam</div>
                  <div class="fw-bold">{{ exam?.exam_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-school fa-2x opacity-75"></i>
                </div>
                <div>
                  <div class="small text-white-50">Class/Course</div>
                  <div class="fw-bold">{{ course?.course_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-calendar fa-2x opacity-75"></i>
                </div>
                <div>
                  <div class="small text-white-50">Academic Year</div>
                  <div class="fw-bold">{{ academicYear?.name || 'N/A' }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="fa-solid fa-book fa-2x opacity-75"></i>
                </div>
                <div>
                  <div class="small text-white-50">Subject</div>
                  <div class="fw-bold">{{ subject?.subject_name || 'N/A' }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-top border-white-25" v-if="maxMarks">
            <div class="d-flex align-items-center justify-content-center">
              <i class="fa-solid fa-star fa-lg me-2"></i>
              <span class="fw-bold">Max Marks: {{ maxMarks }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="rows.length === 0" class="text-muted">
        No students found
      </div>

      <div v-else class="table-responsive">

        <table class="table table-sm table-bordered">

          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Theory</th>
              <th>Lab</th>
              <th>Attendance</th>
              <th>Activity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr v-for="(studentRow, index) in rows" :key="studentRow.id">

              <td>{{ index + 1 }}</td>

              <td>
                {{ studentRow.name }}
                <div class="text-muted small">
                  {{ studentRow.roll_number || '' }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasTheory"
                  type="number"
                  v-model.number="studentRow.marks.theory"
                  @input="validateField(studentRow, 'theory')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'theory') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'theory')" class="invalid-feedback d-block">
                  Max: {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasLab"
                  type="number"
                  v-model.number="studentRow.marks.lab"
                  @input="validateField(studentRow, 'lab')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'lab') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'lab')" class="invalid-feedback d-block">
                  Max: {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasAttendance"
                  type="number"
                  v-model.number="studentRow.marks.attendance"
                  @input="validateField(studentRow, 'attendance')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'attendance') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'attendance')" class="invalid-feedback d-block">
                  Max: {{ maxMarks }}
                </div>
              </td>

              <td>
                <input
                  :disabled="!hasActivity"
                  type="number"
                  v-model.number="studentRow.marks.activity"
                  @input="validateField(studentRow, 'activity')"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': hasFieldError(studentRow.id, 'activity') }"
                  min="0"
                  :max="maxMarks"
                />
                <div v-if="hasFieldError(studentRow.id, 'activity')" class="invalid-feedback d-block">
                  Max: {{ maxMarks }}
                </div>
              </td>

              <td class="align-middle" :class="{ 'text-danger fw-bold': isTotalExceeding(studentRow) }">
                {{ calculateRowTotal(studentRow) }}
                <div v-if="isTotalExceeding(studentRow)" class="small text-danger">
                  Exceeds max ({{ maxMarks }})
                </div>
              </td>

              <td class="align-middle">
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="updateSingleStudent(studentRow)"
                >
                  Update
                </button>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

      <div class="d-flex justify-content-end mt-2">
        <button class="btn btn-primary" @click="saveClassResults">
          Save Class Results
        </button>
      </div>

    </div>

  </div>
  `,data(){return{rows:[],errors:{}}},computed:{hasTheory(){return!!(this.subject&&(this.subject.has_theory===void 0||this.subject.has_theory))},hasLab(){return!!(this.subject&&(this.subject.has_lab!==void 0&&this.subject.has_lab))},hasAttendance(){return!!(this.subject&&(this.subject.has_attendance!==void 0&&this.subject.has_attendance))},hasActivity(){return!!(this.subject&&(this.subject.has_activity!==void 0&&this.subject.has_activity))}},watch:{students:{immediate:!0,handler(e){this.rows=(e||[]).map(t=>{var s,l,a,o;return{...t,marks:{theory:((s=t.marks)==null?void 0:s.theory)??0,lab:((l=t.marks)==null?void 0:l.lab)??0,attendance:((a=t.marks)==null?void 0:a.attendance)??0,activity:((o=t.marks)==null?void 0:o.activity)??0}}})}},subjectId(e){e||(this.rows=[])}},methods:{validateField(e,t){const s=e.id,l=Number(e.marks[t])||0;this.errors[s]||(this.errors[s]={}),l>this.maxMarks?this.errors[s][t]=!0:delete this.errors[s][t],Object.keys(this.errors[s]||{}).length===0&&delete this.errors[s]},hasFieldError(e,t){var s;return((s=this.errors[e])==null?void 0:s[t])===!0},isTotalExceeding(e){return this.calculateRowTotal(e)>this.maxMarks},hasAnyErrors(e){return this.errors[e]&&Object.keys(this.errors[e]).length>0},calculateRowTotal(e){const t=Number(e.marks.theory)||0,s=this.hasLab&&Number(e.marks.lab)||0,l=this.hasAttendance&&Number(e.marks.attendance)||0,a=this.hasActivity&&Number(e.marks.activity)||0;return t+s+l+a},saveClassResults(){let e=!1;if(this.rows.forEach(s=>{const l=this.calculateRowTotal(s);["theory","lab","attendance","activity"].forEach(a=>{s.marks[a]&&Number(s.marks[a])>this.maxMarks&&(this.validateField(s,a),e=!0)}),l>this.maxMarks&&(e=!0)}),e)return this.$emit("error",`Marks cannot exceed max marks (${this.maxMarks})`);if(!this.examId||!this.subjectId)return this.$emit("error","Exam and subject are required");const t=this.rows.map(s=>({id:s.result_id||null,student_id:s.student_id,exam_id:this.examId,subject_id:this.subjectId,theory_marks:parseFloat(s.marks.theory)||0,lab_marks:parseFloat(s.marks.lab)||0,attendance_marks:parseFloat(s.marks.attendance)||0,activity_marks:parseFloat(s.marks.activity)||0,total_marks:this.calculateRowTotal(s)}));this.$emit("save",t)},updateSingleStudent(e){const t=this.calculateRowTotal(e);if(["theory","lab","attendance","activity"].forEach(l=>{e.marks[l]&&Number(e.marks[l])>this.maxMarks&&this.validateField(e,l)}),t>this.maxMarks)return this.$emit("error",`Total marks (${t}) cannot exceed max marks (${this.maxMarks})`);const s={result_id:e.result_id||null,student_id:e.student_id,exam_id:Number(this.examId),subject_id:Number(this.subjectId),marks:{...e.marks},total:this.calculateRowTotal(e)};console.debug("ClassWiseTable update payload:",s),this.$emit("update",s)}}},lr={name:"StudentForm",props:{students:{type:Array,default:()=>[]},subjects:{type:Array,default:()=>[]},resultForm:{type:Object,default:()=>({})},selectedExam:{type:[Number,String],default:null},selectedCourse:{type:[Number,String],default:null}},template:`
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0"><i class="fa-solid fa-edit me-2"></i>Add / Edit Student Result</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Student *</label>
            <select v-model="resultForm.student_id" @change="onSelectionChange" class="form-select">
              <option :value="null">Select Student</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.name }} ({{ student.roll_number }})
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Subject *</label>
            <select v-model="resultForm.subject_id" @change="onSelectionChange" class="form-select">
              <option :value="null">Select Subject</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.subject_name }}
              </option>
            </select>
          </div>
        </div>

        <div class="row g-3 mt-3">
          <div class="col-md-3">
            <label class="form-label">Theory Marks</label>
            <input v-model.number="resultForm.theory_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Lab Marks</label>
            <input v-model.number="resultForm.lab_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Attendance</label>
            <input v-model.number="resultForm.attendance_marks" type="number" class="form-control" min="0" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Activity</label>
            <input v-model.number="resultForm.activity_marks" type="number" class="form-control" min="0" />
          </div>
        </div>

        <div class="mt-4 d-flex justify-content-end">
          <button @click="onSave" class="btn btn-primary px-4" :disabled="!selectedExam || !selectedCourse">Save Result</button>
        </div>
      </div>
    </div>
  `,methods:{onSelectionChange(){this.$emit("load-existing")},onSave(){this.$emit("save")}}},{ref:ee,reactive:ki,onMounted:or,computed:Ze,watch:Ot}=Vue,{useRouter:nr,useRoute:rr}=VueRouter,It={name:"ResultBook",template:sr,components:{ClassWiseTable:ar,StudentForm:lr},setup(){nr();const e=rr(),t=ee([]),s=ee([]),l=ee([]),a=ee([]),o=ee(null),n=ee(null),r=ee(null),u=ee(null),c=ee("manual"),m=ee(null),p=ee(!1),b=ee(!1),h=ee("class"),d=ee([]),i=ee([]),f=ee([]),g=Ze(()=>u.value?i.value.find(E=>String(E.id)===String(u.value)):null),y=Ze(()=>o.value?t.value.find(E=>String(E.id)===String(o.value)):null),C=Ze(()=>n.value?s.value.find(E=>String(E.id)===String(n.value)):null),j=Ze(()=>y.value&&y.value.max_marks||100),P=Ze(()=>r.value?a.value.find(E=>String(E.id)===String(r.value)):null),_=(E,M="info")=>{var N,A;M==="success"?(N=toast==null?void 0:toast.success)==null||N.call(toast,E):(A=toast==null?void 0:toast.error)==null||A.call(toast,E)},x=async()=>{p.value=!0;try{const[E,M,N,A]=await Promise.all([w.get("/options/exams/all"),w.get("/options/courses/all"),w.get("/options/subjects/all"),w.get("/options/academic-years/all")]),I=T=>{var O,$,J,U;return T?Array.isArray(T.data)?T.data:Array.isArray((O=T.data)==null?void 0:O.data)?T.data.data:Array.isArray(($=T.data)==null?void 0:$.exams)?T.data.exams:Array.isArray((J=T.data)==null?void 0:J.courses)?T.data.courses:Array.isArray((U=T.data)==null?void 0:U.subjects)?T.data.subjects:[]:[]};t.value=I(E),s.value=I(M),d.value=I(N),a.value=I(A)}catch(E){console.error(E),_("Error loading data")}finally{p.value=!1}},R=async()=>{var E,M,N;if(!n.value){l.value=[],i.value=[];return}try{const A=await w.get(`/students/class/${n.value}?limit=1000`);l.value=((M=(E=A.data)==null?void 0:E.data)==null?void 0:M.students)||[];const I=await w.get(`/courses/${n.value}/subjects?flat=true`);i.value=((N=I.data)==null?void 0:N.data)||I.data||[]}catch(A){console.error(A)}},S=async()=>{var E,M;if(f.value=[],!(!u.value||!o.value)){if(c.value==="manual"){!l.value.length&&n.value&&await R();try{const A=(await w.get(`/results?exam_id=${o.value}&subject_id=${u.value}`)).data;let I=[];Array.isArray(A)?I=A:Array.isArray(A==null?void 0:A.data)?I=A.data:A!=null&&A.success&&Array.isArray((E=A==null?void 0:A.data)==null?void 0:E.results)&&(I=A.data.results);const T={};I.forEach(O=>{T[O.student_id]=O}),f.value=l.value.map(O=>{const $=T[O.id]||{};return{id:O.id,student_id:O.id,name:O.name,roll_number:O.roll_number,result_id:$.id||null,marks:{theory:$.theory_marks??null,lab:$.lab_marks??null,attendance:$.attendance_marks??null,activity:$.activity_marks??null},total_marks:$.total_marks??null}})}catch(N){console.error(N),f.value=l.value||[]}return}try{const A=(await w.get(`/results?exam_id=${o.value}&subject_id=${u.value}`)).data;let I=[];Array.isArray(A)?I=A:Array.isArray(A==null?void 0:A.data)?I=A.data:A!=null&&A.success&&Array.isArray((M=A==null?void 0:A.data)==null?void 0:M.results)&&(I=A.data.results),f.value=I.map(T=>{var O,$;return{id:T.student_id,student_id:T.student_id,student_name:((O=T.Student)==null?void 0:O.name)||T.student_name||"Unknown",name:(($=T.Student)==null?void 0:$.name)||T.student_name||"Unknown",theory_marks:T.theory_marks,lab_marks:T.lab_marks,attendance_marks:T.attendance_marks,activity_marks:T.activity_marks,total_marks:T.total_marks,result_id:T.id}})}catch(N){console.error(N),f.value=[]}}},L=async E=>{try{if(!P.value){_("Please select an academic year first","error");return}const M=E.map(N=>({...N,academic_year_id:P.value.id}));await w.post("/results/save-class-result",{rows:M,academic_year_id:P.value.id}),_("Results saved successfully","success"),S()}catch(M){console.error(M),_("Failed to save results")}},k=async E=>{var M,N,A,I,T,O,$,J,U,Y;try{if(!P.value){_("Please select an academic year first","error");return}const K={id:E.result_id||null,student_id:Number(E.student_id),exam_id:Number(E.exam_id),subject_id:Number(E.subject_id),academic_year_id:P.value.id,theory_marks:parseFloat((M=E.marks)==null?void 0:M.theory)||0,lab_marks:parseFloat((N=E.marks)==null?void 0:N.lab)||0,attendance_marks:parseFloat((A=E.marks)==null?void 0:A.attendance)||0,activity_marks:parseFloat((I=E.marks)==null?void 0:I.activity)||0,total_marks:parseFloat(E.total)||0};E.result_id&&(K.id=E.result_id);const B=((O=(T=(await w.post("/results/save",K)).data)==null?void 0:T.data)==null?void 0:O.id)||E.result_id;_("Marks updated successfully","success");const Q=f.value.findIndex(me=>me.id===E.student_id);Q!==-1&&(f.value[Q]={...f.value[Q],result_id:B,marks:{theory:parseFloat(($=E.marks)==null?void 0:$.theory)||0,lab:parseFloat((J=E.marks)==null?void 0:J.lab)||0,attendance:parseFloat((U=E.marks)==null?void 0:U.attendance)||0,activity:parseFloat((Y=E.marks)==null?void 0:Y.activity)||0},total_marks:parseFloat(E.total)||0})}catch(K){console.error(K),_("Failed to update marks")}},D=E=>{var M;m.value=((M=E.target.files)==null?void 0:M[0])||null},G=async()=>{if(!m.value){_("Please select a file");return}b.value=!0;try{await ca();const E=window.XLSX,M=new FileReader;M.onload=async N=>{if(!P.value){_("Please select an academic year first","error"),b.value=!1;return}const A=new Uint8Array(N.target.result),I=E.read(A,{type:"array"}),T=[];if(I.SheetNames.forEach(O=>{const $=I.Sheets[O];E.utils.sheet_to_json($).forEach(U=>{const Y=Number(U["Student ID"]||U.student_id);if(!Y)return;const K=U.Theory!==void 0?Number(U.Theory):null,ve=U.Lab!==void 0?Number(U.Lab):null,B=U.Attendance!==void 0?Number(U.Attendance):null,Q=U.Activity!==void 0?Number(U.Activity):null,me=i.value.find(se=>(se.subject_code||se.subject_name).toLowerCase()===O.toLowerCase());me&&T.push({student_id:Y,exam_id:o.value,subject_id:me.id,academic_year_id:P.value.id,theory_marks:K,lab_marks:ve,attendance_marks:B,activity_marks:Q,total_marks:(K||0)+(ve||0)+(B||0)+(Q||0)})})}),!T.length){_("No valid data found"),b.value=!1;return}await w.post("/results/save-class-result",{rows:T,academic_year_id:P.value.id}),_(`Imported ${T.length} results`,"success"),m.value=null,await R(),b.value=!1},M.readAsArrayBuffer(m.value)}catch(E){console.error(E),_("Import failed"),b.value=!1}},X=async()=>{var E;if(!n.value||!o.value){_("Please select class and exam");return}try{const N=((E=(await w.get(`/courses/${n.value}/subjects?flat=true`)).data)==null?void 0:E.data)||[],A=t.value.find(O=>O.id===o.value),I=s.value.find(O=>O.id===n.value);let T=[];if(u.value==="__ALL__")T=i.value;else if(u.value){const O=g.value;T=O?[O]:[]}else T=N;await tr(T,l.value.sort((O,$)=>O.id-$.id),(I==null?void 0:I.course_code)||"Course",(A==null?void 0:A.exam_name)||"Exam",(I==null?void 0:I.course_name)||"")}catch(M){console.error(M),_("Template generation failed")}};return Ot(n,()=>{R()}),Ot(u,()=>{S()}),Ot(c,()=>{S()}),or(()=>{x();const E=new Date,M=E.getFullYear();let N=`${M}-${M+1}`;E.getMonth()<3&&(N=`${M-1}-${M}`),setTimeout(()=>{if(a.value.length>0){const I=a.value.find(T=>T.name===N);I?r.value=I.id:a.value.length>0&&(r.value=a.value[0].id)}},500),e.path.includes("class-wise")?h.value="class":e.path.includes("student-wise")&&(h.value="student")}),{exams:t,courses:s,students:l,academicYears:a,subjects:d,subjectsForCourse:i,studentsForSubject:f,selectedExam:o,selectedCourse:n,selectedAcademicYear:r,selectedSubjectForClass:u,selectedSubjectObj:g,selectedExamObj:y,selectedCourseObj:C,selectedMaxMarks:j,selectedAcademicYearObj:P,importMode:c,file:m,loading:p,uploading:b,viewMode:h,onFileChange:D,importResultsFromFile:G,downloadResultsTemplate:X,fetchStudentsByClass:R,loadStudentsForSubject:S,handleClasswiseSave:L,handleRowUpdate:k,notifyOrAlert:_}}},ir=`
<div class="school-profile-container">
  <!-- Header -->
  <div class="page-header mb-4">
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h1 class="mb-1">
          <i class="fa-solid fa-landmark me-2"></i>School Profile
        </h1>
        <p class="text-muted mb-0">Manage your school details and information</p>
      </div>
      <button 
        v-if="!loading"
        class="btn"
        :class="editMode ? 'btn-warning' : 'btn-primary'"
        @click="toggleEditMode"
        :disabled="saving"
      >
        <i :class="editMode ? 'fa-solid fa-times me-2' : 'fa-solid fa-pen-to-square me-2'"></i>
        {{ editMode ? 'Cancel' : 'Edit Profile' }}
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- Success Message -->
  <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="fa-solid fa-check-circle me-2"></i>
    <strong>Success!</strong> {{ successMessage }}
    <button type="button" class="btn-close" @click="successMessage = ''"></button>
  </div>

  <!-- Error Message -->
  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="fa-solid fa-exclamation-circle me-2"></i>
    <strong>Error!</strong> {{ errorMessage }}
    <button type="button" class="btn-close" @click="errorMessage = ''"></button>
  </div>

  <!-- Profile Content -->
  <div v-if="!loading" class="row">
    <!-- Logo Section -->
    <div class="col-lg-3 mb-4">
      <div class="card sticky-top" style="top: 20px;">
        <div class="card-body text-center">
          <div class="mb-3">
            <i v-if="!form.logo_url" class="fa-solid fa-school fa-5x text-secondary"></i>
            <img v-else :src="form.logo_url" :alt="form.school_name" class="img-fluid" style="max-height: 180px;">
          </div>
          <h5>{{ form.school_name || 'School Name' }}</h5>
          <p class="text-muted small mb-0">{{ form.abbreviation || 'N/A' }}</p>
          <hr>
          <p class="small text-muted mb-0">
            <i class="fa-solid fa-calendar me-2"></i>Established {{ form.year_established || 'N/A' }}
          </p>
          <p class="small text-muted mb-0">
            <i class="fa-solid fa-graduation-cap me-2"></i>{{ form.board || 'N/A' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="col-lg-9">
      <div class="card">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            <i class="fa-solid fa-info-circle me-2"></i>School Information
          </h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="saveSchoolData">
            <!-- Row 1: School Name & Abbreviation -->
            <div class="row mb-3">
              <div class="col-md-8">
                <label class="form-label"><strong>School Name *</strong></label>
                <input 
                  v-model="form.school_name" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="Enter school name"
                  required
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>Abbreviation</strong></label>
                <input 
                  v-model="form.abbreviation" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="e.g., XYZ"
                  maxlength="10"
                >
              </div>
            </div>

            <!-- Row 2: Email & Phone -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label"><strong>Email</strong></label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="school@example.com"
                >
              </div>
              <div class="col-md-6">
                <label class="form-label"><strong>Phone</strong></label>
                <input 
                  v-model="form.phone" 
                  type="tel" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="+91-XXXXXXXXXX"
                >
              </div>
            </div>

            <!-- Row 3: Address -->
            <div class="mb-3">
              <label class="form-label"><strong>Address</strong></label>
              <textarea 
                v-model="form.address" 
                class="form-control"
                :readonly="!editMode"
                rows="3"
                placeholder="Enter full address"
              ></textarea>
            </div>

            <!-- Row 4: City, State, Pincode -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label"><strong>City</strong></label>
                <input 
                  v-model="form.city" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="City"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>State</strong></label>
                <input 
                  v-model="form.state" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="State"
                >
              </div>
              <div class="col-md-4">
                <label class="form-label"><strong>Pincode</strong></label>
                <input 
                  v-model="form.pincode" 
                  type="text" 
                  class="form-control"
                  :readonly="!editMode"
                  placeholder="000000"
                >
              </div>
            </div>

            <hr>

            <!-- ACCORDION: Principal Information -->
            <div class="accordion mb-3" id="accordionPrincipal">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePrincipal" aria-expanded="false" aria-controls="collapsePrincipal">
                    <i class="fa-solid fa-user-tie me-2"></i><strong>Principal Information</strong>
                  </button>
                </h2>
                <div id="collapsePrincipal" class="accordion-collapse collapse" data-bs-parent="#accordionPrincipal">
                  <div class="accordion-body pt-3">
                    <!-- Row 5: Principal Name & Email -->
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label"><strong>Principal Name</strong></label>
                        <input 
                          v-model="form.principal_name" 
                          type="text" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="Enter principal's name"
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label"><strong>Principal Email</strong></label>
                        <input 
                          v-model="form.principal_email" 
                          type="email" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="principal@school.com"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCORDION: Additional Information -->
            <div class="accordion mb-3" id="accordionAdditional">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdditional" aria-expanded="false" aria-controls="collapseAdditional">
                    <i class="fa-solid fa-cog me-2"></i><strong>Additional Information</strong>
                  </button>
                </h2>
                <div id="collapseAdditional" class="accordion-collapse collapse" data-bs-parent="#accordionAdditional">
                  <div class="accordion-body pt-3">
                    <!-- Row 6: Website, Board, Year Established -->
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label"><strong>Website</strong></label>
                        <input 
                          v-model="form.website" 
                          type="url" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="https://www.school.com"
                        >
                      </div>
                      <div class="col-md-3">
                        <label class="form-label"><strong>Board</strong></label>
                        <input 
                          v-model="form.board" 
                          type="text" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="CBSE"
                        >
                      </div>
                      <div class="col-md-3">
                        <label class="form-label"><strong>Year Established</strong></label>
                        <input 
                          v-model.number="form.year_established" 
                          type="number" 
                          class="form-control"
                          :readonly="!editMode"
                          placeholder="YYYY"
                          min="1900"
                          max="2099"
                        >
                      </div>
                    </div>

                    <!-- Row 7: Logo URL -->
                    <div class="mb-0">
                      <label class="form-label"><strong>Logo URL</strong></label>
                      <input 
                        v-model="form.logo_url" 
                        type="url" 
                        class="form-control"
                        :readonly="!editMode"
                        placeholder="https://example.com/logo.png"
                      >
                      <small class="form-text text-muted">Enter the URL of your school logo</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 justify-content-end mt-4" v-if="editMode">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="resetForm"
                :disabled="saving"
              >
                <i class="fa-solid fa-times me-2"></i>Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-success"
                :disabled="saving"
              >
                <span v-if="!saving">
                  <i class="fa-solid fa-save me-2"></i>Save Changes
                </span>
                <span v-else>
                  <i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Additional Details Card - Accordion -->
      <div class="card mt-4">
        <div class="accordion" id="accordionQuickInfo">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseQuickInfo" aria-expanded="true" aria-controls="collapseQuickInfo">
                <i class="fa-solid fa-book me-2"></i><h5 class="mb-0">Quick Info</h5>
              </button>
            </h2>
            <div id="collapseQuickInfo" class="accordion-collapse collapse show" data-bs-parent="#accordionQuickInfo">
              <div class="accordion-body">
                <div class="row text-center">
                  <div class="col-md-4 border-end">
                    <p class="text-muted small mb-2">Founded</p>
                    <h5><i class="fa-solid fa-calendar me-2"></i>{{ form.year_established || '-' }}</h5>
                  </div>
                  <div class="col-md-4 border-end">
                    <p class="text-muted small mb-2">Board</p>
                    <h5><i class="fa-solid fa-graduation-cap me-2"></i>{{ form.board || '-' }}</h5>
                  </div>
                  <div class="col-md-4">
                    <p class="text-muted small mb-2">Principal</p>
                    <h5><i class="fa-solid fa-user-tie me-2"></i>{{ form.principal_name || '-' }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</div>

<style scoped>
.school-profile-container {
  padding: 20px 0;
}

.page-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 20px;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 8px;
}

.card-header {
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
}

/* Accordion Styling */
.accordion-button {
  font-weight: 500;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
  color: #495057;
}

.accordion-button:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}

.accordion-button:hover {
  background-color: #f1f3f5;
}

.accordion-item {
  border: 1px solid #dee2e6;
  margin-bottom: 8px;
  border-radius: 6px;
}

.accordion-item:first-child {
  border-radius: 6px;
}

.accordion-item:last-child {
  margin-bottom: 0;
}

.accordion-body {
  padding: 1.5rem;
  background-color: #ffffff;
}

input[readonly], textarea[readonly] {
  background-color: #f8f9fa !important;
  cursor: not-allowed;
}

.form-label {
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* Reduce spacing for compact layout */
.py-2 {
  padding-top: 0.4rem !important;
  padding-bottom: 0.4rem !important;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .col-lg-3, .col-lg-9 {
    width: 100%;
  }

  .sticky-top {
    position: static !important;
  }

  .card-body {
    padding: 1rem;
  }

  .accordion-body {
    padding: 1rem;
  }

  .row.text-center > div {
    border-right: none !important;
    margin-bottom: 1rem;
  }
}

/* Compact form vertical spacing */
.accordion-body .row:not(:last-child) {
  margin-bottom: 1rem;
}

/* Highlight active section */
.accordion .accordion-button:not(.collapsed) {
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.125);
}
</style>
`;/**
* @vue/shared v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function cr(e){const t=Object.create(null);for(const s of e.split(","))t[s]=1;return s=>s in t}const dr={},ur=Object.assign,mr=Object.prototype.hasOwnProperty,qt=(e,t)=>mr.call(e,t),Oe=Array.isArray,xt=e=>da(e)==="[object Map]",tt=e=>typeof e=="function",fr=e=>typeof e=="string",dt=e=>typeof e=="symbol",Ye=e=>e!==null&&typeof e=="object",pr=e=>(Ye(e)||tt(e))&&tt(e.then)&&tt(e.catch),vr=Object.prototype.toString,da=e=>vr.call(e),br=e=>da(e).slice(8,-1),es=e=>fr(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,Be=(e,t)=>!Object.is(e,t);let Is;const ts=()=>Is||(Is=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});/**
* @vue/reactivity v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let W,ua=0,st,at;function hr(e,t=!1){if(e.flags|=8,t){e.next=at,at=e;return}e.next=st,st=e}function ss(){ua++}function as(){if(--ua>0)return;if(at){let t=at;for(at=void 0;t;){const s=t.next;t.next=void 0,t.flags&=-9,t=s}}let e;for(;st;){let t=st;for(st=void 0;t;){const s=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(l){e||(e=l)}t=s}}if(e)throw e}function gr(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function yr(e){let t,s=e.depsTail,l=s;for(;l;){const a=l.prevDep;l.version===-1?(l===s&&(s=a),fa(l),wr(l)):t=l,l.dep.activeLink=l.prevActiveLink,l.prevActiveLink=void 0,l=a}e.deps=t,e.depsTail=s}function xr(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(ma(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function ma(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===lt)||(e.globalVersion=lt,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!xr(e))))return;e.flags|=2;const t=e.dep,s=W,l=_e;W=e,_e=!0;try{gr(e);const a=e.fn(e._value);(t.version===0||Be(a,e._value))&&(e.flags|=128,e._value=a,t.version++)}catch(a){throw t.version++,a}finally{W=s,_e=l,yr(e),e.flags&=-3}}function fa(e,t=!1){const{dep:s,prevSub:l,nextSub:a}=e;if(l&&(l.nextSub=a,e.prevSub=void 0),a&&(a.prevSub=l,e.nextSub=void 0),s.subs===e&&(s.subs=l,!l&&s.computed)){s.computed.flags&=-5;for(let o=s.computed.deps;o;o=o.nextDep)fa(o,!0)}!t&&!--s.sc&&s.map&&s.map.delete(s.key)}function wr(e){const{prevDep:t,nextDep:s}=e;t&&(t.nextDep=s,e.prevDep=void 0),s&&(s.prevDep=t,e.nextDep=void 0)}let _e=!0;const pa=[];function ls(){pa.push(_e),_e=!1}function os(){const e=pa.pop();_e=e===void 0?!0:e}let lt=0;class Sr{constructor(t,s){this.sub=t,this.dep=s,this.version=s.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class ns{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(t){if(!W||!_e||W===this.computed)return;let s=this.activeLink;if(s===void 0||s.sub!==W)s=this.activeLink=new Sr(W,this),W.deps?(s.prevDep=W.depsTail,W.depsTail.nextDep=s,W.depsTail=s):W.deps=W.depsTail=s,va(s);else if(s.version===-1&&(s.version=this.version,s.nextDep)){const l=s.nextDep;l.prevDep=s.prevDep,s.prevDep&&(s.prevDep.nextDep=l),s.prevDep=W.depsTail,s.nextDep=void 0,W.depsTail.nextDep=s,W.depsTail=s,W.deps===s&&(W.deps=l)}return s}trigger(t){this.version++,lt++,this.notify(t)}notify(t){ss();try{for(let s=this.subs;s;s=s.prevSub)s.sub.notify()&&s.sub.dep.notify()}finally{as()}}}function va(e){if(e.dep.sc++,e.sub.flags&4){const t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let l=t.deps;l;l=l.nextDep)va(l)}const s=e.dep.subs;s!==e&&(e.prevSub=s,s&&(s.nextSub=e)),e.dep.subs=e}}const Yt=new WeakMap,Ie=Symbol(""),zt=Symbol(""),ot=Symbol("");function oe(e,t,s){if(_e&&W){let l=Yt.get(e);l||Yt.set(e,l=new Map);let a=l.get(s);a||(l.set(s,a=new ns),a.map=l,a.key=s),a.track()}}function Se(e,t,s,l,a,o){const n=Yt.get(e);if(!n){lt++;return}const r=u=>{u&&u.trigger()};if(ss(),t==="clear")n.forEach(r);else{const u=Oe(e),c=u&&es(s);if(u&&s==="length"){const m=Number(l);n.forEach((p,b)=>{(b==="length"||b===ot||!dt(b)&&b>=m)&&r(p)})}else switch((s!==void 0||n.has(void 0))&&r(n.get(s)),c&&r(n.get(ot)),t){case"add":u?c&&r(n.get("length")):(r(n.get(Ie)),xt(e)&&r(n.get(zt)));break;case"delete":u||(r(n.get(Ie)),xt(e)&&r(n.get(zt)));break;case"set":xt(e)&&r(n.get(Ie));break}}as()}function De(e){const t=H(e);return t===e?t:(oe(t,"iterate",ot),ke(e)?t:t.map(ae))}function rs(e){return oe(e=H(e),"iterate",ot),e}const _r={__proto__:null,[Symbol.iterator](){return Nt(this,Symbol.iterator,ae)},concat(...e){return De(this).concat(...e.map(t=>Oe(t)?De(t):t))},entries(){return Nt(this,"entries",e=>(e[1]=ae(e[1]),e))},every(e,t){return be(this,"every",e,t,void 0,arguments)},filter(e,t){return be(this,"filter",e,t,s=>s.map(ae),arguments)},find(e,t){return be(this,"find",e,t,ae,arguments)},findIndex(e,t){return be(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return be(this,"findLast",e,t,ae,arguments)},findLastIndex(e,t){return be(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return be(this,"forEach",e,t,void 0,arguments)},includes(...e){return Ft(this,"includes",e)},indexOf(...e){return Ft(this,"indexOf",e)},join(e){return De(this).join(e)},lastIndexOf(...e){return Ft(this,"lastIndexOf",e)},map(e,t){return be(this,"map",e,t,void 0,arguments)},pop(){return et(this,"pop")},push(...e){return et(this,"push",e)},reduce(e,...t){return Ns(this,"reduce",e,t)},reduceRight(e,...t){return Ns(this,"reduceRight",e,t)},shift(){return et(this,"shift")},some(e,t){return be(this,"some",e,t,void 0,arguments)},splice(...e){return et(this,"splice",e)},toReversed(){return De(this).toReversed()},toSorted(e){return De(this).toSorted(e)},toSpliced(...e){return De(this).toSpliced(...e)},unshift(...e){return et(this,"unshift",e)},values(){return Nt(this,"values",ae)}};function Nt(e,t,s){const l=rs(e),a=l[t]();return l!==e&&!ke(e)&&(a._next=a.next,a.next=()=>{const o=a._next();return o.done||(o.value=s(o.value)),o}),a}const kr=Array.prototype;function be(e,t,s,l,a,o){const n=rs(e),r=n!==e&&!ke(e),u=n[t];if(u!==kr[t]){const p=u.apply(e,o);return r?ae(p):p}let c=s;n!==e&&(r?c=function(p,b){return s.call(this,ae(p),b,e)}:s.length>2&&(c=function(p,b){return s.call(this,p,b,e)}));const m=u.call(n,c,l);return r&&a?a(m):m}function Ns(e,t,s,l){const a=rs(e);let o=s;return a!==e&&(ke(e)?s.length>3&&(o=function(n,r,u){return s.call(this,n,r,u,e)}):o=function(n,r,u){return s.call(this,n,ae(r),u,e)}),a[t](o,...l)}function Ft(e,t,s){const l=H(e);oe(l,"iterate",ot);const a=l[t](...s);return(a===-1||a===!1)&&Ur(s[0])?(s[0]=H(s[0]),l[t](...s)):a}function et(e,t,s=[]){ls(),ss();const l=H(e)[t].apply(e,s);return as(),os(),l}const Er=cr("__proto__,__v_isRef,__isVue"),ba=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(dt));function Ar(e){dt(e)||(e=String(e));const t=H(this);return oe(t,"has",e),t.hasOwnProperty(e)}class ha{constructor(t=!1,s=!1){this._isReadonly=t,this._isShallow=s}get(t,s,l){if(s==="__v_skip")return t.__v_skip;const a=this._isReadonly,o=this._isShallow;if(s==="__v_isReactive")return!a;if(s==="__v_isReadonly")return a;if(s==="__v_isShallow")return o;if(s==="__v_raw")return l===(a?o?Nr:xa:o?Ir:ya).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(l)?t:void 0;const n=Oe(t);if(!a){let u;if(n&&(u=_r[s]))return u;if(s==="hasOwnProperty")return Ar}const r=Reflect.get(t,s,He(t)?t:l);if((dt(s)?ba.has(s):Er(s))||(a||oe(t,"get",s),o))return r;if(He(r)){const u=n&&es(s)?r:r.value;return a&&Ye(u)?Wt(u):u}return Ye(r)?a?Wt(r):wa(r):r}}class jr extends ha{constructor(t=!1){super(!1,t)}set(t,s,l,a){let o=t[s];if(!this._isShallow){const u=ze(o);if(!ke(l)&&!ze(l)&&(o=H(o),l=H(l)),!Oe(t)&&He(o)&&!He(l))return u||(o.value=l),!0}const n=Oe(t)&&es(s)?Number(s)<t.length:qt(t,s),r=Reflect.set(t,s,l,He(t)?t:a);return t===H(a)&&(n?Be(l,o)&&Se(t,"set",s,l):Se(t,"add",s,l)),r}deleteProperty(t,s){const l=qt(t,s);t[s];const a=Reflect.deleteProperty(t,s);return a&&l&&Se(t,"delete",s,void 0),a}has(t,s){const l=Reflect.has(t,s);return(!dt(s)||!ba.has(s))&&oe(t,"has",s),l}ownKeys(t){return oe(t,"iterate",Oe(t)?"length":Ie),Reflect.ownKeys(t)}}class Rr extends ha{constructor(t=!1){super(!0,t)}set(t,s){return!0}deleteProperty(t,s){return!0}}const Tr=new jr,Pr=new Rr,Vt=e=>e,vt=e=>Reflect.getPrototypeOf(e);function Mr(e,t,s){return function(...l){const a=this.__v_raw,o=H(a),n=xt(o),r=e==="entries"||e===Symbol.iterator&&n,u=e==="keys"&&n,c=a[e](...l),m=s?Vt:t?Xt:ae;return!t&&oe(o,"iterate",u?zt:Ie),{next(){const{value:p,done:b}=c.next();return b?{value:p,done:b}:{value:r?[m(p[0]),m(p[1])]:m(p),done:b}},[Symbol.iterator](){return this}}}}function bt(e){return function(...t){return e==="delete"?!1:e==="clear"?void 0:this}}function Cr(e,t){const s={get(a){const o=this.__v_raw,n=H(o),r=H(a);e||(Be(a,r)&&oe(n,"get",a),oe(n,"get",r));const{has:u}=vt(n),c=t?Vt:e?Xt:ae;if(u.call(n,a))return c(o.get(a));if(u.call(n,r))return c(o.get(r));o!==n&&o.get(a)},get size(){const a=this.__v_raw;return!e&&oe(H(a),"iterate",Ie),a.size},has(a){const o=this.__v_raw,n=H(o),r=H(a);return e||(Be(a,r)&&oe(n,"has",a),oe(n,"has",r)),a===r?o.has(a):o.has(a)||o.has(r)},forEach(a,o){const n=this,r=n.__v_raw,u=H(r),c=t?Vt:e?Xt:ae;return!e&&oe(u,"iterate",Ie),r.forEach((m,p)=>a.call(o,c(m),c(p),n))}};return ur(s,e?{add:bt("add"),set:bt("set"),delete:bt("delete"),clear:bt("clear")}:{add(a){!t&&!ke(a)&&!ze(a)&&(a=H(a));const o=H(this);return vt(o).has.call(o,a)||(o.add(a),Se(o,"add",a,a)),this},set(a,o){!t&&!ke(o)&&!ze(o)&&(o=H(o));const n=H(this),{has:r,get:u}=vt(n);let c=r.call(n,a);c||(a=H(a),c=r.call(n,a));const m=u.call(n,a);return n.set(a,o),c?Be(o,m)&&Se(n,"set",a,o):Se(n,"add",a,o),this},delete(a){const o=H(this),{has:n,get:r}=vt(o);let u=n.call(o,a);u||(a=H(a),u=n.call(o,a)),r&&r.call(o,a);const c=o.delete(a);return u&&Se(o,"delete",a,void 0),c},clear(){const a=H(this),o=a.size!==0,n=a.clear();return o&&Se(a,"clear",void 0,void 0),n}}),["keys","values","entries",Symbol.iterator].forEach(a=>{s[a]=Mr(a,e,t)}),s}function ga(e,t){const s=Cr(e,t);return(l,a,o)=>a==="__v_isReactive"?!e:a==="__v_isReadonly"?e:a==="__v_raw"?l:Reflect.get(qt(s,a)&&a in l?s:l,a,o)}const Lr={get:ga(!1,!1)},Or={get:ga(!0,!1)},ya=new WeakMap,Ir=new WeakMap,xa=new WeakMap,Nr=new WeakMap;function Fr(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function $r(e){return e.__v_skip||!Object.isExtensible(e)?0:Fr(br(e))}function wa(e){return ze(e)?e:Sa(e,!1,Tr,Lr,ya)}function Wt(e){return Sa(e,!0,Pr,Or,xa)}function Sa(e,t,s,l,a){if(!Ye(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const o=$r(e);if(o===0)return e;const n=a.get(e);if(n)return n;const r=new Proxy(e,o===2?l:s);return a.set(e,r),r}function ze(e){return!!(e&&e.__v_isReadonly)}function ke(e){return!!(e&&e.__v_isShallow)}function Ur(e){return e?!!e.__v_raw:!1}function H(e){const t=e&&e.__v_raw;return t?H(t):e}const ae=e=>Ye(e)?wa(e):e,Xt=e=>Ye(e)?Wt(e):e;function He(e){return e?e.__v_isRef===!0:!1}function ne(e){return Dr(e,!1)}function Dr(e,t){return He(e)?e:new Br(e,t)}class Br{constructor(t,s){this.dep=new ns,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=s?t:H(t),this._value=s?t:ae(t),this.__v_isShallow=s}get value(){return this.dep.track(),this._value}set value(t){const s=this._rawValue,l=this.__v_isShallow||ke(t)||ze(t);t=l?t:H(t),Be(t,s)&&(this._rawValue=t,this._value=l?t:ae(t),this.dep.trigger())}}class Hr{constructor(t,s,l){this.fn=t,this.setter=s,this._value=void 0,this.dep=new ns(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=lt-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!s,this.isSSR=l}notify(){if(this.flags|=16,!(this.flags&8)&&W!==this)return hr(this,!0),!0}get value(){const t=this.dep.track();return ma(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function qr(e,t,s=!1){let l,a;return tt(e)?l=e:(l=e.get,a=e.set),new Hr(l,a,s)}/**
* @vue/runtime-core v3.5.24
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function _a(e,t,s,l){try{return l?e(...l):e()}catch(a){Ea(a,t,s)}}function ka(e,t,s,l){if(tt(e)){const a=_a(e,t,s,l);return a&&pr(a)&&a.catch(o=>{Ea(o,t,s)}),a}if(Oe(e)){const a=[];for(let o=0;o<e.length;o++)a.push(ka(e[o],t,s,l));return a}}function Ea(e,t,s,l=!0){const a=t?t.vnode:null,{errorHandler:o,throwUnhandledErrorInProduction:n}=t&&t.appContext.config||dr;if(t){let r=t.parent;const u=t.proxy,c=`https://vuejs.org/error-reference/#runtime-${s}`;for(;r;){const m=r.ec;if(m){for(let p=0;p<m.length;p++)if(m[p](e,u,c)===!1)return}r=r.parent}if(o){ls(),_a(o,null,10,[e,u,c]),os();return}}Yr(e,s,a,l,n)}function Yr(e,t,s,l=!0,a=!1){if(a)throw e;console.error(e)}ts().requestIdleCallback;ts().cancelIdleCallback;function zr(e,t,s=jt,l=!1){if(s){const a=s[e]||(s[e]=[]),o=t.__weh||(t.__weh=(...n)=>{ls();const r=Wr(s),u=ka(t,s,e,n);return r(),os(),u});return l?a.unshift(o):a.push(o),o}}const Vr=e=>(t,s=jt)=>{(!is||e==="sp")&&zr(e,(...l)=>t(...l),s)},Aa=Vr("m");let jt=null,Jt;{const e=ts(),t=(s,l)=>{let a;return(a=e[s])||(a=e[s]=[]),a.push(l),o=>{a.length>1?a.forEach(n=>n(o)):a[0](o)}};Jt=t("__VUE_INSTANCE_SETTERS__",s=>jt=s),t("__VUE_SSR_SETTERS__",s=>is=s)}const Wr=e=>{const t=jt;return Jt(e),e.scope.on(),()=>{e.scope.off(),Jt(t)}};let is=!1;const we=(e,t)=>qr(e,t,is),de={SCHOOL:"pwp_school_data",USER:"pwp_user_data",AUTH_TOKEN:"pwp_auth_token",CACHE_TIMESTAMP:"pwp_cache_timestamp"};class z{static saveSchoolData(t){try{const s={id:t.id,name:t.name,abbreviation:t.abbreviation||null,email:t.email||null,phone:t.phone||null,address:t.address||null,city:t.city||null,state:t.state||null,pincode:t.pincode||null,logo_path:t.logo_path||null,logo_url:t.logo_url||null,website:t.website||null,principal_name:t.principal_name||null,principal_email:t.principal_email||null,year_established:t.year_established||null,board:t.board||null,timestamp:Date.now()};return localStorage.setItem(de.SCHOOL,JSON.stringify(s)),console.log("School data saved to local storage"),!0}catch(s){return console.error("Error saving school data to local storage:",s),!1}}static getSchoolData(){try{const t=localStorage.getItem(de.SCHOOL);return t?JSON.parse(t):null}catch(t){return console.error("Error reading school data from local storage:",t),null}}static saveUserData(t){try{const s={id:t.id,name:t.name,email:t.email,role:t.role,school_id:t.school_id,timestamp:Date.now()};return localStorage.setItem(de.USER,JSON.stringify(s)),console.log("User data saved to local storage"),!0}catch(s){return console.error("Error saving user data to local storage:",s),!1}}static getUserData(){try{const t=localStorage.getItem(de.USER);return t?JSON.parse(t):null}catch(t){return console.error("Error reading user data from local storage:",t),null}}static saveAuthToken(t){try{return localStorage.setItem(de.AUTH_TOKEN,t),!0}catch(s){return console.error("Error saving auth token:",s),!1}}static getAuthToken(){try{return localStorage.getItem(de.AUTH_TOKEN)}catch(t){return console.error("Error reading auth token:",t),null}}static saveSchoolLogo(t){try{return t?t.length>500*1024?(console.warn("Logo data too large, skipping local storage save"),!1):(localStorage.setItem(`${de.SCHOOL}_logo`,t),!0):!1}catch(s){return console.error("Error saving school logo:",s),!1}}static getSchoolLogo(){try{return localStorage.getItem(`${de.SCHOOL}_logo`)}catch(t){return console.error("Error reading school logo:",t),null}}static clearSchoolData(){try{return localStorage.removeItem(de.SCHOOL),localStorage.removeItem(`${de.SCHOOL}_logo`),!0}catch(t){return console.error("Error clearing school data:",t),!1}}static clearUserData(){try{return localStorage.removeItem(de.USER),!0}catch(t){return console.error("Error clearing user data:",t),!1}}static clearAuthToken(){try{return localStorage.removeItem(de.AUTH_TOKEN),!0}catch(t){return console.error("Error clearing auth token:",t),!1}}static clearAll(){try{return z.clearUserData(),z.clearSchoolData(),z.clearAuthToken(),console.log("All local storage cleared"),!0}catch(t){return console.error("Error clearing all local storage:",t),!1}}static isDataFresh(t=24*60*60*1e3){try{const s=z.getSchoolData();return!s||!s.timestamp?!1:Date.now()-s.timestamp<t}catch(s){return console.error("Error checking data freshness:",s),!1}}static getSchoolName(){const t=z.getSchoolData();return(t==null?void 0:t.name)||"School"}static getSchoolLogoUrl(){const t=z.getSchoolData();return(t==null?void 0:t.logo_url)||null}}function Xr(){const e=ne(null),t=ne(null),s=ne(!1),l=ne(null),a=()=>{try{s.value=!0,l.value=null;const i=z.getSchoolData();i?(e.value=i,console.log("School data loaded from local storage:",i)):(l.value="School data not found in local storage",console.warn("School data not found"));const f=z.getSchoolLogo();f&&(t.value=f)}catch(i){l.value=i.message,console.error("Error loading school data:",i)}finally{s.value=!1}},o=i=>{try{return z.saveSchoolData(i),e.value=i,console.log("School data saved:",i),!0}catch(f){return l.value=f.message,console.error("Error saving school data:",f),!1}},n=i=>{try{return z.saveSchoolLogo(i),t.value=i,!0}catch(f){return l.value=f.message,console.error("Error saving school logo:",f),!1}},r=()=>{try{return z.clearSchoolData(),e.value=null,t.value=null,console.log("School data cleared"),!0}catch(i){return l.value=i.message,console.error("Error clearing school data:",i),!1}},u=we(()=>{var i;return((i=e.value)==null?void 0:i.name)||""}),c=we(()=>{var i;return((i=e.value)==null?void 0:i.email)||""}),m=we(()=>{var i;return((i=e.value)==null?void 0:i.phone)||""}),p=we(()=>{var i;return((i=e.value)==null?void 0:i.abbreviation)||""}),b=we(()=>{var i;return((i=e.value)==null?void 0:i.logo_url)||t.value||""}),h=we(()=>{var i;return((i=e.value)==null?void 0:i.principal_name)||""}),d=we(()=>{var i;return((i=e.value)==null?void 0:i.board)||""});return Aa(()=>{a()}),{schoolData:e,schoolLogo:t,isLoading:s,error:l,loadSchoolData:a,saveSchoolData:o,saveSchoolLogo:n,clearSchoolData:r,schoolName:u,schoolEmail:c,schoolPhone:m,schoolAbbreviation:p,schoolLogoUrl:b,principalName:h,schoolBoard:d}}function Jr(){const e=ne(null),t=ne(null),s=ne(!1),l=ne(null),a=async(c,m)=>{try{s.value=!0,l.value=null;const p=await w.post("/auth/login",{username:c,email:c,password:m});if(!p.data.success)throw new Error(p.data.message||"Login failed");const{token:b,user:h,school:d}=p.data.data;return b&&(z.saveAuthToken(b),t.value=b),h&&(z.saveUserData(h),e.value=h),d&&z.saveSchoolData(d),console.log("Login successful, data saved to local storage"),{success:!0,user:h,school:d}}catch(p){return l.value=p.message,console.error("Login error:",p),{success:!1,error:p.message}}finally{s.value=!1}},o=async(c,m)=>{try{s.value=!0,l.value=null;const p=await w.post("/auth/login-pin",{email:c,pin:m});if(!p.data.success)throw new Error(p.data.message||"PIN login failed");const{token:b,user:h,school:d}=p.data.data;return b&&(z.saveAuthToken(b),t.value=b),h&&(z.saveUserData(h),e.value=h),d&&z.saveSchoolData(d),console.log("PIN login successful, data saved to local storage"),{success:!0,user:h,school:d}}catch(p){return l.value=p.message,console.error("PIN login error:",p),{success:!1,error:p.message}}finally{s.value=!1}},n=async()=>{try{return s.value=!0,l.value=null,await w.post("/auth/logout"),z.clearAll(),e.value=null,t.value=null,console.log("Logout successful, local storage cleared"),{success:!0}}catch(c){return l.value=c.message,console.error("Logout error:",c),z.clearAll(),e.value=null,t.value=null,{success:!1,error:c.message}}finally{s.value=!1}},r=()=>{try{const c=z.getUserData(),m=z.getAuthToken();return c&&(e.value=c),m&&(t.value=m),{user:c,token:m}}catch(c){return l.value=c.message,console.error("Error loading auth data:",c),{user:null,token:null}}},u=we(()=>!!t.value&&!!e.value);return{user:e,token:t,isLoading:s,error:l,login:a,loginWithPin:o,logout:n,loadAuthData:r,isAuthenticated:u}}const Kr={name:"SchoolProfile",template:ir,setup(){const{user:e}=Jr(),{schoolData:t}=Xr(),s=ne(!1),l=ne(!1),a=ne(""),o=ne(""),n=ne(!1),r=ne({school_name:"",abbreviation:"",email:"",phone:"",address:"",city:"",state:"",pincode:"",website:"",principal_name:"",principal_email:"",year_established:"",board:"",logo_url:""}),u=async()=>{var b,h,d,i;try{s.value=!0,o.value="";const f=((b=e.value)==null?void 0:b.school_id)||((h=t.value)==null?void 0:h.id);if(!f){o.value="School ID not found";return}const g=await w.get(`/school/${f}`);if(g.data.success){const y=g.data.data;r.value={school_name:y.school_name||y.name||"",abbreviation:y.abbreviation||"",email:y.email||"",phone:y.phone||y.contact_number||"",address:y.address||"",city:y.city||"",state:y.state||"",pincode:y.pincode||"",website:y.website||"",principal_name:y.principal_name||"",principal_email:y.principal_email||"",year_established:y.year_established||"",board:y.board||"",logo_url:y.logo_url||""}}}catch(f){console.error("Error loading school data:",f),o.value=((i=(d=f.response)==null?void 0:d.data)==null?void 0:i.message)||"Failed to load school data"}finally{s.value=!1}},c=async()=>{var b,h,d,i;try{l.value=!0,o.value="",a.value="";const f=((b=e.value)==null?void 0:b.school_id)||((h=t.value)==null?void 0:h.id);if(!f){o.value="School ID not found";return}if((await w.put(`/school/${f}`,r.value)).data.success){a.value="School profile updated successfully!";const y={...t.value,...r.value};z.saveSchoolData(y),n.value=!1,setTimeout(()=>{a.value=""},3e3)}}catch(f){console.error("Error saving school data:",f),o.value=((i=(d=f.response)==null?void 0:d.data)==null?void 0:i.message)||"Failed to save school profile"}finally{l.value=!1}},m=()=>{u(),n.value=!1,o.value=""},p=()=>{n.value?m():n.value=!0};return Aa(()=>{u()}),{loading:s,saving:l,successMessage:a,errorMessage:o,editMode:n,form:r,loadSchoolData:u,saveSchoolData:c,resetForm:m,toggleEditMode:p}}},Gr=[{path:"/",component:As},{path:"/dashboard",component:Co},{path:"/login",component:As},{path:"/students",component:Xo},{path:"/students/import",component:Zn},{path:"/subjects",component:sn},{path:"/courses",component:un},{path:"/exams",component:xn},{path:"/results",component:_n},{path:"/results/student-wise",component:Rn},{path:"/results/course-wise",component:Cn},{path:"/results/subject-wise",component:Nn},{path:"/results/generate",component:Bn},{path:"/results/result-book",component:It},{path:"/results/result-book/class-wise",component:It},{path:"/results/result-book/student-wise",component:It},{path:"/templates/marksheets",component:zn},{path:"/templates/marksheets/add",component:Os},{path:"/templates/marksheets/:id/edit",component:Os},{path:"/school/profile",component:Kr}],{createWebHistory:Qr,createRouter:Zr}=VueRouter,ei=[...Gr],ja=Zr({history:Qr("/srms/"),routes:ei});let Fs=localStorage;ja.beforeEach(async(e,t,s)=>{const l=localStorage.getItem("token");if(!l&&!e.path.endsWith("/login"))return s("/srms/login");if(l&&e.path.endsWith("/login"))return s("/srms/");if(l&&!Fs)try{const{data:a}=await api.get("/auth/verify-jwt",{params:{token:l}});if(!(a!=null&&a.valid))throw new Error("Invalid token");localStorage.setItem("user",JSON.stringify(a.user)),Fs=!0}catch{return localStorage.removeItem("token"),localStorage.removeItem("user"),s("/login")}s()});const{createApp:ti}=Vue,Ra=ti(Ja);Ra.use(ja);Ra.mount("#app");
