const config = require("./config");

module.exports = () => [
    {
        label: "自动选择上次使用的字幕",
        type: "checkbox",
        checked: config.get("autoload"),
        click: (item) => {
            config.set('autoload', item.checked);
        }
    },
    {
        label: "默认没有字幕",
        type: "checkbox",
        checked: config.get("disabledCaptions"),
        click: (item) => {
            config.set('disableCaptions', item.checked);
        },
    }
];
