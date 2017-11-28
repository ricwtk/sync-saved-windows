const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = '155155797881-435186je4g6s5f4j8f28oj1ihdmkv33g.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = ['https://www.googleapis.com/auth/drive.appfolder'];
// , 'https://www.googleapis.com/auth/drive.file'];
const AUTH_URL =
`https://accounts.google.com/o/oauth2/auth
?client_id=${CLIENT_ID}
&response_type=token
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}
&scope=${encodeURIComponent(SCOPES.join(' '))}`;
const VALIDATION_BASE_URL="https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAccessToken(redirectUri) {
  let m = redirectUri.match(/[#\?](.*)/);
  if (!m || m.length < 1)
    return null;
  let params = new URLSearchParams(m[1].split("#")[0]);
  return params.get("access_token");
}

function getUrlWithParam(baseUrl, param) {
  var reqStr = [];
  Object.keys(param).forEach(function(key, index) {
    reqStr.push(key + '=' + this[key]);
  }, param);
  return baseUrl + '?' + reqStr.join('&');
}

// function getIdentity() {
//   return browser.identity.launchWebAuthFlow({
//     interactive: true,
//     url: AUTH_URL
//   });
// }

// function validate(url) {
//   const accessToken = extractAccessToken(url);
//   if (!accessToken) {
//     throw "Authorization failure";
//   } else {
//     const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
//     const validationRequest = new Request(validationURL, {
//       method: "GET"
//     });
//     function checkResponse(response) {
//       return new Promise((resolve, reject) => {
//         if (response.status != 200) {
//           reject("Token validation error");
//         }
//         response.json().then((json) => {
//           if (json.aud && (json.aud === CLIENT_ID)) {
//             resolve(accessToken);
//           } else {
//             reject("Token validation error");
//           }
//         });
//       });
//     }
//     return fetch(validationRequest).then(checkResponse);
//   }
// }

// function listFiles(accessToken){
//   const reqUrl = "https://www.googleapis.com/drive/v3/files";
//   const reqHeader = new Headers();
//   reqHeader.append('Authorization', 'Bearer ' + accessToken);
//   var reqParam = {
//     "q": "name=\"savedtabs.json\"",
//     "spaces": "appDataFolder",
//     "fields": "files(id,name)"
//   };
//   var req = new Request(getUrlWithParam(reqUrl, reqParam), {
//     method: "GET",
//     headers: reqHeader
//   });
//   return fetch(req).then((response) => {
//     if (response.status == 200) {
//       return response.json();
//     } else {
//       throw response.status;
//     }
//   })
// }

// function checkIfCreateFile(searchResult) {
//   var files = searchResult.files;
//   if (files.length > 0) {
//     // do not create file
//   } else {
//     // create a new file
//   }
// }

// var gBtn = document.getElementById("googleicon");

// getIdentity()
//   .then(validate).then(listFiles).then(console.log);






// var reqHeader;

// class gdrive {
//   constructor() {
//   }

//   updateAccessToken(accessToken) {
//     console.log("gdrive.updateAccessToken");
//     ACCESSTOKEN = accessToken;
//     reqHeader = new Headers();
//     reqHeader.append('Authorization', 'Bearer ' + ACCESSTOKEN);
//   }

//   getSigninButton() {
//     console.log("gdrive.getSigninButton");
//     let el = document.createElement("img");
//     el.setAttribute("src", "icons/google_signin_banner.png");
//     el.classList.add("signinbanner");
//     (function(gd) {
//       el.addEventListener("click", function() {
//         gd.signIn().then(gd.validate).then(gd.updateView);
//       })
//     }) (this);
//     return el;
//   }

//   getSigninStatus() {
//     console.log("gdrive.getSigninStatus");
//     return browser.identity.launchWebAuthFlow({
//       interactive: false,
//       url: AUTH_URL
//     });
//   }

//   signIn() {
//     console.log("gdrive.signIn");
//     return browser.identity.launchWebAuthFlow({
//       interactive: true,
//       url: AUTH_URL
//     })
//   }

//   validate(url) {
//     console.log("gdrive.validate");
//     const accessToken = extractAccessToken(url);
//     if (!accessToken) {
//       throw "Authorization failure";
//     } else {
//       const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
//       const validationRequest = new Request(validationURL, {
//         method: "GET"
//       });
//       function checkResponse(response) {
//         return new Promise((resolve, reject) => {
//           if (response.status != 200) {
//             reject("Token validation error");
//           }
//           response.json().then((json) => {
//             if (json.aud && (json.aud === CLIENT_ID)) {
//               resolve(accessToken);
//             } else {
//               reject("Token validation error");
//             }
//           });
//         });
//       }
//       return fetch(validationRequest).then(checkResponse);
//     }
//   }

//   updateView() {
//     console.log("gdrive.updateView");
//     // change sign in button to sign out button
//     let el = document.createElement("div");
//     el.appendChild(document.createTextNode("Signed in"));
//     // get file list
//     return el;
//   }

//   getFile() {
//     console.log("gdrive.getFile");
//     var reqParam = {
//       "q": "name=\"savedtabs.json\"",
//       "spaces": "appDataFolder",
//       "fields": "files(id,name)"
//     };
//     var req = new Request(getUrlWithParam(REQURL, reqParam), {
//       method: "GET",
//       headers: reqHeader
//     });
//     return fetch(req).then((response) => {
//       if (response.status == 200) {
//         return response.json();
//       } else {
//         throw response.status;
//       }
//     });
//   }

//   createFileOrGetContent(response) {
//     console.log("gdrive.createFileOrGetContent");
//     var files = response.files;
//     if (files.length > 0) {
//       // get content
//       return "";
//     } else {
//       // create a new file
//       return this.createFile();
//     }
//   }

//   createFile() {
//     console.log("gdrive.createFile");
//     var reqParam = {
//       "name": "savedtabs.json",
//       "parents": "['appDataFolder']",
//       "fields": "id"
//     };
//     var req = new Request(getUrlWithParam(REQURL, reqParam), {
//       method: "POST",
//       headers: reqHeader
//     });
//     return fetch(req).then((response) => {
//       if (response.status == 200) {
//         return response.json();
//       } else {
//         throw response.status;
//       }
//     });
//   }
// }







var gdrive = {
  reqUrl: "https://www.googleapis.com/drive/v3/files",

  uploadReqUrl: "https://www.googleapis.com/upload/drive/v3/files",

  accessToken: "",

  reqHeader: "",

  getReqHeader: function() {
    let rH = new Headers();
    rH.append("Authorization", "Bearer " + gdrive.accessToken);
    return rH;
  },

  updateAccessToken: function(accessToken) {
    console.log("gdrive.updateAccessToken");
    gdrive.accessToken = accessToken;
  },

  getSigninButton: function() {
    console.log("gdrive.getSigninButton");
    let el = document.createElement("img");
    el.setAttribute("src", "icons/google_signin_banner.png");
    el.classList.add("signinbanner");
    el.addEventListener("click", function() {
      gdrive.signIn().then(gdrive.validate).then(gdrive.updateView);
    });
    return el;
  },

  getSigninStatus: function () {
    console.log("gdrive.getSigninStatus");
    return browser.identity.launchWebAuthFlow({
      interactive: false,
      url: AUTH_URL
    });
  },

  signIn: function () {
    console.log("gdrive.signIn");
    return browser.identity.launchWebAuthFlow({
      interactive: true,
      url: AUTH_URL
    })
  },

  validate: function (url) {
    console.log("gdrive.validate");
    const accessToken = extractAccessToken(url);
    if (!accessToken) {
      throw "Authorization failure";
    } else {
      const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
      const validationRequest = new Request(validationURL, {
        method: "GET"
      });
      function checkResponse(response) {
        return new Promise((resolve, reject) => {
          if (response.status != 200) {
            reject("Token validation error");
          }
          response.json().then((json) => {
            if (json.aud && (json.aud === CLIENT_ID)) {
              resolve(accessToken);
            } else {
              reject("Token validation error");
            }
          });
        });
      }
      return fetch(validationRequest).then(checkResponse);
    }
  },

  updateView: function () {
    console.log("gdrive.updateView");
    // change sign in button to sign out button
    let el = document.createElement("div");
    el.appendChild(document.createTextNode("Signed in"));
    // get file list
    return el;
  },

  getFile: function () {
    console.log("gdrive.getFile");
    var reqParam = {
      "q": "name=\"savedtabs.json\"",
      "spaces": "appDataFolder",
      "fields": "files(id,name)"
    };
    var req = new Request(getUrlWithParam(gdrive.reqUrl, reqParam), {
      method: "GET",
      headers: gdrive.getReqHeader()
    });
    return fetch(req).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });
  },

  createFileOrGetContent: function (response) {
    console.log("gdrive.createFileOrGetContent");
    var files = response.files;
    if (files.length > 0) {
      // get content
      return gdrive.getContent(files[0]);
    } else {
      // create a new file
      return gdrive.createFile()
        .then(gdrive.createDefaultContent)
        .then(gdrive.getFile)
        .then(gdrive.createFileOrGetContent);
    }
  },

  createFile: function () {
    console.log("gdrive.createFile");
    var reqHeader = gdrive.getReqHeader();
    reqHeader.append("Content-Type", "application/json");
    var reqParam = {
      "alt": "json",
      "fields": "id"
    };
    var reqBody = {
      name: 'savedtabs.json',
      parents: ['appDataFolder']
    };
    var req = new Request(getUrlWithParam(gdrive.reqUrl, reqParam), {
      method: "POST",
      headers: reqHeader,
      body: JSON.stringify(reqBody),
    });
    return fetch(req).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });
  },

  createDefaultContent: function(response) {
    console.log("gdrive.createDefaultContent");
    return gdrive.createContent(response.id, []);
  },

  getContent: function(file) {
    console.log("gdrive.getContent");
    var reqHeader = gdrive.getReqHeader();
    var reqParam = {
      alt: "media"
    };
    var req = new Request(getUrlWithParam(gdrive.reqUrl + '/' + file.id, reqParam), {
      method: "GET",
      headers: reqHeader
    });
    return fetch(req).then((response) => {
      if (response.status == 200) {
        return response.text();
      } else {
        throw response.status;
      }
    });
  },

  createContent: function(fileId, dataToSave) {
    console.log("gdrive.createContent");
    var reqHeader = gdrive.getReqHeader();
    var reqParam = {
      uploadType: "media"
    };
    var req = new Request(getUrlWithParam(gdrive.uploadReqUrl + '/' + fileId, reqParam), {
      method: "PATCH",
      headers: reqHeader,
      body: JSON.stringify(dataToSave)
    });
    return fetch(req).then((response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });
  },

  replaceContent: function(newContent) {
    console.log("gdrive.replaceContent");
    return gdrive.getFile().then((response) => {
      gdrive.createContent(response[0].id, newContent);
    });
  },

}




