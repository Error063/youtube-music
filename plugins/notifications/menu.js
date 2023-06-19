const { urgencyLevels, ToastStyles, snakeToCamel } = require("./utils");
const is = require("electron-is");
const config = require("./config");

module.exports = (_win, options) => [
	...(is.linux()
		? [
			{
				label: "通知优先值",
				submenu: urgencyLevels.map((level) => ({
					label: level.name,
					type: "radio",
					checked: options.urgency === level.value,
					click: () => config.set("urgency", level.value),
				})),
			},
		]
		: []),
	...(is.windows()
		? [
			{
				label: "交互通知",
				type: "checkbox",
				checked: options.interactive,
				// doesn't update until restart
				click: (item) => config.setAndMaybeRestart("interactive", item.checked),
			},
			{
				// submenu with settings for interactive notifications (name shouldn't be too long)
				label: "交互设置",
				submenu: [
					{
						label: "单击托盘打开/关闭",
						type: "checkbox",
						checked: options.trayControls,
						click: (item) => config.set("trayControls", item.checked),
					},
					{
						label: "隐藏按钮文本",
						type: "checkbox",
						checked: options.hideButtonText,
						click: (item) => config.set("hideButtonText", item.checked),
					},
					{
						label: "播放/暂停时刷新",
						type: "checkbox",
						checked: options.refreshOnPlayPause,
						click: (item) => config.set("refreshOnPlayPause", item.checked),
					}
				]
			},
			{
				label: "主题",
				submenu: getToastStyleMenuItems(options)
			},
		]
		: []),
	{
		label: "在取消暂停时显示通知",
		type: "checkbox",
		checked: options.unpauseNotification,
		click: (item) => config.set("unpauseNotification", item.checked),
	},
];

function getToastStyleMenuItems(options) {
	const arr = new Array(Object.keys(ToastStyles).length);

	// ToastStyles index starts from 1
	for (const [name, index] of Object.entries(ToastStyles)) {
		arr[index - 1] = {
			label: snakeToCamel(name),
			type: "radio",
			checked: options.toastStyle === index,
			click: () => config.set("toastStyle", index),
		};
	}

	return arr;
}
