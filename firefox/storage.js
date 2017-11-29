function getSavedWindows() {
  // local
  browser.storage.local.get("sswin").then(res => {
    console.log(res, JSON.stringify(res.sswin));
    if (res['sswin'] != undefined) {
      vueApp.savedWindows = res['sswin'];
    } else {
      vueApp.savedWindows = [];
    }
  });
}

function saveWindowToStorage(win) {
  vueApp.savedWindows.push(win);
  // local
  saveToStorage(vueApp.savedWindows).then();
}

function removeWindowFromStorage(windowIndex, rootList) {
  rootList.splice(windowIndex, 1);
  // local
  saveToStorage(rootList).then();
}

function saveToStorage(toSave) {
  return browser.storage.local.set({
    "sswin": toSave
  });
}

function removeAllWindowsFromStorage() {
  browser.storage.local.remove("sswin").then();
  getSavedWindows();
}