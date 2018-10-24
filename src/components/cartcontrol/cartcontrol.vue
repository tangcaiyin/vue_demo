<template>
	<div class="cartcontrol">
		<transition name='move'>
		<!-- 按钮滚动动画，分两层进行操作，inner层控制按钮图标滚动 -->
		<!-- @click.stop.prevent 用于阻止冒泡，不阻止会导致商品列表里添加删除商品时，当前商品详情页面会被打开 -->
			<div class="cart-decrease" v-show='food.count>0' @click.stop.prevent='decreaseCart($event)'>
				<span class="inner icon-remove_circle_outline"></span>
			</div>
		</transition>
		<div class="cart-count" v-show='food.count>0'>{{food.count}}</div>
		<div class="cart-add icon-add_circle" @click.stop.prevent='addCart($event)'></div>
	</div>
</template>

<script type='text/ecmascript-6'>
	import Vue from 'vue';

	export default {
		props: {
			food: {
				type: Object
			}
		},
		methods: {
			addCart(event) {
				// event._constructed 表示由自己派发事件，网页环境下，非派发事件，return
				if (!event._constructed) {
					return;
				}
				if (!this.food.count) {
					// food 没有 count 属性，无法直接使用 this.food.count=1 给该属性赋值，通过Vue.set()增加该属性
					Vue.set(this.food, 'count', 1);
				} else {
					this.food.count++;
				}
				// 添加商品时，向父组件goods.vue派发事件，用于传递当前点击的dom元素（event.target，即添加按钮）实现抛物线小球动画，
				// $dispatch 在 vue2 里废弃，改用$emit
				this.$emit('add', event.target);
			},
			decreaseCart(event) {
				if (!event._constructed) {
					return;
				}
				if (this.food.count) {
					this.food.count--;
				}
			}
		}
	};
</script>

<style lang='stylus' rel='stylesheet/stylus'>
	.cartcontrol
		font-size:0
		.cart-decrease
			display: inline-block
			// 增加按钮可点击区域
			padding:6px
			opacity:1
			// 开启动画3D
			transform:translate3d(0,0,0)
			// 按钮图标滚动
			.inner
				display:inline-block
				line-height:24px
				font-size:24px
				color:rgb(0,160,220)
				transition:all 0.4s linear
				transform:rotate(0)
			&.move-enter-active, &.move-leave-active
				transition:all 0.4s linear
			&.move-enter, &.move-leave-active
				opacity:0
				transform:translate3d(24px, 0, 0)
				.inner
					transform:rotate(180deg)
		.cart-count
			display: inline-block
			vertical-align:top
			width:12px
			padding-top:6px
			line-height:24px
			text-align:center
			font-size:12px
			color:rgb(147,153,159)
		.cart-add
			display: inline-block
			// 增加按钮可点击区域
			padding:6px
			line-height:24px
			font-size:24px
			color:rgb(0,160,220)
</style>
