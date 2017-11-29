function getSavedWindows() {
  // local
  browser.storage.local.get("sswin").then(res => {
    if (res['sswin'] != undefined) {
      vueApp.savedWindows = res['sswin'];
    } else {
      vueApp.savedWindows = [];
    }
  });
}

function saveWindowToStorage(win) {
  // remove tabs of which the tabs.create cannot be used, i.e.
  // chrome: URLs -- javascript: URLs -- data: URLs -- file: URLs -- about: URLs
  let winToSave = {
    tabs: win.tabs.filter(tab => !tab.url.startsWith("chrome") 
      && !tab.url.startsWith("javascript")
      && !tab.url.startsWith("data")
      && !tab.url.startsWith("file")
      && !tab.url.startsWith("about")
    )
  };
  if (winToSave.tabs.length > 0) {
    vueApp.savedWindows.push(winToSave);
    // local
    saveToStorage(vueApp.savedWindows);
  }
}

function removeWindowFromStorage(windowIndex, rootList) {
  rootList.splice(windowIndex, 1);
  // local
  saveToStorage(rootList);
}

function saveToStorage(toSave) {
  browser.storage.local.set({
    "sswin": toSave
  });
}

function removeAllWindowsFromStorage() {
  browser.storage.local.remove("sswin").then();
  getSavedWindows();
}