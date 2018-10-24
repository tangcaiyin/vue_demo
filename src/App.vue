<template>
  <div>
    <v-header :seller='seller'></v-header>
    <div class="tab border-1px">
        <div class="tab-item">
            <!-- <a v-link='{path: "/goods"}'>商品</a> -->
            <router-link to='/goods'>商品</router-link>
        </div>
        <div class="tab-item">
            <router-link to='/ratings'>评论</router-link>
        </div>
        <div class="tab-item">
            <router-link to='/seller'>商家</router-link>
        </div>
    </div>
    <!-- <keep-alive> 保留页面状态，切换后不会刷新 -->
    <keep-alive>
      <!-- 路由外链，切换路由时，更新 router-view 标签里的内容 -->
      <!-- 将seller传入goods、ratings、seller组件，以props接收 -->
      <router-view :seller='seller'></router-view>
    </keep-alive>
  </div>
</template>
<script type='text/ecmascript-6'>
// 引入子组件
import {urlParse} from './common/js/util.js';
import header from './components/header/header.vue';
// 定义常量
const ERR_OK = 0;
export default {
  // 定义为函数而不是对象，避免被修改影响其他组件
  data () {
    return {
      // 声明seller并在生命周期created里获取，可用于传到所有子组件
      seller: {
        // 从访问路径里获取商家id
        // id: (() => {
        //   let queryParam = urlParse();
        //   return queryParam.id;
        // })()
      }
    };
  },
  created () {
    // ?id=' + this.seller.id
    this.$http.get('/api/seller').then((response) => {
      // .json() 返回 Promise对象，.body返回data数据
      // response = response.json();
      response = response.body;
      if (response.errno === ERR_OK) {
        this.seller = response.data;
        // 通过合并对象为 this.seller 添加属性
        // this.seller = Object.assign({}, this.seller, response.data);
      }
    });
  },
  // 注册子组件
  components: {
    // 键值相同时可以简写一个，header 为H5关键字，不可使用
    'v-header': header
  }
};
</script>
<style lang='stylus' rel='stylesheet/stylus'>
@import "./common/stylus/mixin.styl"
.tab
  display:flex
  width:100%
  height:40px
  line-height:40px
  border-1px(rgba(7,17,27,0.1))
  .tab-item
    flex:1
    text-align:center
    & > a
      display:block
      font-size:14px
      color:rgb(77,85,93)
      &.active
        color:rgb(240,20,20)
</style>
