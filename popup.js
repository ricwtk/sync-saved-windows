// get windows save in `SyncSavedWindows`
// browser.storage.sync.remove("SyncSavedWindows");
var allsavedwindows;
let getting = browser.storage.sync.get("SyncSavedWindows");
getting.then(getSaved, null);

function getSaved(saved) {
  if (saved['SyncSavedWindows']) {
    // console.log(saved['SyncSavedWindows']);
    // console.log(saved['SyncSavedWindows'].length);
    if (saved['SyncSavedWindows'].length > 0) {
      allsavedwindows = saved['SyncSavedWindows'];
      var winarr = [];
      var i = 0;
      for (let w of allsavedwindows) {
        var singlewin = document.createElement("div");
        singlewin.setAttribute("class", "window");
        var tabswrapper = document.createElement("div");
        tabswrapper.setAttribute("class", "tabswrapper addsep");
        for (let t of w) {
          var singletab = document.createElement("img");
          singletab.setAttribute("src", t.favIconUrl);
          singletab.setAttribute("class", "favicon");
          singletab.setAttribute("title", t.title);
          tabswrapper.appendChild(singletab);
        }
        singlewin.appendChild(tabswrapper);
        var delwin = document.createElement("div");
        delwin.setAttribute("class", "delwinbtn addsep");
        delwin.appendChild(document.createTextNode("\u2A2F"));
        (function(i) {
          delwin.addEventListener("click", function() { deleteWinByArrIdx(i) });
        })(i);
        singlewin.appendChild(delwin);
        var openwin = document.createElement("div");
        openwin.setAttribute("class", "openwinbtn addsep");
        openwin.appendChild(document.createTextNode("\u21B3"));
        (function(i) { 
          openwin.addEventListener("click", function() { openWinByArrIdx(i) }); 
        })(i);
        singlewin.appendChild(openwin);
        winarr.push(singlewin);
        i += 1;
      }
      var lastrow = winarr[winarr.length-1];
      for (let cn of lastrow.childNodes) {
        cn.setAttribute("class", cn.getAttribute("class").replace("addsep", ""));
      }
      appendToSavedList(winarr);
    } else { showNoSaved(); }
  } else { showNoSaved(); }
}

function deleteWinByArrIdx(i) {
  allsavedwindows.splice(i, 1);
  var SyncSavedWindows = allsavedwindows;
  let setting = browser.storage.sync.set({SyncSavedWindows});
  setting.then(refreshpage);
}

function openWinByArrIdx(i) {
  var urlList = [];
  for (let t of allsavedwindows[i]) {
    urlList.push(t.url);
  }
  var creating = browser.windows.create({ url: urlList });
  creating.then();
}

function showNoSaved() {
  var nosaved = document.createElement("div");
  nosaved.setAttribute("class", "nosaveddiv");
  nosaved.appendChild(document.createTextNode("No saved windows"));
  appendToSavedList([nosaved]);
}

function appendToSavedList(el) {
  var swin = document.getElementById("savedwindows");
  while (swin.firstChild) swin.removeChild(swin.firstChild);
  for (let e of el) {
    swin.appendChild(e);
  }
}

// remove all saved windows
document.getElementById("removeallsaved").addEventListener("click", removeallsaved);
function removeallsaved() {
  let removing = browser.storage.sync.remove("SyncSavedWindows");
  removing.then(refreshpage);
}


// list current opened windows
var allwindows = [];
var allwinid = [];
var alltabs = browser.tabs.query({});
alltabs.then(listwindows);

function listwindows(tabs) {
  for (let tab of tabs) {
    if (allwinid.indexOf(tab.windowId) == -1) {
      allwinid.push(tab.windowId);
      allwindows.push([]);
    }
    var i = allwinid.indexOf(tab.windowId);
    allwindows[i].push(tab);
  }
  var winarr = [];
  for (let w of allwindows) {
    var singlewin = document.createElement("div");
    singlewin.setAttribute("class", "window");
    var tabswrapper = document.createElement("div");
    tabswrapper.setAttribute("class", "tabswrapper addsep");
    for (let t of w) {
      var singletab = document.createElement("img");
      singletab.setAttribute("src", t.favIconUrl);
      singletab.setAttribute("class", "favicon");
      singletab.setAttribute("title", t.title);
      singletab.addEventListener("click", function() {switchTo(t.windowId, t.id)});
      tabswrapper.appendChild(singletab);
    }
    singlewin.appendChild(tabswrapper);
    var savewin = document.createElement("div");
    savewin.setAttribute("class", "savewinbtn addsep");
    savewin.appendChild(document.createTextNode("\uD83D\uDFA1"));
    savewin.addEventListener("click", function() {saveWin(w[0].windowId)});
    singlewin.appendChild(savewin);
    winarr.push(singlewin);
  }
  var lastrow = winarr[winarr.length-1];
  for (let cn of lastrow.childNodes) {
    cn.setAttribute("class", cn.getAttribute("class").replace("addsep", ""));
  }
  var owin = document.getElementById("openedwindows");
  while (owin.firstChild) owin.removeChild(owin.firstChild);
  for (let wa of winarr) {
    owin.appendChild(wa);
  }
}

function switchTo(wId, tId) {
  var t = browser.tabs.update(tId, {active: true});
  var w = browser.windows.update(wId, {focused: true});
}

function saveWin(wId) {
  let getting = browser.storage.sync.get("SyncSavedWindows");
  getting.then(updateSaved);

  function updateSaved(saved) {
    if (saved['SyncSavedWindows']) {
      SyncSavedWindows = saved['SyncSavedWindows'];
    } else {
      SyncSavedWindows = []
    }
    SyncSavedWindows.push([]);
    for (let t of allwindows[allwinid.indexOf(wId)]) {
      if (t.url.includes('://') && (t.url.indexOf('file://') != 0)) 
        SyncSavedWindows[SyncSavedWindows.length-1].push(t);
    }
    let setting = browser.storage.sync.set({SyncSavedWindows});
    setting.then(refreshpage);
  }
}



function refreshpage(promise) {
  location.reload();
}