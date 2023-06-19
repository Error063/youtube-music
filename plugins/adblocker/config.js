const { PluginConfig } = require("../../config/dynamic");

const config = new PluginConfig("广告禁用", { enableFront: true });

const blockers = {
	WithBlocklists: "拦截名单",
	InPlayer: "播放器内",
};

const shouldUseBlocklists = async () =>
	(await config.get("blocker")) !== blockers.InPlayer;

module.exports = { shouldUseBlocklists, blockers, ...config };