// var gs = document.createElement("script");
// gs.setAttribute("src", "https://apis.google.com/js/api.js");
// gs.addEventListener("load", function() {
//   console.log('google api js loaded');
//   handleClientLoad();
// });
// document.head.appendChild(gs);

// function handleClientLoad() {
//   gapi.load("auth2", initClient);
//   console.log(gapi);
// }

// function initClient() {
//   var user = gapi.auth2.getAuthInstance().currentUser.get();
//   var oauthToken = user.getAuthResponse().access_token;
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET',
//     'https://people.googleapis.com/v1/people/me/connections' +
//     '?access_token=' + encodeURIComponent(oauthToken.access_token));
//   xhr.send();
//   console.log(user, oauthToken, xhr);
//   console.log('gapi.client' in window);
//   console.log(gapi);
//   var auth2 = gapi.auth2.init({
//     discoveryDocs: DISCOVERY_DOCS,
//     clientId: CLIENT_ID,
//     scope: SCOPES
//   });
//   auth2.isSignedIn.listen(updateSigninStatus);
//   // Handle the initial sign-in state
//   updateSigninStatus(auth2.isSignedIn.get());
// }

// function updateSigninStatus(isSignedIn) {
//   console.log(isSignedIn);
//   if (isSignedIn) {
//     gBtn.src = "./icons/google_signedin.png";
//     // checkIfCreate();
//   } else {
//     gBtn.src = "./icons/google_disabled.png";
//   }
// }