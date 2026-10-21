import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { MroPreset } from './styles/theme';
import './styles/app.css';
import App from './App.vue';
import router from './router';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(ToastService)
  .use(PrimeVue, { theme: { preset: MroPreset, options: { darkModeSelector: '.app-dark' } } })
  .mount('#app');
