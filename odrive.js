var odrive = {
  getSigninButton: function () {
    let el = document.createElement("span");
    el.appendChild(document.createTextNode("Sign in with"));
    el.appendChild(document.createElement("br"));
    let img = document.createElement("img");
    img.setAttribute("src", "icons/onedrive_signin_banner.png");
    img.classList.add("signinbanner");
    el.appendChild(img);
    return el;
  },
}