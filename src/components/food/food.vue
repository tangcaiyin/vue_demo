<template>
	<transition name='move'>
		<div class="food" v-show='showFlag' ref='food'>
			<div class="food-content">
				<div class="image-header">
					<img :src="food.image" alt="">
					<div class='back' @click='hide'>
						<i class="icon-arrow_lift"></i>
					</div>
				</div>
				<div class="content">
					<h1 class="title">{{food.name}}</h1>
					<div class="detail">
						<span class="sell-count">月售{{food.sellCount}}份</span>
						<span class="rating">好评率{{food.rating}}%</span>
					</div>
					<div class="price">
						<span class="now">￥{{food.price}}</span><span class="old" v-show='food.oldPrice'>￥{{food.oldPrice}}</span>
					</div>
					<div class="cartcontrol-wrapper">
						<cartcontrol @add='addFood' :food='food'></cartcontrol>
					</div>
					<!-- 添加动画效果，避免点击后该按钮立即隐藏，抛物线小球找不到出发点造成bug -->
					<transition name='fade'>
						<div class="buy" @click.stop.prevent='addFirst' v-show='!food.count || food.count===0'>加入购物车</div>
					</transition>
				</div>
				<!-- 某些food没有信息则不显示 -->
				<split v-show='food.info'></split>
				<div class="info" v-show='food.info'>
					<h1 class="title">商品信息</h1>
					<p class="text">{{food.info}}</p>
				</div>
				<split></split>
				<div class="rating">
					<h1 class="title">商品评价</h1>
					<ratingselect
						:ratings='food.ratings'
						:select-type='selectType'
						:only-content='onlyContent'
						:desc='desc'
						@select='selectRating'
						@toggle='toggleContent'>
					</ratingselect>
					<div class="rating-wrapper">
						<ul v-show='food.ratings && food.ratings.length'>
							<!-- v-show 绑定函数表达式 -->
							<li
							class='rating-item border-1px'
							v-show='needShow(rating.rateType, rating.text)'
							v-for='(rating, index) in food.ratings'
							:key='index'>
								<div class="user">
									<div class="name">{{rating.username}}</div>
									<img :src="rating.avatar" width='12' height='12' class="avatar">
								</div>
								<div class="time">{{rating.rateTime | formatDate}}</div>
								<p class="text">
									<!-- 根据评论类型切换显示赞成、反对图标 -->
									<span :class='{"icon-thumb_up":rating.rateType ===0, "icon-thumb_down":rating.rateType === 1,}' ></span>{{rating.text}}
								</p>
							</li>
						</ul>
						<div class="no-rating" v-show='!food.ratings || !food.ratings.length'></div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script type='text/ecmascript-6'>
	import Vue from 'vue';
	import BScroll from 'better-scroll';
	// 引入以'export function'定义的模块
	import {formatDate} from '../../common/js/date.js';
	// 引入以'export default'定义的模块
	import cartcontrol from '../cartcontrol/cartcontrol.vue';
	import ratingselect from '../ratingselect/ratingselect.vue';
	import split from '../split/split.vue';
	// 定义常量，表示正面评价、负面评价、所有评价
	const POSITIVE = 0;
	const NEGATIVE = 1;
	const ALL = 2;
	export default {
		props: {
			food: {
				type: Object
			}
		},
		data() {
			return {
				showFlag: false,
				selectType: ALL,
				onlyContent: false,
				desc: {
					all: '全部',
					positive: '推荐',
					negative: '吐槽'
				}
			};
		},
		methods: {
			// 定义组件私有方法时习惯命名 _func，外部可调用时定义为 func，
			show() {
				this.showFlag = true;
				this.selectType = ALL;
				this.onlyContent = false;
				this.$nextTick(() => {
					if (!this.scroll) {
						this.scroll = new BScroll(this.$refs.food, {
							click: true
						});
					} else {
						this.scroll.refresh();
					}
				});
			},
			hide() {
				this.showFlag = false;
			},
			addFirst(event) {
				if (!event._constructed) {
					return;
				}
				// 添加商品时，向父组件goods.vue派发事件，用于传递当前点击的dom元素（event.target，即添加按钮）实现抛物线小球动画，
				// $dispatch 在 vue2 里废弃，改用$emit
				this.$emit('add', event.target);
				// food 没有 count 属性，无法直接使用 this.food.count=1 给该属性赋值，通过Vue.set()增加该属性，记得import Vue，
				Vue.set(this.food, 'count', 1);
			},
			// 当前组件接收cartcontrol.vue子组件派发的add事件，调用addFood()事件，内部二次派发add()事件到goods.vue组件，
			// goods.vue组件里使用food组件时需要定义点击事件 @add='addFood' 来执行接收的派发事件，
			// 此后执行的操作与执行cartcontrol.vue组件派发的事件的操作相同
			// cartcontrol.vue组件及其派发事件被使用两次，一次直接被goods.vue组件使用，
			// 另一次被food.vue组件（充当中转站）使用且二次派发其派发事件到goods.vue组件。
			addFood(target) {
				this.$emit('add', target);
			},
			// 根据子组件ratingselect.vue发射的select事件传回的type值对selectType进行赋值，
			// selectType 表示评论类型：好评、差评
			selectRating(type) {
				this.selectType = type;
				this.$nextTick(() => {
					this.scroll.refresh();
				});
			},
			// 根据子组件ratingselect.vue发射的toggle事件传回的值，对onlyContent进行取反，
			// onlyContent 表示是否只显示评论内容
			toggleContent() {
				this.onlyContent = !this.onlyContent;
				this.$nextTick(() => {
					this.scroll.refresh();
				});
			},
			needShow(type, text) {
				// 只显示内容，但无内容
				if (this.onlyContent && !text) {
					return false;
				}
				if (this.selectType === ALL) {
					return true;
				} else {
					return type === this.selectType;
				}
			}
		},
		// 时间戳过滤器
		filters: {
			formatDate(time) {
				let date = new Date(time);
				return formatDate(date, 'yyyy-MM-dd hh:mm');
			}
		},
		components: {
			cartcontrol,
			split,
			ratingselect
		}
	};
