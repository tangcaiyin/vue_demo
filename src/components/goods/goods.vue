<template>
	<div>
		<div class="goods">
			<div class="menu-wrapper" ref='menuWrapper'>
				<ul>
				<!-- currentIndex 与当前某个li对应时，绑定current类名，定义样式 -->
					<li v-for='(item,index) in goods' :key='index' class='menu-item' :class="{'current':currentIndex === index}" @click='selectMenu(index,$event)' ref='menuList'>
						<span class="text border-1px">
							<span class="icon" v-show='item.type>0' :class='classMap[item.type]'></span>{{item.name}}
						</span>
					</li>
				</ul>
			</div>
			<div class="foods-wrapper" ref='foodsWrapper'>
				<ul>
					<li class="food-list food-list-hook" v-for='(item,index) in goods' :key='index'>
						<h1 class="title">{{item.name}}</h1>
						<ul>
							<li class='food-item border-1px' v-for='(food,foodIndex) in item.foods' :key='foodIndex' @click='selectFood(food,$event)'>
								<div class="icon">
									<img :src="food.icon" width='57' height='57'>
								</div>
								<div class="content">
									<h2 class="name">{{food.name}}</h2>
									<p class="desc">{{food.description}}</p>
									<div class="extra">
										<span class='count'>月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
									</div>
									<div class="price">
										<span class='now'>￥{{food.price}}</span><span class='old' v-show='food.oldPrice'>￥{{food.oldPrice}}</span>
									</div>
									<div class="cartcontrol-wrapper">
										<!-- 表示商品添加删除按钮的子组件 -->
										<cartcontrol @add='addFood' :food='food'></cartcontrol>
									</div>
								</div>
							</li>
						</ul>
					</li>
				</ul>
			</div>
			<!-- :select-foods='selectFoods' 用于父组件向子组件传值，子组件以props接收select-foods的驼峰写法 selectFoods，-->
			<shopcart :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
		</div>
		<food :food='selectedFood' @add='addFood' ref='food'></food>
	</div>
</template>

<script type='text/ecmascript-6'>
	import BScroll from 'better-scroll';
	import shopcart from '../shopcart/shopcart.vue';
	import cartcontrol from '../cartcontrol/cartcontrol.vue';
	import food from '../food/food.vue';
	const ERR_OK = 0;
	export default {
		props: {
			// 接收自App.vue父组件通过<router-view :seller='seller'></router-view>传到子组件的seller参数，并指定其数据类型
			seller: {
				type: Object
			}
		},
		data() {
			return {
				goods: [],
				listHeight: [],
				scrollY: 0,
				selectedFood: {}
			};
		},
		computed: {
			currentIndex() {
				for (let i = 0; i < this.listHeight.length; i++) {
					// 相邻两个li的高度
					let height1 = this.listHeight[ i ];
					let height2 = this.listHeight[ i + 1 ];
					// i 是最后一个时，height2 返回undefined，
					// height2 是最后一个，或 scrollY 介于两个高度之间
					if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
						// this._followScroll(i);
						return i;
					}
				};
				return 0;
			},
			selectFoods() {
				let foods = [];
				this.goods.forEach((good) => {
					good.foods.forEach((food) => {
						if (food.count) {
							foods.push(food);
						}
					});
				});
				return foods;
			}
		},
		created() {
			this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
			this.$http.get('/api/goods').then((response) => {
				response = response.body;
				if (response.errno === ERR_OK) {
					this.goods = response.data;
					// 数据更新，DOM重新渲染是在 this.$nextTick() 操作里执行的，
					// 在this.$nextTick()里调用才能确保此时DOM重新渲染成功，此时才能识别数据内容高度相对包裹层高度产生滚动
					this.$nextTick(() => {
						this._initScroll();
						this._calculateHeight();
					});
				}
			});
		},
		methods: {
			selectMenu(index, event) {
				// event._constructed 表示由自己派发事件，网页环境下非自主派发事件，则执行return阻止其执行
				if (!event._constructed) {
					return;
				}
				let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
				let el = foodList[index];
				// this.foodsScroll.scrollToElement(el, 300);
			},
			selectFood(food, event) {
				// event._constructed 表示由自己派发事件，网页环境下，非派发事件，return
				if (!event._constructed) {
					return;
				}
				this.selectedFood = food;
				// 调用子组件food的show()方法
				this.$refs.food.show();
			},
			_initScroll() {
				// this.$refs.menuWrapper 查找 ref='menuWrapper' 指定的元素，
				// 使用该插件的DOM里的点击事件，移动端环境下会被屏蔽，网页环境下不会被屏蔽(经测试，点击事件已被屏蔽)。插件设置参数click:true用于派发事件，使得相应DOM里可以执行点击事件。派发事件+原始点击事件会导致执行两次。
				// 左侧目录里派发事件
				this.menuScroll = new BScroll(this.$refs.menuWrapper, {
					click: true
				});
				// 右侧商品里派发事件，使得商品后的添加操作可以执行，
				// probeType: 3 用于检测实时滚动位置
				this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
					click: true,
					probeType: 3
				});
				// 监听scroll事件，pos为滚动高度，赋值y轴滚动高度
				this.foodsScroll.on('scroll', (pos) => {
					if (pos.y <= 0) {
						this.scrollY = Math.abs(Math.round(pos.y));
					}
				});
			},
			_calculateHeight() {
				let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
				let height = 0;
				this.listHeight.push(height);
				for (let i = 0; i < foodList.length; i++) {
					let item = foodList[i];
					height += item.clientHeight;
					this.listHeight.push(height);
				};
			},
			// _followScroll(index) {
			// 	let menuList = this.$refs.menuList;
			// 	let el = menuList[index];
			// 	this.meunScroll.scrollToElement(el, 300, 0, -100);
			// },
			// $dispatch 在vue2里废弃，也不再使用events接收派发事件
			// 接收cartcontrol.vue子组件里派发的事件，获取子组件里的当前点击的dom：target，
			// 子组件上执行派发事件，调用addFood()事件，内部调用_drop()事件，并传入target，
			// _drop()事件里调用另个子组件shopcart.vue里的drop()方法，并传递target，
			// 子组件shopcart.vue里获取到cartcontrol.vue子组件里的内容
			// 实现从子组件A-->父组件-->子组件B的传值
			addFood(target) {
				this._drop(target);
			},
			_drop(target) {
				// ref='xxx' 及 this.$refs.xxx，用于访问子组件、DOM元素，
				// dom元素更新后调用子组件方法，使得两个动画分开执行，同时执行会导致卡顿，
				this.$nextTick(() => {
					this.$refs.shopcart.drop(target);
				});
			}
		},
		components: {
			shopcart,
			cartcontrol,
			food
		}
	};
