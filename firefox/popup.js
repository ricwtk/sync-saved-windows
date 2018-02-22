// ---------- refresh opened windows list ----------
function refreshOpenedWindows() {
  browser.tabs.query({}).then((tabs) => {
    openedWindows = [];
    for (let tab of tabs) {
      let win = openedWindows.find(w => w.windowId == tab.windowId);
      if (win !== undefined) {
        win.tabs.push(tab);
      } else {
        openedWindows.push({
          windowId: tab.windowId,
          tabs: [tab]
        });
      }
    }
    // sort tabs
    for (let win of openedWindows) {
      win.tabs.sort((t1,t2) => t1.index - t2.index);
    }
    // sort windows
    openedWindows.sort((w1,w2) => w1.index - w2.index);
  }).then(updateOpenedWindows);
}

// ---------- create simple div ----------

function createSimple(param) {
  var el = document.createElement("div");
  if (param.title) el.title = param.title;
  if (param.class) el.classList.add(...param.class);
  if (param.click) el.addEventListener("click", param.click);
  return el;
}

// ---------- create single window ----------

function createSingleWindow(param) {
  // param.{notLast window group actions windowIndex}
  var base = document.createElement("div");
  base.title="Click on an icon to switch to tab";
  base.classList.add("window");
  if (param.notLast) {
    base.classList.add("addsep");
  }
  var tabswrapper = document.createElement("div");
  tabswrapper.classList.add("tabswrapper");
  for (let i=0; i < param.window.tabs.length; i++) {
    tabswrapper.appendChild(createSingleTab({tab: param.window.tabs[i], group: param.group}));
  }
  base.appendChild(tabswrapper);
  if (param.actions.includes('s')) {
    base.appendChild(createSimple({
      class: ["savewinbtn", "fa", "fa-plus"],
      title: "Save window",
      click: function () {
        dataPort.postMessage({
          "actions": ["save-window"],
          "save-window": param.window
        });
      }
    }));
  }
  if (param.actions.includes('d')) {
    base.appendChild(createSimple({
      class: ["delwinbtn", "fa", "fa-times"],
      title: "Delete window",
      click: function () {
        dataPort.postMessage({
          "actions": ["remove-window"],
          "remove-window": param.windowIndex
        });
      }
    }));
  }
  if (param.actions.includes('r')) {
    base.appendChild(createSimple({
      class: ["openwinbtn", "fa", "fa-window-restore"],
      title: "Restore window",
      click: function () {
        browser.windows.create({
          url: param.window.tabs.map((t) => t.url)
        });
      }
    }));
  }
  return base;
}

// ---------- create single tab ----------

function createSingleTab(param) {
  // param.{tab group}
  var base;
  if (param.tab.favIconUrl) {
    base = document.createElement("img");
    base.src = param.tab.favIconUrl;
  } else {
    base = document.createElement("i");
    base.classList.add("fa", "fa-question-circle");
  }
  base.title = param.tab.title;
  base.classList.add("favicon");
  base.addEventListener("click", function () {
    if (param.group == "opened") {
      browser.tabs.update(param.tab.id, {active: true});
      browser.windows.update(param.tab.windowId, {focused: true});
    } else if (param.group == "saved") {
      browser.tabs.create({
        url: param.tab.url
      });
    }
  });
  return base;
}

// ---------- update log in status ----------
function updateLogInStatus () {
  var el = document.getElementById("status");
  if (!useLocal && signedIn) {
    el.innerText = "Signed in as " + remoteAccount;
  } else {
    el.innerText = "Data saved locally";
  }
}

// ---------- update log in button ----------
function updateLogInButton () {
  var el = document.getElementById("sign-in-out");
  if (signedIn) {
    el.classList.add("fa-sign-out");
    el.classList.remove("fa-google");
    el.title = "Click to sign out";
  } else {
    el.classList.remove("fa-sign-out");
    el.classList.add("fa-google");
    el.title = "Click to log in to Google";
  }
}

// ---------- update opened windows ----------
function updateOpenedWindows() {
  var base = document.getElementById("opened-windows");
  while (base.lastChild) base.removeChild(base.lastChild);
  for (let i = 0; i < openedWindows.length; i++) {
    base.appendChild(createSingleWindow({
      windowIndex: i,
      window: openedWindows[i],
      actions: "s",
      notLast: i != (openedWindows.length-1),
      group: "opened"
    }));
  }
}

// ---------- update saved windows ----------
function updateSavedWindows() {
  var base = document.getElementById("saved-windows");
  while (base.lastChild) base.removeChild(base.lastChild);
  if (savedWindows.length == 0) {
    let w = document.createElement("div");
    w.classList.add("window");
    let t = document.createElement("div");
    t.classList.add("tabswrapper");
    t.innerText = "Saved windows will be displayed here";
    w.appendChild(t);
    base.appendChild(w);
  } else {
    for (let i = 0; i < savedWindows.length; i++) {
      base.appendChild(createSingleWindow({
        windowIndex: i,
        window: savedWindows[i],
        actions: "dr",
        notLast: i != (savedWindows.length-1),
        group: "saved"
      }));
    }
    let x = document.createElement("div");
    x.id = "remove-all-saved";
    x.innerText = "Remove all saved windows";
    x.addEventListener("click", () => dataPort.postMessage({actions: ["remove-all-windows"]}));
    base.appendChild(x);
  }
}

// ---------- initialisation ----------
var openedWindows = [];
var savedWindows = [];
var signedIn = false;
var useLocal = true;
var remoteAccount = "";
var dataPort;
dataPort = browser.runtime.connect({name:"popup-background"});
dataPort.onMessage.addListener(m => {
  console.log("Received from background.js", m);
  let mKeys = Object.keys(m);
  if (mKeys.includes("saved-windows")) {
    savedWindows = m["saved-windows"];
    updateSavedWindows();
  }
  if (mKeys.includes("use-local")) {
    useLocal = m["use-local"];
    updateLogInStatus();
  }
  if (mKeys.includes("signed-in")) {
    signedIn = m["signed-in"];
    updateLogInStatus();
    updateLogInButton();
  }
  if (mKeys.includes("remote-account")) {
    remoteAccount = m["remote-account"];
    updateLogInStatus();
  }
});

dataPort.postMessage({actions: ["refresh", "saved-windows", "use-local", "signed-in", "remote-account"]});

// get opened windows
refreshOpenedWindows();
updateSavedWindows();
updateLogInStatus();
updateLogInButton();

// add listener
browser.tabs.onCreated.addListener(refreshOpenedWindows);
browser.tabs.onRemoved.addListener(refreshOpenedWindows);

// add click listener
document.getElementById("help").addEventListener("click", () => window.open("doc/help.html"));
document.getElementById("sign-in-out").addEventListener("click", () => dataPort.postMessage({ actions: ["sign-in-out"] }));
