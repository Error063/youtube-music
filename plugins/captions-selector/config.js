const { PluginConfig } = require("../../config/dynamic");
const config = new PluginConfig("字幕选择器", { enableFront: true });
module.exports = { ...config };
