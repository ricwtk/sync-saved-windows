function checkSignInStatus() {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      clientId: "155155797881-435186je4g6s5f4j8f28oj1ihdmkv33g.apps.googleusercontent.com",
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: "https://www.googleapis.com/auth/drive.appfolder email"
    }).then(() => {
      accountStatusListener(gapi.auth2.getAuthInstance().isSignedIn.get());
      gapi.auth2.getAuthInstance().isSignedIn.listen(accountStatusListener);
    });
  });  
}
function accountStatusListener(signedIn) {
  if (signedIn) {
    v_app.signedIn = true;
    v_app.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
    getFileId().then(getFileContent).then(res => {
      v_app.savedWindows = res;
      // console.log(res);
    });
  } else {
    v_app.signedIn = false;
    v_app.savedWindows = [];
  }
}
function signInAccount() {
  gapi.auth2.getAuthInstance().signIn();
}
function signOutAccount() {
  gapi.auth2.getAuthInstance().signOut();
}

function getFileId() {
  return gapi.client.drive.files.list({
    q: "name=\"savedtabs.json\"",
    spaces: "appDataFolder",
    fields: "files(id)"
  }).then(resp => {
    let files = resp.result.files;
    // console.log(files.map(f => f.id));
    if (files.length < 1) {
      // create file
      return createFile().then(getFileId);
    } else {
      return files[0].id;
    }
  })
}
function createFile() {
  return gapi.client.drive.files.create({
    name: "savedtabs.json",
    parents: ["appDataFolder"],
    fields: "id, name"
  });
}
function getFileContent(fileId) {
  return gapi.client.drive.files.get({
    fileId: fileId,
    alt: "media"
  }).then(resp => {
    return resp.result;
  });
}
function updateFileContent(fileId) {
  return gapi.client.request({
    path: "/upload/drive/v3/files/" + fileId,
    method: "PATCH",
    params: {
      uploadType: "media"
    },
    body: JSON.stringify(v_app.savedWindows)
  });
}

Vue.component("single-window", {
  props: ["window"],
  data: function () {
    return {
      showTabList: false
    }
  },
  methods: {
    toggleTabList: function () {
      this.showTabList = !this.showTabList;
    },
    openAllTabs: function () {
      this.window.tabs.map(tab => {
        window.open(tab.url);
      });
    },
    removeWindow: function () {
      this.$emit("removewindow");
    },
    removeTab: function (tid) {
      this.$emit("removewindow", tid);
    }
  },
  template: `
    <div class="single-window">
      <div class="overview">
        <div class="tabs-wrapper" @click="toggleTabList">
          <single-tab v-for="tab in window.tabs" :tab="tab"></single-tab>
        </div>
        <div class="actions-group">
          <div class="action fa fa-times" @click="removeWindow"></div>
          <div class="action fa fa-window-restore" @click="openAllTabs"></div>
        </div>
      </div>
      <transition name="tab-display">
        <div class="tab-list" v-if="showTabList" ref="tabList">
          <single-tab-detail v-for="(tab, tid) in window.tabs" :tab="tab" @removetab="removeTab(tid)"></single-tab-detail>
        </div>
      </transition>
    </div>
  `
});

Vue.component("single-tab", {
  props: ["tab"],
  template: `
    <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" :title="tab.title">
    <i v-else class="fa fa-question-circle favicon"></i>
  `
});

Vue.component("single-tab-detail", {
  props: ["tab"],
  methods: {
    openTab: function () {
      window.open(this.tab.url);
    },
    removeTab: function () {
      this.$emit("removetab");
    }
  },
  template: `
    <div class="single-tab-detail">
      <div class="description">
        <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon">
        <i v-else class="fa fa-question-circle favicon"></i>
        <div class="detail">
          <div class="single-tab-title">{{ tab.title }}</div>
          <div class="single-tab-url">{{ tab.url }}</div>
        </div>
      </div>
      <div class="actions-group">
        <div class="action fa fa-minus" @click="removeTab"></div>
        <div class="action fa fa-external-link" @click="openTab"></div>  
      </div>
    </div>
  `
});

Vue.component("global-actions", {
  data: function () {
    return {
      showMenu: false
    };
  },
  methods: {
    openMenu: function () {
      this.showMenu = true;
      Vue.nextTick(() => {
        window.addEventListener("click", this.closeMenu);
      });
    },
    closeMenu: function () {
      this.showMenu = false;
      window.removeEventListener("click", this.closeMenu);
    },
    refresh: function () {
      this.$emit("refresh");
    },
    newWindow: function () {
      this.$emit("newwindow");
    },
    goHome: function () {
      window.open("../", "_blank");
    }
  },
  template: `
    <div id="global-actions">
      <template v-if="showMenu">
        <div class="g-action-button fa fa-times" @click="closeMenu"></div>
        <div class="g-action-button fa fa-refresh" @click="refresh"></div>
        <!--<div class="g-action-button fa fa-plus" @click="newWindow"></div>-->
        <div class="g-action-button fa fa-home" @click="goHome"></div>
      </template>
      <div v-else class="g-action-button fa fa-bars" @click="openMenu"></div>
    </div>
  `
})

v_app = new Vue({
  el: "#wrapper",
  data: {
    savedWindows: [],
    signedIn: false,
    email: ""
  },
  methods: {
    openSyncSavedWindowsHome: () => window.open("../", "_self"),
    clickOnAccount: function () {
      if (this.signedIn) signOutAccount();
      else signInAccount();
    },
    removeWindow: function (wid, tid) {
      console.log("removeWindow", wid, tid);
      if (tid == undefined) this.savedWindows.splice(wid, 1);
      else {
        this.savedWindows[wid].tabs.splice(tid, 1);
        if (this.savedWindows[wid].tabs.length == 0) this.savedWindows.splice(wid, 1);
      }
      // save to database
      getFileId().then(updateFileContent);
    },
    refreshFromDatabase: function () {
      getFileId().then(getFileContent).then(res => {
        this.savedWindows = res;
      });
    },
    addNewWindow: function () {}
  }
})