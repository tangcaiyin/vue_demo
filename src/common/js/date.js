// JS模块化
export function formatDate(date, fmt) {
	// 处理年份
	// fmt 如果是 yyyy-MM-dd hh:mm
	// y+ 表示以一个或多个y开头的字符串，如 yyyy、yy，
	if (/(y+)/.test(fmt)) {
		// RegExp.$1 指的是 yyyy
		// date.getFullYear() 获取年份转为字符串再进行截取后四位或后两位，
		// yyyy则获取后四位（所有四位），如 2018
		// yy则获取后两位，如 17
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	// 处理月份
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds()
	};
	for (let k in o) {
		// 实例化正则对象，
		if (new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + '';
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
		}
	}
	return fmt;
};
// 截取从下标开始的指定数目的字符，
function padLeftZero(str) {
	return ('00' + str).substr(str.length);
}
