import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import router from "./router"
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice';



const app = createApp(App);
app.use(PrimeVue,{
    theme:{
        preset:Aura
    }
});
app.use(ToastService);
app.use(router);
app.mount("#app");