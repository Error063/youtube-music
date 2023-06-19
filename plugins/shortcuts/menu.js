const { setMenuOptions } = require("../../config/plugins");
const prompt = require("custom-electron-prompt");
const promptOptions = require("../../providers/prompt-options");

module.exports = (win, options) => [
	{
		label: "设置全局歌曲控制",
		click: () => promptKeybind(options, win)
	},
	{
		label: "覆盖媒体键(?)",
		type: "checkbox",
		checked: options.overrideMediaKeys,
		click: item => setOption(options, "overrideMediaKeys", item.checked)
	}
];

function setOption(options, key = null, newValue = null) {
	if (key && newValue !== null) {
		options[key] = newValue;
	}

	setMenuOptions("shortcuts", options);
}

// Helper function for keybind prompt
const kb = (label_, value_, default_) => { return { value: value_, label: label_, default: default_ }; };

async function promptKeybind(options, win) {
	const output = await prompt({
		title: "全局键绑定",
		label: "为歌曲控制选择全局键绑定：",
		type: "keybind",
		keybindOptions: [ // If default=undefined then no default is used
			kb("上一首", "previous", options.global?.previous),
			kb("播放/暂停", "playPause", options.global?.playPause),
			kb("下一首", "next", options.global?.next)
		],
		height: 270,
		...promptOptions()
	}, win);

	if (output) {
		if (!options.global) {
			options.global = {};
		}
		for (const { value, accelerator } of output) {
			options.global[value] = accelerator;
		}
		setOption(options);
	}
	// else -> pressed cancel
}
