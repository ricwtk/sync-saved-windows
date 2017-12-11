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
    console.log(gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail());
    v_app.email = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail();
  } else {
    v_app.signedIn = false;
  }
}
function signInAccount() {
  gapi.auth2.getAuthInstance().signIn();
}
function signOutAccount() {
  gapi.auth2.getAuthInstance().signOut();
}

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
      console.log("clickOnAccount", this.signedIn);
      if (this.signedIn) signOutAccount();
      else signInAccount();
    }
  }
})