const { PluginConfig } = require("../../config/dynamic");
const config = new PluginConfig("淡入淡出", { enableFront: true });
module.exports = { ...config };
