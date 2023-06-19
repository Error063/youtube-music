const prompt = require("custom-electron-prompt");

const { setMenuOptions } = require("../../config/plugins");
const promptOptions = require("../../providers/prompt-options");
const { clear, connect, registerRefresh, isConnected } = require("./back");

const { singleton } = require("../../providers/decorators")

const registerRefreshOnce = singleton((refreshMenu) => {
	registerRefresh(refreshMenu);
});

module.exports = (win, options, refreshMenu) => {
	registerRefreshOnce(refreshMenu);

	return [
		{
			label: isConnected() ? "已连接" : "重新连接",
			enabled: !isConnected(),
			click: connect,
		},
		{
			label: "自动重连",
			type: "checkbox",
			checked: options.autoReconnect,
			click: (item) => {
				options.autoReconnect = item.checked;
				setMenuOptions('discord', options);
			},
		},
		{
			label: "清除活动",
			click: clear,
		},
		{
			label: "超时后清除活动",
			type: "checkbox",
			checked: options.activityTimoutEnabled,
			click: (item) => {
				options.activityTimoutEnabled = item.checked;
				setMenuOptions('discord', options);
			},
		},
		{
			label: "一起听",
			type: "checkbox",
			checked: options.listenAlong,
			click: (item) => {
				options.listenAlong = item.checked;
				setMenuOptions('discord', options);
			},
		},
		{
			label: "隐藏剩余时长",
			type: "checkbox",
			checked: options.hideDurationLeft,
			click: (item) => {
				options.hideDurationLeft = item.checked;
				setMenuOptions('discord', options);
			}
		},
		{
			label: "设置不活动超时",
			click: () => setInactivityTimeout(win, options),
		},
	];
};

async function setInactivityTimeout(win, options) {
	let output = await prompt({
		title: '设置不活动超时',
		label: '输入不活动超时（以秒为单位）：',
		value: Math.round((options.activityTimoutTime ?? 0) / 1e3),
		type: "counter",
		counterOptions: { minimum: 0, multiFire: true },
		width: 450,
		...promptOptions()
	}, win)

	if (output) {
		options.activityTimoutTime = Math.round(output * 1e3);
		setMenuOptions("Discord", options);
	}
}
