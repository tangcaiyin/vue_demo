import Vue from 'vue';
import VueRouter from 'vue-router';
import VueResource from 'vue-resource';
import App from './App.vue';
import goods from './components/goods/goods.vue';
import ratings from './components/ratings/ratings.vue';
import seller from './components/seller/seller.vue';
import './common/stylus/index.styl';

// 模块化编程，Vue上注册引入的模块
Vue.use(VueRouter);
Vue.use(VueResource);

const routes = [
	// {path: '/', component: goods},
	{path: '/goods', component: goods},
	{path: '/ratings', component: ratings},
	{path: '/seller', component: seller}
];
const router = new VueRouter({
	routes,
	// 当前路由指向的页面自动匹配.active样式，
	linkActiveClass: 'active'
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
});
// 默认路由到goods组件，
// 但在其他组件下刷新会跳转到goods组件，某些情况下会有bug，
router.push('/goods');
