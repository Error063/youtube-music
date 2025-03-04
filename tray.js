const path = require("path");

const { Menu, nativeImage, Tray } = require("electron");

const { restart } = require("./providers/app-controls");
const config = require("./config");
const getSongControls = require("./providers/song-controls");

// Prevent tray being garbage collected

/** @type {Electron.Tray} */
let tray;

module.exports.setTrayOnClick = (fn) => {
	if (!tray) return;
	tray.removeAllListeners('click');
	tray.on("click", fn);
};

// wont do anything on macos since its disabled
module.exports.setTrayOnDoubleClick = (fn) => {
	if (!tray) return;
	tray.removeAllListeners('double-click');
	tray.on("double-click", fn);
};

module.exports.setUpTray = (app, win) => {
	if (!config.get("options.tray")) {
		tray = undefined;
		return;
	}

	const { playPause, next, previous } = getSongControls(win);
	const iconPath = path.join(__dirname, "assets", "youtube-music-tray.png");

	let trayIcon = nativeImage.createFromPath(iconPath).resize({
		width: 16,
		height: 16,
	});

	tray = new Tray(trayIcon);

	tray.setToolTip("YouTube Music");

	// macOS only
	tray.setIgnoreDoubleClickEvents(true);

	tray.on("click", () => {
		if (config.get("options.trayClickPlayPause")) {
			playPause();
		} else {
			if (win.isVisible()) {
				win.hide();
				app.dock?.hide();
			} else {
				win.show();
				app.dock?.show();
			}
		}
	});

	let template = [
		{
			label: "播放/暂停",
			click: () => {
				playPause();
			},
		},
		{
			label: "下一首",
			click: () => {
				next();
			},
		},
		{
			label: "上一首",
			click: () => {
				previous();
			},
		},
		{
			label: "打开Youtube Music",
			click: () => {
				win.show();
				app.dock?.show();
			},
		},
		{
			label: "重启应用",
			click: restart
		},
		{ label: "退出Youtube Music", role: "quit" },
	];

	const trayMenu = Menu.buildFromTemplate(template);
	tray.setContextMenu(trayMenu);
};
