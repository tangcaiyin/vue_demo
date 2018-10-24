<template>
	<div class="ratingselect">
		<div class="rating-type border-1px">
			<span class='block positive'
			@click='select(2,$event)'
			:class='{"active":selectType===2}'
			>{{desc.all}}<span class='count'>{{ratings.length}}</span></span>
			<span class='block positive'
			@click='select(0,$event)'
			:class='{"active":selectType===0}'
			>{{desc.positive}}<span class='count'>{{positives.length}}</span></span>
			<span class='block negative'
			@click='select(1,$event)'
			:class='{"active":selectType===1}'
			>{{desc.negative}}<span class='count'>{{negatives.length}}</span></span>
		</div>
		<div class="switch" :class='{"on":onlyContent}' @click='toggleContent'>
			<span class="icon-check_circle"></span>
			<span class="text">只看有内容的评价</span>
		</div>
	</div>
</template>
<script type='text/ecmascript-6'>
	// 定义常量，表示正面评价、负面评价、所有评价
	const POSITIVE = 0;
	const NEGATIVE = 1;
	const ALL = 2;
	export default {
		// 接收父组件food.vue传值
		props: {
			ratings: {
				type: Array,
				default() {
					return [];
				}
			},
			// 评价类型（正面、负面、所有）
			selectType: {
				type: Number,
				default: ALL
			},
			// 只看有内容的评价
			onlyContent: {
				type: Boolean,
				default: false
			},
			// 按钮的文本内容
			desc: {
				type: Object,
				default() {
					return {
						all: '全部',
						positive: '满意',
						negative: '不满意'
					};
				}
			}
		},
		computed: {
			// 根据评价数组里的每条评论的rateType参数对评价进行过滤，
			// 返回好评、差评数组
			positives() {
				return this.ratings.filter((rating) => {
					return rating.rateType === POSITIVE;
				});
			},
			negatives() {
				return this.ratings.filter((rating) => {
					return rating.rateType === NEGATIVE;
				});
			}
		},
		methods: {
			select(type, event) {
				if (!event._constructed) {
					return;
				}
				this.selectType = type;
				// 派发事件且传值（评价类型），food.vue父组件根据接收到的值改变selectType值
				this.$emit('select', type);
			},
			toggleContent(event) {
				if (!event._constructed) {
					return;
				}
				// 布尔值取反，且向父组件发射事件、传值，
				// 布尔值可以不传，父组件执行派发事件，对布尔值取反即可，
				this.onlyContent = !this.onlyContent;
				this.$emit('toggle');
			}
		}
	};
</script>
<style lang='stylus' rel='stylesheet/stylus'>
@import '../../common/stylus/mixin.styl';
	.ratingselect
		.rating-type
			padding:18px 0
			margin:0 18px
			border-1px(rgba(7, 17, 27, 0.1))
			font-size:0
			.block
				display:inline-block
				padding:8px 12px
				margin-right:8px
				line-height:16px
				border-radius:1px
				font-size:12px
				color:rgb(77,85,93)
				&.active
					color:#fff
				.count
					margin-left:2px
					font-size:8px
				&.positive
					background:rgba(0,160,220,0.2)
					&.active
						background:rgb(0,160,220)
				&.negative
					background:rgba(77,85,93,0.2)
					&.active
						background:rgb(77,85,93)
		.switch
			padding:12px 18px
			line-height:24px
			border-bottom:1px solid rgba(7,17,27,0.1)
			color:rgb(147,153,159)
			font-size:0
			// 绑定on类名时，图标切换样式
			&.on
				.icon-check_circle
					color:#00c850
			.icon-check_circle
				display:inline-block
				vertical-align:top
				margin-right:4px
				font-size:24px
			.text
				display:inline-block
				vertical-align:top
				font-size:12px
</style>
