const { setMenuOptions } = require("../../config/plugins");

module.exports = (win, options) => [
    {
        label: "模式",
        submenu: [
            {
                label: "自定义",
                type: "radio",
                checked: options.mode === 'custom',
                click: () => {
                    options.mode = 'custom';
                    setMenuOptions("video-toggle", options);
                }
            },
            {
                label: "本地",
                type: "radio",
                checked: options.mode === 'native',
                click: () => {
                    options.mode = 'native';
                    setMenuOptions("video-toggle", options);
                }
            },
            {
                label: "禁用",
                type: "radio",
                checked: options.mode === 'disabled',
                click: () => {
                    options.mode = 'disabled';
                    setMenuOptions("video-toggle", options);
                }
            },
        ]
    },
    {
        label: "对齐",
        submenu: [
            {
                label: "靠左对齐",
                type: "radio",
                checked: options.align === 'left',
                click: () => {
                    options.align = 'left';
                    setMenuOptions("video-toggle", options);
                }
            },
            {
                label: "居中对齐",
                type: "radio",
                checked: options.align === 'middle',
                click: () => {
                    options.align = 'middle';
                    setMenuOptions("video-toggle", options);
                }
            },
            {
                label: "靠右对齐",
                type: "radio",
                checked: options.align === 'right',
                click: () => {
                    options.align = 'right';
                    setMenuOptions("video-toggle", options);
                }
            },
        ]
    },
    {
        label: "强制删除视频选项卡",
        type: "checkbox",
        checked: options.forceHide,
        click: item => {
            options.forceHide = item.checked;
            setMenuOptions("video-toggle", options);
        }
    }
];
