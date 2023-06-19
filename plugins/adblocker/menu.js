const config = require("./config");

module.exports = () => [
	{
		label: "拦截工作模式",
		submenu: Object.values(config.blockers).map((blocker) => ({
			label: blocker,
			type: "radio",
			checked: (config.get("blocker") || config.blockers.WithBlocklists) === blocker,
			click: () => {
				config.set("blocker", blocker);
			},
		})),
	},
];
