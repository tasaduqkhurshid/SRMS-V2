import * as Vue from "vue";
import * as VueRouter from "vue-router";
import axios from "axios";
import * as bootstrap from "bootstrap";
import JustValidate from "just-validate";
import * as XLSX from "xlsx";
import FroalaEditor from "froala-editor";

import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import "../public/assets/css/global.css";

window.Vue = Vue;
window.VueRouter = VueRouter;
window.axios = axios;
window.bootstrap = bootstrap;
window.JustValidate = JustValidate;
window.XLSX = XLSX;
window.FroalaEditor = FroalaEditor;

await import("./utils/toasty.js");
await import("./utils/formValidator.js");

const [{ default: App }, { default: router }] = await Promise.all([
  import("./app.vue.js"),
  import("./routes/index.js")
]);

Vue.createApp(App).use(router).mount("#app");
