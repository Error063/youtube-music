const config = require("./config");
const defaultOptions = require("../../config/defaults").plugins.crossfade;

const prompt = require("custom-electron-prompt");
const promptOptions = require("../../providers/prompt-options");

module.exports = (win) => [
	{
		label: "高级",
		click: async () => {
			const newOptions = await promptCrossfadeValues(win, config.getAll());
			if (newOptions) config.setAll(newOptions);
		},
	},
];

async function promptCrossfadeValues(win, options) {
	const res = await prompt(
		{
			title: "设置",
			type: "multiInput",
			multiInputOptions: [
				{
					label: "淡入淡出持续时间（毫秒）",
					value: options.fadeInDuration || defaultOptions.fadeInDuration,
					inputAttrs: {
						type: "number",
						required: true,
						min: 0,
						step: 100,
					},
				},
				{
					label: "淡出持续时间（毫秒）",
					value: options.fadeOutDuration || defaultOptions.fadeOutDuration,
					inputAttrs: {
						type: "number",
						required: true,
						min: 0,
						step: 100,
					},
				},
				{
					label: "结束前交叉淡入淡出 x 秒",
					value:
						options.secondsBeforeEnd || defaultOptions.secondsBeforeEnd,
					inputAttrs: {
						type: "number",
						required: true,
						min: 0,
					},
				},
				{
					label: "淡化缩放",
					selectOptions: { linear: "Linear", logarithmic: "Logarithmic" },
					value: options.fadeScaling || defaultOptions.fadeScaling,
				},
			],
			resizable: true,
			height: 360,
			...promptOptions(),
		},
		win,
	).catch(console.error);
	if (!res) return undefined;
	return {
		fadeInDuration: Number(res[0]),
		fadeOutDuration: Number(res[1]),
		secondsBeforeEnd: Number(res[2]),
		fadeScaling: res[3],
	};
}
