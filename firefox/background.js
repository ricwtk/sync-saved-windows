// ---------------------------- Constants ----------------------------
const REDIRECT_URL = browser.identity.getRedirectURL();
const API_KEY = "AIzaSyA_31R6_xIgqi2fTs-48Z_UQ0L1d9X1JlA";
const CLIENT_ID = "155155797881-435186je4g6s5f4j8f28oj1ihdmkv33g.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = ['https://www.googleapis.com/auth/drive.appfolder', 'email'];
const AUTH_URL =
`https://accounts.google.com/o/oauth2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(' '))}`;
var ACCESS_TOKEN = "";

// ------------------ Variables ---------------------------
var remoteAccount = "";
var savedWindows = [];
var useLocal = true;
var signedIn = false;

// ------------------ General functions -----------------------
function setStorageLocation(local) {
  browser.storage.local.set({
    "sswin_location": local ? "local" : "remote"
  });
}
function signInOut() {
  if (!signedIn) {
    browser.identity.launchWebAuthFlow({
      interactive: true,
      url: AUTH_URL
    }).then((res) => {
      console.log("Logged in to Google");
      afterGoogleLogin(res).then(getSavedWindows);
    }, (res) => {
      console.log("Not logged in to Google");
      signedIn = false;
      useLocal = true;
      remoteAccount = "";
    });
  } else {
    signedIn = false;
    useLocal = true;
    remoteAccount = "";
    setStorageLocation(true);
    getSavedWindows();
  }
}
function getSavedWindows () {
  if (useLocal) {
    browser.storage.local.get("sswin").then(res => {
      if (res['sswin'] != undefined) {
        savedWindows = res['sswin'];
      } else {
        savedWindows = [];
      }
      console.log("saved windows", savedWindows);
      if (dataPort) dataPort.postMessage({
        "signed-in": signedIn,
        "use-local": useLocal,
        "remote-account": remoteAccount,
        "saved-windows": savedWindows
      });
    });
  } else {
    // gdrive
    if (signedIn) {
      gDriveGetFileId()
        .then(gDriveGetContent)
        .then(resp => {
          savedWindows = resp;
          console.log("saved windows", savedWindows);
          if (dataPort) dataPort.postMessage({
            "signed-in": signedIn,
            "use-local": useLocal,
            "remote-account": remoteAccount,
            "saved-windows": savedWindows
          });
          return resp;
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
    savedWindows.push(winToSave);
    saveToStorage();
  }
}
function removeWindowFromStorage(windowIndex) {
  savedWindows.splice(windowIndex, 1);
  saveToStorage();
}
function saveToStorage() {
  if (dataPort) dataPort.postMessage({"saved-windows": savedWindows});
  if (useLocal) { // local
    browser.storage.local.set({
      "sswin": savedWindows
    });
  } else { // gdrive
    if (signedIn)
      gDriveGetFileId()
        .then(file => gDriveSetContent(file, savedWindows))
  }
}
function removeAllWindowsFromStorage() {
  savedWindows = [];
  if (dataPort) dataPort.postMessage({"saved-windows": savedWindows})
  if (useLocal) { // local
    browser.storage.local.remove("sswin");
  } else { // gdrive
    if (signedIn)
      gDriveGetFileId()
        .then(file => gDriveSetContent(file, []))
  }
}

// ------------------------ Google Drive --------------------------
function extractAccessToken(str) {
  let x = new URL(str);
  let y = new URLSearchParams(x.hash.substring(1));
  return y.get("access_token");
}
function getRequestHeader() {
  let reqHeader = new Headers();
  reqHeader.set('Authorization', 'Bearer ' + ACCESS_TOKEN);
  return reqHeader;
}
function gDriveGetFileId() {
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
      return resp.json().then(resp => {
        if (resp.files.length > 0) {
          return resp.files[0];
        } else {
          return gDriveCreateFile();
        }
      });
    } else {
      throw resp.status;
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
  return fetch(req).then(resp => {
    if (resp.status == 200) {
      return resp.json();
    } else {
      throw resp.status;
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
  return fetch(req).then(resp => {
    if (resp.status == 200) {
      return resp.text().then(res => {
        try {
          return JSON.parse(res);
        } catch (e) {
          return [];
        }
      });
    } else {
      throw resp.status;
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
function afterGoogleLogin(authResult) {
  setStorageLocation(false);
  ACCESS_TOKEN = extractAccessToken(authResult);
  if (!ACCESS_TOKEN) {
    throw "Authorization failure";
  } else {
    useLocal = false;
    signedIn = true;
    let valURL = new URL("https://www.googleapis.com/oauth2/v3/tokeninfo");
    valURL.search = new URLSearchParams([
      ["access_token", ACCESS_TOKEN]
    ]);
    let validationRequest = new Request(valURL.href, {
      method: "GET"
    });
    return fetch(validationRequest).then(resp => {
      if (resp.status == 200) {
        resp.json().then(json => {
          if (json.aud && (json.aud === CLIENT_ID)) {
            let x = new URL("https://www.googleapis.com/oauth2/v1/userinfo");
            x.search = new URLSearchParams([
              ["alt", "json"]
            ]);
            let req = new Request(x.href, {
              method: "GET",
              headers: getRequestHeader()
            });
            return fetch(req).then(r => {
              if (r.status == 200) {
                return r.json().then(profile => {
                  remoteAccount = profile.email
                });
              } else {
                throw r.status;
              }
            });
          } else {
            throw resp.status;
          }
        });
      } else {
        throw resp.status;
      }
    });
  }
}

// --------------------- Refresh -----------------------------
function refresh() {
  if (!useLocal && signedIn) {
    browser.identity.launchWebAuthFlow({
      interactive: false,
      url: AUTH_URL
    }).then(res => {
      getSavedWindows();
    }, res => {
      useLocal = true;
      setStorageLocation(true);
      signedIn = false;
      getSavedWindows();
    });
  } else {
    getSavedWindows();
  }
}

// --------------------- Initialisation -----------------------
browser.storage.local.get("sswin_location").then(res => {
  if (res['sswin_location'] == undefined || res['sswin_location'] == 'local') {
    useLocal = true;
    getSavedWindows();
  } else {
    // check if logged in
    browser.identity.launchWebAuthFlow({
      interactive: false,
      url: AUTH_URL
    }).then(res => {
      useLocal = false;
      signedIn = true;
      console.log("signed in to Google");
      afterGoogleLogin(res).then(getSavedWindows);
    }, res => {
      useLocal = true;
      setStorageLocation(true);
      signedIn = false;
      console.log("not signed in to Google");
      getSavedWindows();
    });
  }
  console.log("use local storage", useLocal);
});

// ----------------------- Message Exchange ------------------------
var dataPort;

function connected(p) {
  dataPort = p;
  dataPort.onMessage.addListener(function(m) {
    console.log("Received from popup.js", m)
    let retM = {};
    if (m.actions.includes("saved-windows")) retM["saved-windows"] = savedWindows;
    if (m.actions.includes("use-local")) retM["use-local"] = useLocal;
    if (m.actions.includes("signed-in")) retM["signed-in"] = signedIn;
    if (m.actions.includes("remote-account")) retM["remote-account"] = remoteAccount;
    if (m.actions.includes("sign-in-out")) signInOut();
    if (m.actions.includes("save-window")) saveWindowToStorage(m["save-window"]);
    if (m.actions.includes("remove-window")) removeWindowFromStorage(m["remove-window"]);
    if (m.actions.includes("remove-all-windows")) removeAllWindowsFromStorage();
    if (m.actions.includes("refresh")) refresh();
    dataPort.postMessage(retM);
  });
}

browser.runtime.onConnect.addListener(connected);
