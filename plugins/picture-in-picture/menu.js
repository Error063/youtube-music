const prompt = require("custom-electron-prompt");

const promptOptions = require("../../providers/prompt-options");
const { setOptions } = require("./back.js");

module.exports = (win, options) => [
    {
        label: "总在最前面",
        type: "checkbox",
        checked: options.alwaysOnTop,
        click: (item) => {
            setOptions({ alwaysOnTop: item.checked });
            win.setAlwaysOnTop(item.checked);
        },
    },
    {
        label: "保留窗口位置",
        type: "checkbox",
        checked: options.savePosition,
        click: (item) => {
            setOptions({ savePosition: item.checked });
        },
    },
    {
        label: "保留窗口大小",
        type: "checkbox",
        checked: options.saveSize,
        click: (item) => {
            setOptions({ saveSize: item.checked });
        },
    },
    {
        label: "快捷键",
        type: "checkbox",
        checked: options.hotkey,
        click: async (item) => {
            const output = await prompt({
                title: "画中画快捷键",
                label: "选择用于切换画中画的快捷键",
                type: "keybind",
                keybindOptions: [{
                        value: "hotkey",
                        label: "Hotkey",
                        default: options.hotkey
                }],
                ...promptOptions()
            }, win)

            if (output) {
                const { value, accelerator } = output[0];
                setOptions({ [value]: accelerator });

                item.checked = !!accelerator;
            } else {
                // Reset checkbox if prompt was canceled
                item.checked = !item.checked;
            }
        },
    },
    {
        label: "使用原生画中画",
        type: "checkbox",
        checked: options.useNativePiP,
        click: (item) => {
            setOptions({ useNativePiP: item.checked });
        },
    }
];
