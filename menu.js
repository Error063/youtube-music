const { existsSync } = require("fs");
const path = require("path");

const { app, clipboard, Menu, dialog } = require("electron");
const is = require("electron-is");
const { restart } = require("./providers/app-controls");

const { getAllPlugins } = require("./plugins/utils");
const config = require("./config");
const { startingPages } = require("./providers/extracted-data");

const prompt = require("custom-electron-prompt");
const promptOptions = require("./providers/prompt-options");

// true only if in-app-menu was loaded on launch
const inAppMenuActive = config.plugins.isEnabled("in-app-menu");

const pluginEnabledMenu = (plugin, label = "", hasSubmenu = false, refreshMenu = undefined) => ({
	label: label || plugin,
	type: "checkbox",
	checked: config.plugins.isEnabled(plugin),
	click: (item) => {
		if (item.checked) {
			config.plugins.enable(plugin);
		} else {
			config.plugins.disable(plugin);
		}
		if (hasSubmenu) {
			refreshMenu();
		}
	},
});

const mainMenuTemplate = (win) => {
	const refreshMenu = () => {
		this.setApplicationMenu(win);
		if (inAppMenuActive) {
			win.webContents.send("refreshMenu");
		}
	}
	return [
		{
			label: "选项",
			submenu: [
				{
					label: "自动更新（原版）",
					type: "checkbox",
					checked: config.get("options.autoUpdates"),
					click: (item) => {
						config.setMenuOption("options.autoUpdates", item.checked);
					},
				},
				{
					label: "当应用启动时继续上次播放进度",
					type: "checkbox",
					checked: config.get("options.resumeOnStart"),
					click: (item) => {
						config.setMenuOption("options.resumeOnStart", item.checked);
					},
				},
				{
					label: '开启应用时展示的页面',
					submenu: Object.keys(startingPages).map((name) => ({
						label: name,
						type: 'radio',
						checked: config.get('options.startingPage') === name,
						click: () => {
							config.set('options.startingPage', name);
						},
					}))
				},
				{
					label: "页面优化",
					submenu: [
						{
							label: "移除升级按钮",
							type: "checkbox",
							checked: config.get("options.removeUpgradeButton"),
							click: (item) => {
								config.setMenuOption("options.removeUpgradeButton", item.checked);
							},
						},
						{
							label: "点赞按钮",
							submenu: [
								{
									label: "默认",
									type: "radio",
									checked: !config.get("options.likeButtons"),
									click: () => {
										config.set("options.likeButtons", '');
									},
								},
								{
									label: "强制",
									type: "radio",
									checked: config.get("options.likeButtons") === 'force',
									click: () => {
										config.set("options.likeButtons", 'force');
									}
								},
								{
									label: "隐藏",
									type: "radio",
									checked: config.get("options.likeButtons") === 'hide',
									click: () => {
										config.set("options.likeButtons", 'hide');
									}
								},
							],
						},
						{
							label: "主题",
							submenu: [
								{
									label: "无",
									type: "radio",
									checked: !config.get("options.themes"), // todo rename "themes"
									click: () => {
										config.set("options.themes", []);
									},
								},
								{ type: "separator" },
								{
									label: "导入外部CSS文件",
									type: "radio",
									checked: false,
									click: async () => {
										const { filePaths } = await dialog.showOpenDialog({
											filters: [{ name: "CSS Files", extensions: ["css"] }],
											properties: ["openFile", "multiSelections"],
										});
										if (filePaths) {
											config.set("options.themes", filePaths);
										}
									},
								},
							],
						},
					],
				},
				{
					label: "单进程模式",
					type: "checkbox",
					checked: true,
					click: (item) => {
						if (!item.checked && app.hasSingleInstanceLock())
							app.releaseSingleInstanceLock();
						else if (item.checked && !app.hasSingleInstanceLock())
							app.requestSingleInstanceLock();
					},
				},
				{
					label: "始终显示在上方",
					type: "checkbox",
					checked: config.get("options.alwaysOnTop"),
					click: (item) => {
						config.setMenuOption("options.alwaysOnTop", item.checked);
						win.setAlwaysOnTop(item.checked);
					},
				},
				...(is.windows() || is.linux()
					? [
						{
							label: "隐藏菜单",
							type: "checkbox",
							checked: config.get("options.hideMenu"),
							click: (item) => {
								config.setMenuOption("options.hideMenu", item.checked);
								if (item.checked && !config.get("options.hideMenuWarned")) {
									dialog.showMessageBox(win, {
										type: 'info', title: '菜单已被隐藏',
										message: "菜单将在下次启动时隐藏，使用 [Alt] 显示它（如果使用应用内菜单，则使用反引号 [`]）"
									});
								}
							},
						},
					]
					: []),
				...(is.windows() || is.macOS()
					? // Only works on Win/Mac
					// https://www.electronjs.org/docs/api/app#appsetloginitemsettingssettings-macos-windows
					[
						{
							label: "登录时启动",
							type: "checkbox",
							checked: config.get("options.startAtLogin"),
							click: (item) => {
								config.setMenuOption("options.startAtLogin", item.checked);
							},
						},
					]
					: []),
				{
					label: "托盘",
					submenu: [
						{
							label: "禁用",
							type: "radio",
							checked: !config.get("options.tray"),
							click: () => {
								config.setMenuOption("options.tray", false);
								config.setMenuOption("options.appVisible", true);
							},
						},
						{
							label: "启用（显示应用）",
							type: "radio",
							checked:
								config.get("options.tray") && config.get("options.appVisible"),
							click: () => {
								config.setMenuOption("options.tray", true);
								config.setMenuOption("options.appVisible", true);
							},
						},
						{
							label: "启用（隐藏应用）",
							type: "radio",
							checked:
								config.get("options.tray") && !config.get("options.appVisible"),
							click: () => {
								config.setMenuOption("options.tray", true);
								config.setMenuOption("options.appVisible", false);
							},
						},
						{ type: "separator" },
						{
							label: "点击播放/暂停",
							type: "checkbox",
							checked: config.get("options.trayClickPlayPause"),
							click: (item) => {
								config.setMenuOption("options.trayClickPlayPause", item.checked);
							},
						},
					],
				},
				{ type: "separator" },
				{
					label: "高级设置",
					submenu: [
						{
							label: "代理",
							type: "checkbox",
							checked: !!config.get("options.proxy"),
							click: (item) => {
								setProxy(item, win);
							},
						},
						{
							label: "修改User Agent",
							type: "checkbox",
							checked: config.get("options.overrideUserAgent"),
							click: (item) => {
								config.setMenuOption("options.overrideUserAgent", item.checked);
							}
						},
						{
							label: "禁用硬件加速",
							type: "checkbox",
							checked: config.get("options.disableHardwareAcceleration"),
							click: (item) => {
								config.setMenuOption("options.disableHardwareAcceleration", item.checked);
							},
						},
						{
							label: "配置被修改时重新启动",
							type: "checkbox",
							checked: config.get("options.restartOnConfigChanges"),
							click: (item) => {
								config.setMenuOption("options.restartOnConfigChanges", item.checked);
							},
						},
						{
							label: "应用开启时清空缓存",
							type: "checkbox",
							checked: config.get("options.autoResetAppCache"),
							click: (item) => {
								config.setMenuOption("options.autoResetAppCache", item.checked);
							},
						},
						{ type: "separator" },
						is.macOS() ?
							{
								label: "开发人员工具",
								// Cannot use "toggleDevTools" role in MacOS
								click: () => {
									const { webContents } = win;
									if (webContents.isDevToolsOpened()) {
										webContents.closeDevTools();
									} else {
										const devToolsOptions = {};
										webContents.openDevTools(devToolsOptions);
									}
								},
							} :
							{ label: "开发人员工具", role: "toggleDevTools" },
						{
							label: "编辑 config.json",
							click: () => {
								config.edit();
							},
						},
					]
				},
				{
					label: "插件",
					submenu: [
						...getAllPlugins().map((plugin) => {
							const pluginPath = path.join(__dirname, "plugins", plugin, "menu.js")
							switch (plugin){
								case "adblocker":
									plugInName = "广告拦截器";
									break;
								case "audio-compressor":
									plugInName = "音频压缩";
									break;
								case "blur-nav-bar":
									plugInName = "导航栏模糊"
									break;
								case "bypass-age-restrictions":
									plugInName = "绕过年龄限制";
									break;
								case "captions-selector":
									plugInName = "字幕选择";
									break;
								case "crossfade":
									plugInName = "淡出淡入(实验性)";
									break;
								case "disable-autoplay":
									plugInName = "禁用自动播放";
									break;
								case "discord":
									plugInName = "Discord";
									break;
								case "downloader":
									plugInName = "下载器";
									break;
								case "exponential-volume":
									plugInName = "音量阶数";
									break;
								case "in-app-menu":
									plugInName = "应用内目录";
									break;
								case "last-fm":
									plugInName = "Last.fm";
									break;
								case "lyrics-genius":
									plugInName = "歌词查询";
									break;
								case "navigation":
									plugInName = "导航";
									break;
								case "no-google-login":
									plugInName = "移除Google登录";
									break;
								case "notifications":
									plugInName = "通知";
									break;
								case "picture-in-picture":
									plugInName = "画中画";
									break;
								case "playback-speed":
									plugInName = "播放速度";
									break;
								case "precise-volume":
									plugInName = "精确音量控制";
									break;
								case "quality-changer":
									plugInName = "更改视频质量";
									break;
								case "shortcuts":
									plugInName = "快捷键";
									break;
								case "skip-silences":
									plugInName = "跳过静音部分";
									break;
								case "sponsorblock":
									plugInName = "跳过非音乐部分";
									break;
								case "taskbar-mediacontrol":
									plugInName = "任务栏播放控制";
									break;
								case "tuna-obs":
									plugInName = "Tuna OBS";
									break;
								case "video-toggle":
									plugInName = "视频切换";
									break;
								case "visualizer":
									plugInName = "音乐可视化";
									break;
							}
							if (existsSync(pluginPath)) {
								let pluginLabel = plugInName;
								
								if (!config.plugins.isEnabled(plugin)) {
									return pluginEnabledMenu(plugin, pluginLabel, true, refreshMenu);
								}
								const getPluginMenu = require(pluginPath);
								return {
									label: pluginLabel,
									submenu: [
										pluginEnabledMenu(plugin, "启用", true, refreshMenu),
										{ type: "separator" },
										...getPluginMenu(win, config.plugins.getOptions(plugin), refreshMenu),
									],
								};
							}
							return pluginEnabledMenu(plugin, plugInName);
						}),
					],
				},
				{ type: "separator" },
				{
					label: "重启应用",
					click: restart
				},
				{	label: "退出应用",
				 	role: "quit" 
				},
			],
		},
		{
			label: "页面",
			submenu: [
				{
					label: "后退",
					click: () => {
						if (win.webContents.canGoBack()) {
							win.webContents.goBack();
						}
				},
				},
				{
					label: "前进",
					click: () => {
						if (win.webContents.canGoForward()) {
							win.webContents.goForward();
						}
				}
				},
				{ label: "刷新页面", role: "reload" },
				{ label: "强制刷新", role: "forceReload" },
				{ type: "separator" },
				{
					label: "复制当前URL链接",
					click: () => {
						const currentURL = win.webContents.getURL();
						clipboard.writeText(currentURL);
					},
				},
				{ type: "separator" },
				{ label: "放大", role: "zoomIn" },
				{ label: "缩小", role: "zoomOut" },
				{ label: "重置", role: "resetZoom" },
				{ type: "separator" },
				{ label: "全屏", role: "togglefullscreen" },
			],
		}
	];
}

