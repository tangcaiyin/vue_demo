<template>
	<div>
		<div class="shopcart">
			<!-- 底部购物车、总金额、结算 -->
			<div class="content" @click='toggleList'>
				<div class="content-left">
					<div class="logo-wrapper">
					<!-- 商品数量大于0时，显示高亮 -->
						<div class="logo" :class="{'highlight':totalCount>0}">
							<span class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></span>
						</div>
						<div class="num" v-show='totalCount>0'>{{totalCount}}</div>
					</div>
					<div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}元</div>
					<div class="desc">另需配送费￥{{deliveryPrice}}元</div>
				</div>
				<!-- @click.stop.prevent='pay' 阻止事件冒泡导致订单列表展开 -->
				<div class="content-right" @click.stop.prevent='pay'>
					<div class="pay" :class='payClass'>
						{{payDesc}}
					</div>
				</div>
			</div>
			<!-- 小球抛物线动画效果 -->
			<div class="ball-container">
				<div v-for='(ball, index) in balls' :key='index'>
					<transition name='drop' @before-enter='beforeDrop' @enter='dropping' @after-enter='afterDrop'>
						<div class='ball' v-show='ball.show'>
							<!-- inner-hook 仅用于JS获取dom元素 -->
							<div class="inner inner-hook"></div>
						</div>
					</transition>
				</div>
			</div>
			<!-- 购物车订单列表 -->
			<transition name='fold'>
				<div class="shopcart-list" v-show='listShow'>
					<div class="list-header">
						<h1 class="title">购物车</h1>
						<span class="empty" @click='empty'>清空</span>
					</div>
					<div class="list-content" ref='listContent'>
						<ul>
							<li class="food" v-for='(food, index) in selectFoods' :key='index'>
								<span class="name">{{food.name}}</span>
								<div class="price">
									<span>￥{{food.price * food.count}}</span>
								</div>
								<div class="cartcontrol-wrapper">
									<!-- 表示商品添加删除按钮的子组件 -->
									<cartcontrol @add='addFood' :food='food'></cartcontrol>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</transition>
		</div>
		<transition name='fade'>
			<div class="list-mask" v-show='listShow' @click='hideList'></div>
		</transition>
	</div>
