import { createApp } from 'vue'
import App from './App.vue'
//引入状态管理pinia框架
import { createPinia } from 'pinia'
//pinia持久化管理
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './components/common-components/router/page_router'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';


const pinia = createPinia();
const app = createApp(App);


pinia.use(piniaPluginPersistedstate)
app.use(pinia);
app.use(router);
app.use(Antd);

app.mount('#app');
