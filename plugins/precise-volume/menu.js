const { enabled } = require("./back");
const { setMenuOptions } = require("../../config/plugins");
const prompt = require("custom-electron-prompt");
const promptOptions = require("../../providers/prompt-options");

function changeOptions(changedOptions, options, win) {
	for (option in changedOptions) {
		options[option] = changedOptions[option];
	}
	// Dynamically change setting if plugin is enabled
	if (enabled()) {
		win.webContents.send("setOptions", changedOptions);
	} else { // Fallback to usual method if disabled
		setMenuOptions("precise-volume", options);
	}
}

module.exports = (win, options) => [
	{
		label: "本地箭头键控件",
		type: "checkbox",
		checked: !!options.arrowsShortcut,
		click: item => {
			changeOptions({ arrowsShortcut: item.checked }, options, win);
		}
	},
	{
		label: "全局热键",
		type: "checkbox",
		checked: !!options.globalShortcuts.volumeUp || !!options.globalShortcuts.volumeDown,
		click: item => promptGlobalShortcuts(win, options, item)
	},
	{
		label: "设置音量间隔",
		click: () => promptVolumeSteps(win, options)
	}
];

// Helper function for globalShortcuts prompt
const kb = (label_, value_, default_) => { return { value: value_, label: label_, default: default_ || undefined }; };

async function promptVolumeSteps(win, options) {
	const output = await prompt({
		title: "音量间隔",
		label: "设置音量增加/减少值",
		value: options.steps || 1,
		type: "counter",
		counterOptions: { minimum: 0, maximum: 100, multiFire: true },
		width: 380,
		...promptOptions()
	}, win)

	if (output || output === 0) { // 0 is somewhat valid
		changeOptions({ steps: output}, options, win);
	}
}

async function promptGlobalShortcuts(win, options, item) {
	const output = await prompt({
		title: "全局音量键绑定",
		label: "选择全局音量键绑定：",
		type: "keybind",
		keybindOptions: [
			kb("增大音量", "volumeUp", options.globalShortcuts?.volumeUp),
			kb("减少音量", "volumeDown", options.globalShortcuts?.volumeDown)
		],
		...promptOptions()
	}, win)

	if (output) {
		let newGlobalShortcuts = {};
		for (const { value, accelerator } of output) {
			newGlobalShortcuts[value] = accelerator;
		}
		changeOptions({ globalShortcuts: newGlobalShortcuts }, options, win);

		item.checked = !!options.globalShortcuts.volumeUp || !!options.globalShortcuts.volumeDown;
	} else {
		// Reset checkbox if prompt was canceled
		item.checked = !item.checked;
	}
}