module.exports.mainMenuTemplate = mainMenuTemplate;
module.exports.setApplicationMenu = (win) => {
	const menuTemplate = [...mainMenuTemplate(win)];
	if (process.platform === "darwin") {
		const name = app.name;
		menuTemplate.unshift({
			label: name,
			submenu: [
				{ label: "关于", role: "about" },
				{ type: "separator" },
				{ label: "隐藏", role: "hide" },
				{ label: "隐藏其他", role: "hideothers" },
				{ label: "取消隐藏", role: "unhide" },
				{ type: "separator" },
				{
					label: "全选",
					accelerator: "CmdOrCtrl+A",
					selector: "selectAll:",
				},
				{ label: "剪切", accelerator: "CmdOrCtrl+X", selector: "cut:" },
				{ label: "拷贝", accelerator: "CmdOrCtrl+C", selector: "copy:" },
				{ label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
				{ type: "separator" },
				{ label: "最小化", role: "minimize" },
				{ label: "关闭", role: "close" },
				{ label: "退出", role: "quit" },
			],
		});
	}

	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
};

async function setProxy(item, win) {
	const output = await prompt({
		title: '设置代理',
		label: '输入代理地址（留空为禁用）',
		value: config.get("options.proxy"),
		type: 'input',
		inputAttrs: {
			type: 'url',
			placeholder: "例如: 'socks5://127.0.0.1:9999"
		},
		width: 450,
		...promptOptions()
	}, win);

	if (typeof output === "string") {
		config.setMenuOption("options.proxy", output);
		item.checked = output !== "";
	} else { //user pressed cancel
		item.checked = !item.checked; //reset checkbox
	}
}
