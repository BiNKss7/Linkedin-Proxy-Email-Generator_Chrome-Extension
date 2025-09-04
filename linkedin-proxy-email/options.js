function load() {
  chrome.storage.sync.get(
    {
      provider: "anonaddy",
      anonaddy: { token: "", aliasDomain: "yourname.anonAddy.com" }
    },
    function (cfg) {
      document.getElementById("aa-token").value = (cfg.anonaddy && cfg.anonaddy.token) ? cfg.anonaddy.token : "";
      document.getElementById("aa-domain").value = (cfg.anonaddy && cfg.anonaddy.aliasDomain) ? cfg.anonaddy.aliasDomain : "";
    }
  );
}

document.getElementById("save").addEventListener("click", function () {
  var token = document.getElementById("aa-token").value.trim();
  var aliasDomain = document.getElementById("aa-domain").value.trim();
  chrome.storage.sync.set({ provider: "anonaddy", anonaddy: { token: token, aliasDomain: aliasDomain } }, function () {
    alert("Saved ✔\nClose this tab and try creating an alias in a LinkedIn comment.");
  });
});

document.addEventListener("DOMContentLoaded", load);