</script>
<style lang='stylus' rel='stylesheet/stylus'>
	@import '../../common/stylus/mixin.styl'
	.food
		position: fixed
		left:0
		top:0
		bottom:48px
		z-index:30
		width:100%
		background:#fff
		transform:translate3d(0,0,0)
		&.move-enter-active, &.move-leave-active
			transition:all 0.2s linear
		&.move-enter, &.move-leave-active
			transform:translate3d(100%,0,0)
		.image-header
			position:relative
			width:100%
			height:0
			// 使得height等于width，实现正方形图片布局
			padding-top:100%
			img
				position:absolute
				top:0
				left:0
				width:100%
				height:100%
			.back
				position:absolute
				top:10px
				left:0
				.icon-arrow_lift
					display:block
					// 撑开图标占位区域，提高点击精准率
					padding:10px
					font-size:20px
					color:#fff
		.content
			position:relative
			padding:18px
			.title
				line-height:14px
				margin-bottom:8px
				font-size:14px
				font-weight:700
				color:rgb(7,17,27)
			.detail
				margin-bottom:18px
				line-height:10px
				height:10px
				font-size:0
				.sell-count, .rating
					font-size:10px
					color:rgb(147,153,159)
				.sell-count
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
				right:12px
				bottom:12px
			.buy
				position:absolute
				right:18px
				bottom:18px
				z-index:10
				height:24px
				line-height:24px
				padding:0 12px
				box-sizing:border-box
				border-radius:12px
				font-size:10px
				color:#fff
				background:rgb(0,160,220)
				opacity:1
				&.fade-enter-active
					transition:all 0.2s
				&.fade-enter, &.fade-leave-active
					opacity:0
					z-index:-1
		.info
			padding:18px
			.title
				line-height:14px
				margin-bottom:6px
				font-size:14px
				color:rgb(7,17,27)
			.text
				line-height:24px
				padding:0 8px
				font-size:12px
				color:rgb(77,85,93)
		.rating
			padding-top:18px
			.title
				line-height:14px
				margin-left:18px
				font-size:14px
				color:rgb(7,17,27)
			.rating-wrapper
				padding:0 18px
				.rating-item
					position:relative
					padding:16px 0
					border-1px(rgba(7,17,27,0.1))
					.user
						position:absolute
						right:0
						top:16px
						line-height:12px
						font-size:0
						.name
							display:inline-block
							margin-right:6px
							vertical-align:top
							font-size:10px
							color:rgb(147,153,159)
						.avator
							border-radius:50%
					.time
						margin-bottom:6px
						line-height:12px
						font-size:10px
						color:rgb(7,17,27)
					.text
						line-height:16px
						font-size:12px
						color:rgb(7,17,27)
						.icon-thumb_up,.icon-thumb_up
							margin-right:4px
							line-height:16px
							font-size:12px
						.icon-thumb_up
							color:rgb(0,160,220)
						.icon-thumb_down
							color:rgb(147,153,159)
				.no-rating
					padding:16px 0
					font-size:12px
					color:rgb(147,153,159)
</style>
