const BTN_CLASS = "lpemail-btn";

// Safe wrapper for runtime messaging
function safeSendMessage(msg, cb) {
  try {
    if (!chrome.runtime || !chrome.runtime.id) {
      console.warn("Extension context invalidated; reload the page.");
      if (cb) cb(null, new Error("Extension context invalidated"));
      return;
    }
    chrome.runtime.sendMessage(msg, function (resp) {
      if (chrome.runtime.lastError) {
        console.warn("sendMessage error:", chrome.runtime.lastError.message);
        if (cb) cb(null, new Error(chrome.runtime.lastError.message));
        return;
      }
      if (cb) cb(resp, null);
    });
  } catch (err) {
    console.warn("sendMessage threw:", err);
    if (cb) cb(null, err);
  }
}

function addButtonNear(el) {
  if (!el) return;
  if (el.dataset && el.dataset.lpemail === "1") return;
  if (el.dataset) el.dataset.lpemail = "1";

  var wrapper = document.createElement("div");
  wrapper.className = BTN_CLASS;
  wrapper.textContent = "Use proxy email";
  wrapper.title = "Generate and insert a proxy alias";

  wrapper.addEventListener("click", function (e) {
    e.preventDefault();
    wrapper.textContent = "Generating…";

    var note = document.title ? document.title.slice(0, 80) : "LinkedIn";

    safeSendMessage({ type: "CREATE_ALIAS", note: note }, function (resp, err) {
      if (err) {
        console.warn(err);
        wrapper.textContent = "Reload page & try";
        setTimeout(function () { wrapper.textContent = "Use proxy email"; }, 1800);
        return;
      }
      if (!resp || !resp.ok) {
        console.warn("bg error:", resp && resp.error);
        wrapper.textContent = "Error";
        setTimeout(function () { wrapper.textContent = "Use proxy email"; }, 1800);
        return;
      }
      insertAtCursor(el, resp.alias.email);
      flash(el);
      wrapper.textContent = "Inserted ✓";
      setTimeout(function () { wrapper.textContent = "Use proxy email"; }, 1200);
    });
  });

  if (el.parentElement) el.parentElement.appendChild(wrapper);
}

function insertAtCursor(el, text) {
  if (!el) return;
  if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
    var start = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    var end   = typeof el.selectionEnd === "number" ? el.selectionEnd : el.value.length;
    el.value = el.value.slice(0, start) + text + el.value.slice(end);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  // contenteditable
  el.focus();
  var sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  var range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  range.collapse(false);
}

function flash(el) {
  el.style.outline = "2px solid #00c853";
  setTimeout(function () { el.style.outline = ""; }, 600);
}

function scanAndAttach() {
  var boxes = document.querySelectorAll('[contenteditable="true"][role="textbox"], textarea');
  for (var i = 0; i < boxes.length; i++) addButtonNear(boxes[i]);
}

// Re-scan on DOM mutations (LinkedIn SPA nav)
var observer = new MutationObserver(function () { scanAndAttach(); });
observer.observe(document.documentElement, { childList: true, subtree: true });

// Initial scan
scanAndAttach();

// Also re-scan when the SPA signals a route change
window.addEventListener("popstate", scanAndAttach);
window.addEventListener("pageshow", scanAndAttach);
