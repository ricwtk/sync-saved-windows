function getRequestHeader() {
  let reqHeader = new Headers();
  reqHeader.set('Authorization', 'Bearer ' + ACCESS_TOKEN);
  return reqHeader;
}

function setStorageLocation(local) {
  browser.storage.local.set({
    "sswin_location": local ? "local" : "remote"
  });
}

function getSavedWindows(vueInst) {
  if (vueInst.useLocal) {
    // local
    browser.storage.local.get("sswin").then(res => {
      if (res['sswin'] != undefined) {
        vueInst.savedWindows = res['sswin'];
      } else {
        vueInst.savedWindows = [];
      }
    });
  } else {
    if (vueInst.signedIn) {
      // google drive
      let x = new URL("https://www.googleapis.com/drive/v3/files");
      x.search = new URLSearchParams([
        ["q", "name=\"savedtabs.json\""],
        ["spaces", "appDataFolder"],
        ["fields", "files(id,name)"]
      ]);
      let req = new Request(x.href, {
        method: "GET",
        headers: getRequestHeader()
      });
      fetch(req).then(resp => {
        if (resp.status == 200) {
          return resp.json();
        } else {
          throw resp.status;
        }
      }).then(resp => {
        if (resp.files.length > 0) {
          console.log(resp.files[0]);
        } else {
          vueInst.savedWindows = [];
        }
      });
    }
  }
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
    saveToStorage(vueApp.savedWindows);
  }
}

function removeWindowFromStorage(windowIndex, rootList) {
  rootList.splice(windowIndex, 1);
  saveToStorage(rootList);
}

function saveToStorage(toSave) {
  if (vueApp.useLocal) {
    // local
    browser.storage.local.set({
      "sswin": toSave
    });
  }
}

function removeAllWindowsFromStorage() {
  if (vueApp.userLocal) {
    // local
    browser.storage.local.remove("sswin").then();
  }
  getSavedWindows(vueApp);
}

function gDriveGetFileContent() {

}