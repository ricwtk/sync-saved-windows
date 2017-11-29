// get windows save in `SyncSavedWindows`
// browser.storage.sync.remove("SyncSavedWindows");
// var allsavedwindows;
// let getting = browser.storage.sync.get("SyncSavedWindows");
// getting.then(getSaved, null);

// function getSaved(saved) {
//   if (saved['SyncSavedWindows']) {
//     // console.log(saved['SyncSavedWindows']);
//     // console.log(saved['SyncSavedWindows'].length);
//     if (saved['SyncSavedWindows'].length > 0) {
//       allsavedwindows = saved['SyncSavedWindows'];
//       var winarr = [];
//       var i = 0;
//       for (let w of allsavedwindows) {
//         var singlewin = document.createElement("div");
//         singlewin.setAttribute("class", "window");
//         singlewin.setAttribute("title", "Click on an icon to open tab in this window");
//         var tabswrapper = document.createElement("div");
//         tabswrapper.setAttribute("class", "tabswrapper addsep");
//         for (let t of w) {
//           var singletab = document.createElement("img");
//           singletab.setAttribute("src", t.favIconUrl);
//           singletab.setAttribute("class", "favicon");
//           singletab.setAttribute("title", t.title);
//           singletab.addEventListener("click", function() {openInTab(t)});
//           tabswrapper.appendChild(singletab);
//         }
//         singlewin.appendChild(tabswrapper);
//         var delwin = document.createElement("div");
//         delwin.setAttribute("class", "delwinbtn addsep");
//         delwin.setAttribute("title", "Delete from saved list");
//         delwin.appendChild(document.createTextNode("\u2A2F"));
//         (function(i) {
//           delwin.addEventListener("click", function() { deleteWinByArrIdx(i) });
//         })(i);
//         singlewin.appendChild(delwin);
//         var openwin = document.createElement("div");
//         openwin.setAttribute("class", "openwinbtn addsep");
//         openwin.setAttribute("title", "Open in new window");
//         openwin.appendChild(document.createTextNode("\u21B3"));
//         (function(i) { 
//           openwin.addEventListener("click", function() { openWinByArrIdx(i) }); 
//         })(i);
//         singlewin.appendChild(openwin);
//         winarr.push(singlewin);
//         i += 1;
//       }
//       var lastrow = winarr[winarr.length-1];
//       for (let cn of lastrow.childNodes) {
//         cn.setAttribute("class", cn.getAttribute("class").replace("addsep", ""));
//       }
//       appendToSavedList(winarr);
//     } else { showNoSaved(); }
//   } else { showNoSaved(); }
// }

// function deleteWinByArrIdx(i) {
//   allsavedwindows.splice(i, 1);
//   var SyncSavedWindows = allsavedwindows;
//   let setting = browser.storage.sync.set({SyncSavedWindows: SyncSavedWindows});
//   setting.then(refreshpage);
// }

// function openWinByArrIdx(i) {
//   var urlList = [];
//   for (let t of allsavedwindows[i]) {
//     urlList.push(t.url);
//   }
//   var creating = browser.windows.create({ url: urlList });
//   creating.then();
// }

// function appendToSavedList(el) {
//   var swin = document.getElementById("savedwindows");
//   while (swin.firstChild) swin.removeChild(swin.firstChild);
//   for (let e of el) {
//     swin.appendChild(e);
//   }
// }

// function openInTab(t) {
//   browser.tabs.create({active: true, url: t.url});
// }

// // remove all saved windows
// document.getElementById("removeallsaved").addEventListener("click", removeallsaved);
// function removeallsaved() {
//   let removing = browser.storage.sync.remove("SyncSavedWindows");
//   removing.then(refreshpage);
// }


// // list current opened windows
// var allwindows = [];
// var allwinid = [];
// var alltabs = browser.tabs.query({});
// alltabs.then(listwindows);

// function listwindows(tabs) {
//   for (let tab of tabs) {
//     if (allwinid.indexOf(tab.windowId) == -1) {
//       allwinid.push(tab.windowId);
//       allwindows.push([]);
//     }
//     var i = allwinid.indexOf(tab.windowId);
//     allwindows[i].push(tab);
//   }
//   var winarr = [];
//   for (let w of allwindows) {
//     var singlewin = document.createElement("div");
//     singlewin.setAttribute("class", "window");
//     singlewin.setAttribute("title", "Click on an icon to switch to tab");
//     var tabswrapper = document.createElement("div");
//     tabswrapper.setAttribute("class", "tabswrapper addsep");
//     for (let t of w) {
//       var singletab = document.createElement("img");
//       singletab.setAttribute("src", t.favIconUrl);
//       singletab.setAttribute("class", "favicon");
//       singletab.setAttribute("title", t.title);
//       singletab.addEventListener("click", function() {switchTo(t.windowId, t.id)});
//       tabswrapper.appendChild(singletab);
//     }
//     singlewin.appendChild(tabswrapper);
//     var savewin = document.createElement("div");
//     savewin.setAttribute("class", "savewinbtn addsep");
//     savewin.setAttribute("title", "Save window")
//     savewin.appendChild(document.createTextNode("\uD83D\uDFA1"));
//     savewin.addEventListener("click", function() {saveWin(w[0].windowId)});
//     singlewin.appendChild(savewin);
//     winarr.push(singlewin);
//   }
//   var lastrow = winarr[winarr.length-1];
//   for (let cn of lastrow.childNodes) {
//     cn.setAttribute("class", cn.getAttribute("class").replace("addsep", ""));
//   }
//   var owin = document.getElementById("openedwindows");
//   while (owin.firstChild) owin.removeChild(owin.firstChild);
//   for (let wa of winarr) {
//     owin.appendChild(wa);
//   }
// }

