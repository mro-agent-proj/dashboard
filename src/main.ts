import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { MroPreset } from './styles/theme';
import 'primeicons/primeicons.css';
import './styles/tokens.css';
import './styles/main.css';
import './styles/enterprise.css';
import App from './App.vue';
import router from './router';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(ToastService)
  .use(PrimeVue, { theme: { preset: MroPreset, options: { darkModeSelector: '.app-dark' } } })
  .mount('#app');