</template>
<script type='text/ecmascript-6'>
	import BScroll from 'better-scroll';
	import cartcontrol from '../cartcontrol/cartcontrol.vue';
	export default {
		props: {
			// 指定接收的数据的类型、默认值
			// 加入购物车的商品
			selectFoods: {
				// Array、Object 类型数据，其默认值是函数
				type: Array,
				default() {
					return [
						{
							price: 10,
							count: 1
						}
					];
				}
			},
			// 配送费
			deliveryPrice: {
				type: Number,
				default: 0
			},
			// 起送金额
			minPrice: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				// 实现添加商品时，产生一个球体抛入购物车中
				// 所有小球
				balls: [
					{
						show: false
					},
					{
						show: false
					},
					{
						show: false
					},
					{
						show: false
					},
					{
						show: false
					}
				],
				// 下落的小球
				dropBalls: [],
				// 购物车列表处于折叠隐藏状态
				listShow: false,
				fold: true
			};
		},
		computed: {
			// 订单总价
			totalPrice() {
				let total = 0;
				this.selectFoods.forEach((food) => {
					// 价格累加
					total += food.price * food.count;
				});
				return total;
			},
			// 商品件数
			totalCount() {
				let count = 0;
				this.selectFoods.forEach((food) => {
					count += food.count;
				});
				return count;
			},
			payDesc() {
				if (this.totalPrice === 0) {
					return `￥${this.minPrice}元起送`;
				} else if (this.totalPrice < this.minPrice) {
					let diff = this.minPrice - this.totalPrice;
					return `还差￥${diff}元起送`;
				} else {
					return '去结算';
				}
			},
			// 根据总金额切换样式
			payClass() {
				if (this.totalPrice < this.minPrice) {
					return 'not-enough';
				} else {
					return 'enough';
				}
			}
			// v-show='listShow' 控制订单列表显示隐藏，在listShow 计算属性里处理订单列表会出现bug：
			// 订单列表显示隐藏（头部会始终在外面，且动画效果有问题），列表里添加减少商品、滚动商品列表功能不可用，
			// 简化逻辑（不使用data的fold属性）并移到 methods的toggleList()方法里，功能皆可用
			// // 内部定义了set、get，所以 listShow 定义为一个对象而不是函数，listShow:{}，而不是 listShow(){}
			// ,listShow: {
			// 	get: function() {
			// 		return this.fold;
			// 	},
			// 	// computed默认只有getter，需要自定义 setter 来更改 fold，
			// 	set: function() {
			// 		if (!this.totalCount) {
			// 			// 未添加商品时，处于折叠状态，且show为false
			// 			this.fold = true;
			// 			return false;
			// 		} else {
			// 			this.fold = false;
			// 		}
			// 		let show = !this.fold;
			// 		// 启用购物车订单列表滚动功能
			// 		if (show) {
			// 			this.$nextTick(() => {
			// 				if (!this.scroll) {
			// 					this.scroll = new BScroll(this.$refs.listContent, {
			// 						click: true
			// 					});
			// 				} else {
			// 					this.scroll.refresh();
			// 				}
			// 			});
			// 		}
			// 		return show;
			// 	}
			// }
		},
		methods: {
			// el 参数由另一个子组件cartcontrol.vue传递给父组件再传递给当前子组件
			drop(el) {
				// console.log(el);
				for (let i = 0; i < this.balls.length; i++) {
					let ball = this.balls[i];
					if (!ball.show) {
						ball.show = true;
						// 为ball添加el属性来保存传入的参数el
						ball.el = el;
						// 添加到下落的小球里
						this.dropBalls.push(ball);
						return;
					}
				}
			},
			// cartcontrol.vue派生的add事件调用addFood()事件，
			// 用于实现订单列表里添加、删除商品功能
			addFood(target) {
				this.drop(target);
			},
			// 切换订单列表展示、收缩状态
			toggleList() {
				// 购物车没有商品时，点击动作会被阻止，不会显示订单列表
				if (!this.totalCount) {
					return;
				}
				// 购物车有商品时，切换 listShow 值
				this.listShow = !this.listShow;
				if (this.listShow) {
					this.$nextTick(() => {
					// 添加商品后，购物车订单列表里滚动条需要根据最新商品列表更新高度
					// 不存在滚动条实例对象时实例化一个，存在实例化对象则执行刷新
						if (!this.scroll) {
							this.scroll = new BScroll(this.$refs.listContent, {
								click: true
							});
						} else {
							this.scroll.refresh();
						}
					});
				}
			},
			// 清空订单列表
			// 待优化：订单列表里删除掉所有商品时，订单列表应该自动隐藏
			empty() {
				this.selectFoods.forEach((food) => {
					food.count = 0;
				});
				this.listShow = false;
			},
			// 点击订单列表上面的灰色背景，订单列表收起
			hideList() {
				this.listShow = false;
			},
			pay() {
				if (this.totalPrice < this.minPrice) {
					return;
				}
				window.alert(`支付${this.totalPrice}元`);
			},
			// JS钩子函数，传入获取自父组件的el，即执行动画的DOM元素
			beforeDrop(el) {
				let count = this.balls.length;
				while (count--) {
					let ball = this.balls[count];
					if (ball.show) {
						// 获取点击位置相对购物车的位置偏移
						let rect = ball.el.getBoundingClientRect();
						let x = rect.left - 32;
						let y = -(window.innerHeight - rect.top - 22);
						el.style.display = '';
						el.style.webkitTransform = `translate3d(0, ${y}px, 0)`;
						el.style.transform = `translate3d(0, ${y}px, 0)`;
						let inner = el.getElementsByClassName('inner-hook')[0];
						inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`;
						inner.style.transform = `translate3d(${x}px, 0, 0)`;
					}
				}
			},
			dropping(el, done) {
				// 以下注释用于避免eslint报错
				/* eslint-disable no-unused-vars */
				let rf = el.offsetHeight;
				this.$nextTick(() => {
					el.style.webkitTransform = 'translate3d(0, 0, 0)';
					el.style.transform = 'translate3d(0, 0, 0)';
					let inner = el.getElementsByClassName('inner-hook')[0];
					inner.style.webkitTransform = 'translate3d(0, 0, 0)';
					inner.style.transform = 'translate3d(0, 0, 0)';
					el.addEventListener('transitionend', done);
				});
			},
			afterDrop(el) {
				// 状态重置，重复使用ball
				let ball = this.dropBalls.shift();
				if (ball) {
					ball.show = false;
					el.style.display = 'none';
				}
			}
		},
		components: {
			cartcontrol
		}
	};
</script>
<style lang='stylus' rel='stylesheet/stylus'>
@import '../../common/stylus/mixin.styl'

.shopcart
	position:fixed
	left:0
	right:0
	bottom:0
	z-index:50
	width:100%
	height:48px
	font-size:0
	.content
		display:flex
		background:#141d27
		font-size:0
		color:rgba(255,255,255,0.4)
		.content-left
			flex:1
			.logo-wrapper
				display:inline-block
				vertical-align:top
				position:relative
				top:-10px
				margin:0 12px
				padding:6px
				width:56px
				height:56px
				box-sizing:border-box
				border-radius:50%
				background:#141d27
				.logo
					width:100%
					height:100%
					border-radius:50%
					text-align:center
					background:#2b343c
					// 购物车高亮时的样式
					&.highlight
						background:rgb(0,160,220)
					.icon-shopping_cart
						line-height:44px
						font-size:24px
						color:#80858a
						&.highlight
							color:#fff
				.num
					position:absolute
					top:0
					right:0
					width:24px
					height:16px
					line-height:16px
					text-align:center
					border-radius:16px
					font-size:16px
					font-weight:700
					color:#fff
					background:rgb(240,20,20)
					box-shadow:0 4px 8px 0 rgba(0,0,0,0.4)
			.price
				display:inline-block
				vertical-align:top
				margin-top:12px
				line-height:24px
				padding-right:12px
				box-sizing:border-box
				border-right:1px solid rgba(255,255,255,0.1)
				font-size:16px
				font-weight:700
				&.highlight
					color:#fff
			.desc
				display:inline-block
				vertical-align:top
				margin:12px 0 0 12px
				line-height:24px
				font-size:10px
		.content-right
			flex:0 0 105px
			width:105px
			.pay
				height:48px
				line-height:48px
				text-align:center
				font-size:12px
				font-weight:700
				&.not-enough
					background:#2b333b
				&.enough
					background:#00b43c
					color:#fff
	.ball-container
		.ball
			position:fixed
			left:32px
			bottom:22px
			z-index:200
			transition:all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
			.inner
				width:16px
				height:16px
				border-radius:50%
				background:rgb(0,160,220)
				transition:all 0.4s linear
	.shopcart-list
		position:absolute
		left:0
		top:0
		z-index:-1
		width:100%
		transform:translate3d(0, -100%, 0)
		&.fold-enter-active, &.fold-leave-active
			transition:all 0.5s
		&.fold-enter, &.fold-leave-active
			transform:translate3d(0, 0, 0)
		.list-header
			height: 40px
			line-height:40px
			padding:0 18px
			background:#f3f5f7
			border-bottom:1px solid rgba(7,17,27,0.1)
			.title
				float:left
				font-size:14px
				color:rgb(7,17,27)
			.empty
				float:right
				font-size:12px
				color:rgb(0,160,220)
		.list-content
			padding:0 18px
			max-height: 217px
			overflow:hidden
			background:#fff
			.food
				position:relative
				padding:12px 0
				box-sizing:border-box
				border-1px(rgba(7,17,27,0.1))
				.name
					line-height:24px
					font-size:14px
					color:rgb(7,17,27)
				.price
					position:absolute
					right:90px
					bottom:12px
					line-height:24px
					font-size:14px
					font-weight:700
					color:rgb(240,20,20)
				.cartcontrol-wrapper
					position:absolute
					right:0
					bottom:6px
.list-mask
	position:fixed
	top:0
	left:0
	width:100%
	height:100%
	z-index:40
	// backdrop-filter:blur(10px)
	opacity:1
	background:rgba(7,17,27,0.6)
	&.fade-enter-active,&.fade-leave-active
		transition:all 0.5s
	&.fade-enter, &.fade-leave-active
		opacity:0
		background:rgba(7,17,27,0)

</style>
