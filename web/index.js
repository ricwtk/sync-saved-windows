// var signedIn = false;

function onSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
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
      console.log(res);
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
    if (files.length < 1) {
      // create file
    } else {
      return files[0].id;
    }
  })
}
function getFileContent(fileId) {
  return gapi.client.drive.files.get({
    fileId: fileId,
    alt: "media"
  }).then(resp => {
    return resp.result;
  });
} 

Vue.component("single-window", {
  props: ["window"],
  data: function () {
    return {
      showTabList: false
    }
  },
  computed: {
    tabListClass: function () {
      return {
        "tab-list": true,
        "hide-tab-list": !this.showTabList,
        "show-tab-list": this.showTabList
      }
    }
  },
  methods: {
    toggleTabList: function () {
      this.showTabList = !this.showTabList;
    }
  },
  template: `
    <div class="single-window">
      <div class="overview">
        <div class="tabs-wrapper" @click="toggleTabList">
          <single-tab v-for="tab in window.tabs" :tab="tab"></single-tab>
        </div>
        <div class="actions-group">
          <div class="action fa fa-times"></div>
          <div class="action fa fa-window-restore"></div>
        </div>
      </div>
      <div :class="tabListClass">
        <single-tab-detail v-for="tab in window.tabs" :tab="tab"></single-tab-detail>
      </div>
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
  template: `
    <div class="single-tab-detail">
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon">
      <i v-else class="fa fa-question-circle favicon"></i>
      <div class="detail">
        <div class="single-tab-title">{{ tab.title }}</div>
        <div class="single-tab-url">{{ tab.url }}</div>
      </div>
      <div class="fa fa-external-link"></div>
    </div>
  `
});

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
    }
  }
})