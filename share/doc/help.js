new Vue({
  el: "#buttons",
  methods: {
    goto: (url) => { console.log(url); window.open(url) }
  }
});