</script>

<!-- 需要安装stylus、stylus-loader 并加入依赖 -->
<style lang='stylus' rel='stylesheet/stylus'>
	@import '../../common/stylus/mixin.styl'
	.goods
		display:flex
		position:absolute
		top:174px
		bottom:46px
		width:100%
		overflow:hidden
		.menu-wrapper
			flex:0 0 80px
			// 不设置width,安卓上会出问题
			width:80px
			background:#f3f5f7
			.menu-item
				// 适合处理垂直居中
				display:table
				height:54px
				width:56px
				padding:0 12px
				line-height:14px
				&.current
					position:relative
					z-index:10
					margin-top:-1px
					background:#fff
					font-weight:700
					.text
						border-none()
				.icon
					display:inline-block
					vertical-align:top
					width:12px
					height:12px
					margin-right:2px
					background-size:12px 12px
					background-repeat:no-repeat
					&.decrease
						bg-image('decrease_3')
					&.discount
						bg-image('discount_3')
					&.guarantee
						bg-image('guarantee_3')
					&.invoice
						bg-image('invoice_3')
					&.special
						bg-image('special_3')
				.text
					display:table-cell
					width:56px
					// 在table布局里处理垂直居中
					vertical-align:middle
					border-1px(rgba(7,17,27,0.1))
					font-size:12px
		.foods-wrapper
			flex:1
			.title
				padding-left:14px
				height:26px
				line-height:26px
				border-left:2px solid #d9ddel
				font-size:12px
				color:rgb(147,153,159)
				background:#f3f5f7
			.food-item
				display:flex
				// 需求上下间距36px，上下margin会重叠，只显示一个margin尺寸，所以需要再设置padding-bottom:18px，
				margin:18px
				padding-bottom:18px
				border-1px(rgba(7,17,27,0.1))
				&:last-child
					border-none()
					margin-bottom:0
				.icon
					flex:0 0 57px
					margin-right:10px
				.content
					flex:1
					.name
						margin:2px 0 8px 0
						height:14px
						line-height:14px
						font-size:14px
						color:rgb(7,17,27)
					.desc, .extra
						line-height:10px
						font-size:10px
						color:rgb(147,153,159)
					.desc
						line-height:12px
						margin-bottom:8px
					.extra
						.count
							margin-right:12px
					.price
						font-weight:700
						line-height:24px
						.now
							margin-right:8px
							font-size:14px
							color:rgb(240,20,20)
						.old
							text-decoration:line-through
							font-size:10px
							color:rgb(147,153,159)
					.cartcontrol-wrapper
						position:absolute
						right:0
						bottom:12px
</style>