// function switchTo(wId, tId) {
//   browser.tabs.update(tId, {active: true});
//   browser.windows.update(wId, {focused: true});
// }

// function saveWin(wId) {
//   let getting = browser.storage.sync.get("SyncSavedWindows");
//   getting.then(updateSaved);

//   function updateSaved(saved) {
//     if (saved['SyncSavedWindows']) {
//       SyncSavedWindows = saved['SyncSavedWindows'];
//     } else {
//       SyncSavedWindows = []
//     }
//     SyncSavedWindows.push([]);
//     for (let t of allwindows[allwinid.indexOf(wId)]) {
//       if (t.url.includes('://') && (t.url.indexOf('file://') != 0)) 
//         SyncSavedWindows[SyncSavedWindows.length-1].push(t);
//     }
//     let setting = browser.storage.sync.set({SyncSavedWindows: SyncSavedWindows});
//     setting.then(refreshpage);
//   }
// }



// function refreshpage(promise) {
//   location.reload();
// }


// // get storage preference
// var storename = ["local", "gdrive", "odrive", "dbox"];
// var storeoptions = ["storelocal", "storegdrive", "storeodrive", "storedbox"];
// var dispoptions = ["displocal", "dispgdrive", "dispodrive", "dispdbox"];

// getStorage();

// function getStorage() {
//   var getStoragePref = browser.storage.sync.get("storage");
//   getStoragePref.then(onGetStorage, null);
// }

// function createDefaultPref() {
//   saveStorage(storename[0]);
//   getStorage();
// }

// function onGetStorage(result) {
//   if (Object.keys(result).length == 0) createDefaultPref();
//   else {
//     console.log(result);
//     if (storename.indexOf(result['storage']) > -1) selectStorage(storeoptions[storename.indexOf(result['storage'])]);
//     else createDefaultPref();
//   }
// }

// function saveStorage(sname) {
//   if (storename.indexOf(sname) > -1) {
//     browser.storage.sync.set({
//       storage: sname
//     });
//   }
// }

// // ui function
// let closemenubutton = document.getElementById("closemenu");
// closemenubutton.addEventListener("click", togglemenu);
// let openmenubutton = document.getElementById("preference");
// openmenubutton.addEventListener("click", togglemenu);

// function togglemenu() {
//   let menu = document.getElementById("menu");
//   menu.classList.toggle("hide");
// }

// // select storage function
// storeoptions.forEach(function(val) {
//   let el = document.getElementById(val);
//   el.addEventListener("click", function() { selectStorage(val); });
// });

// function selectStorage(storeid) {
//   storeoptions.forEach(function(val) {
//     let el = document.getElementById(val);
//     el.classList.remove("storeselected");
//   });
//   let el = document.getElementById(storeid);
//   el.classList.add("storeselected");
//   setDisplay(dispoptions[storeoptions.indexOf(storeid)]);
//   saveStorage(storename[storeoptions.indexOf(storeid)]);
//   accessStorage(storename[storeoptions.indexOf(storeid)]);
// }

// function setDisplay(dispid) {
//   dispoptions.forEach(function(val, idx, arr) {
//     let el = document.getElementById(val);
//     el.classList.remove("showdisplay");
//   });
//   let el = document.getElementById(dispid);
//   el.classList.add("showdisplay");
// }

// function updateSigninInfo(htmlelement) {
//   let el = document.getElementById("signinbutton");
//   while (el.firstChild) el.removeChild(el.firstChild);
//   el.appendChild(htmlelement);
// }

Vue.component('single-window', {
  props: ['window', 'actions', 'notLast', 'rootList', 'windowIndex'],
  created: function () {
  },
  methods: {
    saveWindow: function () {
      saveWindowToStorage(this.window);
    },
    removeWindow: function () {
      console.log(this.windowIndex, this.rootList);
      removeWindowFromStorage(this.windowIndex, this.rootList);
    }
  },
  template: `
    <div :class="{ window: true, addsep: notLast }" title="Click on an icon to switch to tab">
      <div class="tabswrapper">
        <single-tab v-for="tab in window.tabs" :tab="tab"></single-tab>
      </div>
      <div v-if="actions.includes('s')" class="savewinbtn fa fa-plus" title="Save window" @click="saveWindow"></div>
      <div v-if="actions.includes('d')" class="delwinbtn fa fa-times" title="Delete window" @click="removeWindow"></div>
      <div v-if="actions.includes('r')" class="openwinbtn fa fa-window-restore" title="Restore window"></div>
    </div>
  `
});

Vue.component('single-tab', {
  props: ['tab'],
  methods: {
    onClick: function () {
      browser.tabs.update(this.tab.id, {active: true});
      browser.windows.update(this.tab.windowId, {focused: true});
    }
  },
  template: `
    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" :title="tab.title" @click="onClick">
    <i v-else class="fa fa-question-circle favicon" :title="tab.title" @click="onClick"></i>
  `
});

var vueApp = new Vue({
  el: "#main",
  data: {
    openedWindows: [],
    savedWindows: []
  },
  created: function () {
    // get opened windows
    browser.tabs.query({}).then((tabs) => {
      for (let tab of tabs) {
        let win = this.openedWindows.find(w => w.windowId == tab.windowId);
        if (win !== undefined) {
          win.tabs.push(tab);
        } else {
          this.openedWindows.push({
            windowId: tab.windowId,
            tabs: [tab]
          });
        }
      }
      // sort tabs
      for (let win of this.openedWindows) {
        win.tabs.sort((t1,t2) => t1.index - t2.index);
      }
      // sort windows
      this.openedWindows.sort((w1,w2) => w1.index - w2.index);
    });

    // get saved windows
    getSavedWindows();
  },
  methods: {
    removeSaved: function () {
      removeAllWindowsFromStorage();
    }
  }
})