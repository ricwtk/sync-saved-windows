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
    // gdrive
    if (vueInst.signedIn) {
      gDriveGetFileId().then(gDriveGetContent).then(resp => {
        vueInst.savedWindows = resp;
        return resp;
      }).then(console.log);
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
  } else {
    // gdrive
    if (vueApp.signedIn) 
      gDriveGetFileId().then(file => gDriveSetContent(file, toSave)).then(console.log);
  }
}

function removeAllWindowsFromStorage() {
  if (vueApp.userLocal) {
    // local
    browser.storage.local.remove("sswin").then();
  } else {
    // gdrive
    if (vueApp.signedIn) 
      gDriveGetFileId().then(file => gDriveSetContent(file, [])).then(console.log);
  }
  getSavedWindows(vueApp);
}

function gDriveGetFileId() {
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

  return fetch(req).then(resp => {
    if (resp.status == 200) {
      return resp.json();
    } else {
      throw resp.status;
    }
  }).then(resp => {
    if (resp.files.length > 0) {
      return resp.files[0];
    } else {
      return gDriveCreateFile();
    }
  });
}

function gDriveCreateFile() {
  let reqHeader = getRequestHeader();
  reqHeader.append("Content-Type", "application/json");
  let reqBody = {
    name: 'savedtabs.json',
    parents: ['appDataFolder']
  };
  let x = new URL("https://www.googleapis.com/drive/v3/files");
  x.search = new URLSearchParams([
    ["alt", "json"],
    ["fields", "id,name"]
  ]);
  let req = new Request(x.href, {
    method: "POST",
    headers: reqHeader,
    body: JSON.stringify(reqBody),
  });
  return fetch(req).then((response) => {
    if (response.status == 200) {
      return response.json();
    } else {
      throw response.status;
    }
  });
}

function gDriveGetContent(file) {
  let x = new URL("https://www.googleapis.com/drive/v3/files/" + file.id);
  x.search = new URLSearchParams([
    ["alt", "media"]
  ]);
  let req = new Request(x.href, {
    method: "GET",
    headers: getRequestHeader()
  });
  return fetch(req).then((response) => {
    if (response.status == 200) {
      return response.text().then(res => {
        try {
          return JSON.parse(res);
        } catch (e) {
          return [];
        }
      });
    } else {
      throw response.status;
    }
  });
}

function gDriveSetContent(file, content) {
  let x = new URL("https://www.googleapis.com/upload/drive/v3/files/" + file.id);
  x.search = new URLSearchParams([
    ["uploadType", "media"]
  ]);
  let req = new Request(x.href, {
    method: "PATCH",
    headers: getRequestHeader(),
    body: JSON.stringify(content)
  });
  return fetch(req).then((resp) => {
    if (resp.status == 200) {
      return resp.json();
    } else {
      throw resp.status;
    }
  })
} 