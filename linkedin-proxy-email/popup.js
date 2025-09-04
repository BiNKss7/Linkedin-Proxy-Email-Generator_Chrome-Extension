function html(strings) {
  var out = "";
  for (var i = 0; i < arguments.length; i++) {
    if (i === 0) continue;
    var s = arguments[i];
    out += strings[i - 1] + (s == null ? "" : String(s));
  }
  out += strings[strings.length - 1];
  return out;
}

function normalizeItems(list) {
  if (!list) return [];
  var candidates = list.data || list.aliases || list.results || [];
  return candidates;
}

function textOr(obj, keys, fallback) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (obj && obj[k] != null) return obj[k];
  }
  return fallback;
}

async function load() {
  const resp = await chrome.runtime.sendMessage({ type: "LIST_ALIASES" });
  const root = document.getElementById("aliases");
  if (!resp || !resp.ok) {
    root.textContent = (resp && resp.error) ? resp.error : "Failed to load aliases";
    return;
  }
  var items = normalizeItems(resp.list).slice(0, 50);
  if (items.length === 0) {
    root.innerHTML = "<p>No aliases yet. Use the button in a LinkedIn comment to create one.</p>";
    return;
  }

  var htmlOut = "";
  for (var i = 0; i < items.length; i++) {
    var a = items[i];
    var email = textOr(a, ["email", "name", "alias"], "");
    if (!email) {
      var local = textOr(a, ["local_part"], "");
      var domain = textOr(a, ["domain"], "");
      email = local && domain ? (local + "@" + domain) : "";
    }
    var active = !!textOr(a, ["active", "enabled", "is_enabled"], true);
    var id = textOr(a, ["id", "alias_id", "_id", "guid", "slug"], "");
    htmlOut += (
      '<div class="alias">' +
        '<div class="email">' + email + '</div>' +
        '<label class="switch">' +
          '<input type="checkbox" data-id="' + id + '"' + (active ? " checked" : "") + ' />' +
          '<span>Active</span>' +
        '</label>' +
      '</div>'
    );
  }
  root.innerHTML = htmlOut;

  var inputs = root.querySelectorAll("input[type=checkbox]");
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].addEventListener("change", async function (e) {
      var aliasId = e.target.getAttribute("data-id");
      if (!aliasId) { alert("Missing alias ID from provider response."); return; }
      var active = e.target.checked;
      var resp = await chrome.runtime.sendMessage({ type: "SET_ALIAS_ACTIVE", aliasId: aliasId, active: active });
      if (!resp || !resp.ok) {
        alert((resp && resp.error) ? resp.error : "Failed to update.");
        e.target.checked = !active;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", load);