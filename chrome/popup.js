var ACCESS_TOKEN = "";

function extractAccessToken(str) {
  let x = new URL(str);
  let y = new URLSearchParams(x.hash.substring(1));
  return y.get("access_token");
}

function refreshOpenedWindows() {
  chrome.tabs.query({}, tabs => {
    vueApp.openedWindows = [];
    for (let tab of tabs) {
      let win = vueApp.openedWindows.find(w => w.windowId == tab.windowId);
      if (win !== undefined) {
        win.tabs.push(tab);
      } else {
        vueApp.openedWindows.push({
          windowId: tab.windowId,
          tabs: [tab]
        });
      }
    }
    // sort tabs
    for (let win of vueApp.openedWindows) {
      win.tabs.sort((t1,t2) => t1.index - t2.index);
    }
    // sort windows
    vueApp.openedWindows.sort((w1,w2) => w1.index - w2.index);
  });
}

function afterGoogleLogin(authResult) {
  setStorageLocation(false);
  // ACCESS_TOKEN = extractAccessToken(authResult);
  ACCESS_TOKEN = authResult;
  if (!ACCESS_TOKEN) {
    throw "Authorization failure";
  } else {
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
        return r.json();
      } else {
        throw r.status;
      }
    }).then(profile => {
      vueApp.remoteAccount = profile.email;
    });
  }
}






// ------------------------ Vue components --------------------------------

Vue.component('single-window', {
  props: ['window', 'actions', 'notLast', 'rootList', 'windowIndex', 'group'],
  created: function () {
  },
  methods: {
    saveWindow: function () {
      saveWindowToStorage(this.window);
    },
    removeWindow: function () {
      removeWindowFromStorage(this.windowIndex, this.rootList);
    },
    restoreWindow: function () {
      chrome.windows.create({
        url: this.window.tabs.map((t) => t.url)
      });
    }
  },
  template: `
    <div :class="{ window: true, addsep: notLast }" title="Click on an icon to switch to tab">
      <div class="tabswrapper">
        <single-tab v-for="tab in window.tabs" :tab="tab" :group="group"></single-tab>
      </div>
      <div v-if="actions.includes('s')" class="savewinbtn fa fa-plus" title="Save window" @click="saveWindow"></div>
      <div v-if="actions.includes('d')" class="delwinbtn fa fa-times" title="Delete window" @click="removeWindow"></div>
      <div v-if="actions.includes('r')" class="openwinbtn fa fa-window-restore" title="Restore window" @click="restoreWindow"></div>
    </div>
  `
});

Vue.component('single-tab', {
  props: ['tab', 'group'],
  methods: {
    onClick: function () {
      if (this.group == "opened") {
        chrome.tabs.update(this.tab.id, {active: true});
        chrome.windows.update(this.tab.windowId, {focused: true});
      } else if (this.group == "saved") {
        chrome.tabs.create({
          url: this.tab.url
        });
      }
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
    savedWindows: [],
    signedIn: false,
    useLocal: true,
    remoteAccount: "",
    notiMsg: "",
    showNotify: false
  },
  computed: {
    logInStatus: function () {
      if (!this.useLocal && this.signedIn) {
        return "Signed in as " + this.remoteAccount;
      } else {
        return "Data saved locally";
      }
    }
  },
  created: function () {
    // load auth2
    // gapi.load('client:auth2', initClient);

    // check user preference if saving to local
    chrome.storage.local.get("sswin_location", res => {
      if (res['sswin_location'] == undefined || res['sswin_location'] == 'local') {
        this.useLocal = true;
      } else {
        this.useLocal = false;
        // check if logged in 
        chrome.identity.getAuthToken({
          interactive: false
        }, token => {
          if (token == undefined) {
            this.signedIn = false;
            console.log("not signed in to Google");
          } else {
            this.signedIn = true;
            console.log("signed in to Google");
            afterGoogleLogin(token);
          }
        });
      }
    });

    // get opened windows
    refreshOpenedWindows();   

    // get saved windows
    getSavedWindows(this);

    // add listener
    chrome.tabs.onCreated.addListener(refreshOpenedWindows);
    chrome.tabs.onRemoved.addListener(refreshOpenedWindows);
  },
  watch: {
    signedIn: function () {
      getSavedWindows(this);
    },
    useLocal: function () {
      getSavedWindows(this);
    }
  },
  methods: {
    removeSaved: function () {
      removeAllWindowsFromStorage();
    },
    signInOut: function () {
      // console.log(gapi.auth2);
      if (!this.signedIn) {
        chrome.identity.getAuthToken({
          interactive: true
        }, token => {
          if (token == undefined) {
            console.log("Not logged in to Google");
            this.signedIn = false;
            this.useLocal = true;
          } else {
            console.log("Logged in to Google");
            afterGoogleLogin(token);
            this.useLocal = false;
            this.signedIn = true;
          }
        });
      } else {
        this.signedIn = false;
        this.useLocal = true;
        setStorageLocation(true);
      }
    },
    openHelp: function () {
      window.open("doc/help.html");
    },
    setNotification: function (msg) {
      this.notiMsg = msg;
      this.showNotify = true;
      setTimeout(() => {
        this.notiMsg = "";
        this.showNotify = false;
      }, 1000);
    }
  }
})