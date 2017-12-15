var dataPort;

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

// ------------------------ Vue components --------------------------------

Vue.component('single-window', {
  props: ['window', 'actions', 'notLast', 'windowIndex', 'group'],
  created: function () {
  },
  methods: {
    saveWindow: function () {
      dataPort.postMessage({
        "actions": ["save-window"],
        "save-window": this.window
      });
    },
    removeWindow: function () {
      dataPort.postMessage({
        "actions": ["remove-window"],
        "remove-window": this.windowIndex
      });
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
    remoteAccount: ""
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
    // get saved windows
    dataPort = browser.runtime.connect({name:"popup-background"});
    dataPort.onMessage.addListener(m => {
      console.log("Received from background.js", m);
      let mKeys = Object.keys(m);
      if (mKeys.includes("saved-windows")) this.savedWindows = m["saved-windows"];
      if (mKeys.includes("use-local")) this.useLocal = m["use-local"];
      if (mKeys.includes("signed-in")) this.signedIn = m["signed-in"];
      if (mKeys.includes("remote-account")) this.remoteAccount = m["remote-account"];
    });

    dataPort.postMessage({actions: ["refresh", "saved-windows", "use-local", "signed-in", "remote-account"]});

    // get opened windows
    refreshOpenedWindows();

    // add listener
    browser.tabs.onCreated.addListener(refreshOpenedWindows);
    browser.tabs.onRemoved.addListener(refreshOpenedWindows);
  },
  methods: {
    removeSaved: function () {
      dataPort.postMessage({actions: ["remove-all-windows"]});
    },
    signInOut: function () {
      dataPort.postMessage({ actions: ["sign-in-out"] });
    },
    openHelp: function () {
      window.open("doc/help.html");
    },
  }
});