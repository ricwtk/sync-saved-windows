function accessStorage(store) {
  console.log("storagefunction > accessStorage");
  switch (store) {
    case "local":
      updateUi(local.getSigninButton());
      break;
    case "gdrive":
      updateUi(gdrive.getSigninButton());
      gdrive.getSigninStatus()
        .then(gdrive.validate)
        .then(gdrive.updateAccessToken)
        .then(gdrive.updateView)
        .then(updateUi)
        .then(gdrive.getFile)
        .then(gdrive.createFileOrGetContent)
        .then(displaySaved);
      break;
    case "odrive":
      updateUi(odrive.getSigninButton());
      break;
    case "dbox":
      updateUi(dbox.getSigninButton());
      break;
    default:
      updateUi(document.createTextNode(""));
      break;
  }
}

function retrieveFromStorage(store) {
  console.log("storagefunction > retrieveFromStorage");
  switch (store) {
    case "local":
      break;
    case "gdrive":
      return gdrive.getFile()
        .then(gdrive.createFileOrGetContent);
      break;
    case "odrive":
      break;
    case "dbox":
      break;
    default:
      break;
  }
}

function saveToStorage(store, windowToSave) {
  console.log("storagefunction > saveToStorage");
  var updateSaved = retrieveFromStorage(store).then((response) => {
    response.push(windowToSave);
    return response;
  });
  switch (store) {
    case "local":
      break;
    case "gdrive":
      updateSaved.then(gdrive.replaceContent)
        .then(refreshPage);
      break;
    case "odrive":
      break;
    case "dbox":
      break;
    default:
      break;
  }
}

function updateUi(el) {
  console.log("storagefunction > updateUi");
  let wrapper = document.getElementById("signinbutton");
  while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
  wrapper.appendChild(el);
}

function displaySaved(saved) {
  console.log("storagefunction > displaySaved");
  try {
    saved = JSON.parse(saved);
  } catch (err) {
    throw "cannot parse saved text";
  }
  console.log(saved);
  if (saved.length > 0) {
    var winarr = [];
    var i = 0;
    for (let w of saved) {
      var singlewin = document.createElement("div");
      singlewin.setAttribute("class", "window");
      singlewin.setAttribute("title", "Click on an icon to open tab in this window");
      var tabswrapper = document.createElement("div");
      tabswrapper.setAttribute("class", "tabswrapper addsep");
      for (let t of w) {
        var singletab = document.createElement("img");
        singletab.setAttribute("src", t.favIconUrl);
        singletab.setAttribute("class", "favicon");
        singletab.setAttribute("title", t.title);
        singletab.addEventListener("click", function() {openInTab(t)});
        tabswrapper.appendChild(singletab);
      }
      singlewin.appendChild(tabswrapper);
      var delwin = document.createElement("div");
      delwin.setAttribute("class", "delwinbtn addsep");
      delwin.setAttribute("title", "Delete from saved list");
      delwin.appendChild(document.createTextNode("\u2A2F"));
      (function(i) {
        delwin.addEventListener("click", function() { deleteWinByArrIdx(i) });
      })(i);
      singlewin.appendChild(delwin);
      var openwin = document.createElement("div");
      openwin.setAttribute("class", "openwinbtn addsep");
      openwin.setAttribute("title", "Open in new window");
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
}

function showNoSaved() {
  var nosaved = document.createElement("div");
  nosaved.setAttribute("class", "nosaveddiv");
  nosaved.appendChild(document.createTextNode("No saved window"));
  appendToSavedList([nosaved]);
}

function refreshPage() {
  location.reload();
}