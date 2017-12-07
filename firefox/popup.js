const REDIRECT_URL = browser.identity.getRedirectURL();
const API_KEY = "AIzaSyA_31R6_xIgqi2fTs-48Z_UQ0L1d9X1JlA";
const CLIENT_ID = "155155797881-435186je4g6s5f4j8f28oj1ihdmkv33g.apps.googleusercontent.com";
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = ['https://www.googleapis.com/auth/drive.appfolder', 'email'];
const AUTH_URL =
`https://accounts.google.com/o/oauth2/auth
?client_id=${CLIENT_ID}
&response_type=token
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}
&scope=${encodeURIComponent(SCOPES.join(' '))}`;
var ACCESS_TOKEN = "";

function extractAccessToken(str) {
  let x = new URL(str);
  let y = new URLSearchParams(x.hash.substring(1));
  return y.get("access_token");
}

function refreshOpenedWindows() {
  browser.tabs.query({}).then((tabs) => {
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
  ACCESS_TOKEN = extractAccessToken(authResult);
  if (!ACCESS_TOKEN) {
    throw "Authorization failure";
  } else {
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
                return r.json();
              } else {
                throw r.status;
              }
            }).then(profile => {
              vueApp.remoteAccount = profile.email;
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
      browser.windows.create({
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
        browser.tabs.update(this.tab.id, {active: true});
        browser.windows.update(this.tab.windowId, {focused: true});
      } else if (this.group == "saved") {
        browser.tabs.create({
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
    browser.storage.local.get("sswin_location").then(res => {
      if (res['sswin_location'] == undefined || res['sswin_location'] == 'local') {
        this.useLocal = true;
      } else {
        this.useLocal = false;
        // check if logged in 
        browser.identity.launchWebAuthFlow({
          interactive: false,
          url: AUTH_URL
        }).then(res => {
          this.signedIn = true;
          console.log("signed in to Google", res);
          afterGoogleLogin(res);
        }, res => {
          this.signedIn = false;
          console.log("not signed in to Google", res);
        });
      }
    });

    // get opened windows
    refreshOpenedWindows();   

    // get saved windows
    getSavedWindows(this);

    // add listener
    browser.tabs.onCreated.addListener(refreshOpenedWindows);
    browser.tabs.onRemoved.addListener(refreshOpenedWindows);
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
        browser.identity.launchWebAuthFlow({
          interactive: true,
          url: AUTH_URL
        }).then((res) => {
          console.log("Logged in to Google");
          afterGoogleLogin(res);
          this.useLocal = false;
          this.signedIn = true;
        }, (res) => {
          console.log("Not logged in to Google");
          this.signedIn = false;
          this.useLocal = true;
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