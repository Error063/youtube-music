const { ipcMain, dialog } = require("electron");

module.exports = () => {
	ipcMain.handle('qualityChanger', async (_, qualityLabels, currentIndex) => {
         return await dialog.showMessageBox({
            type: "question",
            buttons: qualityLabels,
            defaultId: currentIndex,
            title: "选择视频画质",
            message: "选择视频画质:",
            detail: `当前画质: ${qualityLabels[currentIndex]}`,
            cancelId: -1
        })
    })
};
