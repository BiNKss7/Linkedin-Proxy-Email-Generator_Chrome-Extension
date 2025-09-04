function rand(n) {
  const arr = crypto.getRandomValues(new Uint32Array(n));
  let s = "";
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(36);
  return s.slice(0, n);
}

// Fetch JSON with error handling
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) {}
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.errors)) ||
      text ||
      ("HTTP " + res.status);
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  return data;
}

const Providers = {
  anonaddy: {
    baseUrl: "https://app.addy.io/api/v1",

    async listAliases(token, pageSize = 25, page = 1) {
      const url = new URL(this.baseUrl + "/aliases");
      url.searchParams.set("page[size]", String(pageSize));
      url.searchParams.set("page[number]", String(page));
      return fetchJSON(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json"
        }
      });
    },

    // Create a new alias
    async createAlias({ token, aliasDomain, note }) {
      const local = `li-${Date.now().toString(36)}-${rand(4)}`;
      const email = `${local}@${aliasDomain}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json"
      };

      const tryCreate = async (body) => {
        const url = this.baseUrl + "/aliases";
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (_) {}
        if (!res.ok) {
          const msg = (data && (data.message || data.error || data.errors)) || text || ("HTTP " + res.status);
          const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
          err.status = res.status;
          throw err;
        }
        return data || {};
      };

      try {
        // Attempt #1
        const data = await tryCreate({
          domain: aliasDomain,
          format: "custom",
          local_part: local,
          description: note || "LinkedIn Proxy Email"
        });
        const gotEmail = data && data.data && data.data.email ? data.data.email : email;
        const id = data && data.data && data.data.id ? data.data.id : null;
        return { email: gotEmail, id };
      } catch (e1) {
        if (e1.status && e1.status !== 422) throw e1;
        try {
          // Attempt #2
          const data2 = await tryCreate({
            email: email,
            description: note || "LinkedIn Proxy Email"
          });
          const gotEmail2 = data2 && data2.data && data2.data.email ? data2.data.email : email;
          const id2 = data2 && data2.data && data2.data.id ? data2.data.id : null;
          return { email: gotEmail2, id: id2 };
        } catch (e2) {
          // Attempt #3 (fallback)
          console.warn("Pre-create failed; using on-first-use alias:", e2.message || e2);
          return { email }; // No id yet; will appear after first inbound message
        }
      }
    },

    async setAliasActive({ token, aliasId, active }) {
      if (active) {
        // Activate
        return fetchJSON(this.baseUrl + "/active-aliases", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json"
          },
          body: JSON.stringify({ id: aliasId })
        }).catch(() => ({}));
      } else {
        // Deactivate
        return fetchJSON(this.baseUrl + "/active-aliases/" + aliasId, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json"
          }
        }).catch(() => ({}));
      }
    }
  }
};

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        provider: "anonaddy",
        anonaddy: { token: "", aliasDomain: "yourname.anonaddy.me" }
      },
      (cfg) => resolve(cfg)
    );
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      const settings = await getSettings();
      const api = Providers.anonaddy;

      if (msg.type === "CREATE_ALIAS") {
        const token = settings.anonaddy && settings.anonaddy.token;
        const aliasDomain = settings.anonaddy && settings.anonaddy.aliasDomain;
        if (!token) throw new Error("AnonAddy API token missing in Options");
        if (!aliasDomain) throw new Error("Alias domain missing in Options");
        const note = msg && msg.note ? msg.note : "LinkedIn";

        const alias = await api.createAlias({ token, aliasDomain, note });
        sendResponse({ ok: true, alias });
        return;
      }

      if (msg.type === "LIST_ALIASES") {
        const token = settings.anonaddy && settings.anonaddy.token;
        if (!token) throw new Error("AnonAddy API token missing in Options");
        const list = await api.listAliases(token, 50, 1);
        sendResponse({ ok: true, list });
        return;
      }

      if (msg.type === "SET_ALIAS_ACTIVE") {
        const token = settings.anonaddy && settings.anonaddy.token;
        if (!token) throw new Error("AnonAddy API token missing in Options");
        const aliasId = msg && msg.aliasId;
        const active = !!(msg && msg.active);
        if (!aliasId) throw new Error("aliasId required");
        const out = await api.setAliasActive({ token, aliasId, active });
        sendResponse({ ok: true, out });
        return;
      }
    } catch (e) {
      console.error(e);
      sendResponse({ ok: false, error: String(e && e.message ? e.message : e) });
    }
  })();
  return true; 
});
