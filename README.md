# Linkedin-Proxy-Email-Generator_Chrome-Extension

Protect your inbox when posts ask you to “drop your email in the comments.”
This extension inserts a proxy (alias) email into LinkedIn comment boxes and lets you deactivate any alias that starts getting spam.

1-click “Use proxy email” button in LinkedIn comments

Aliases forward to your real inbox (via AnonAddy)

(Not affiliated with LinkedIn or AnonAddy.)

<h3> Why </h3>

Comment sections are public. Spambots harvest emails posted there. A unique alias per post keeps your real address private and lets you kill any alias that leaks.

<h2> How it works </h2>

A content script adds a “Use proxy email” button to LinkedIn comment editors.

Clicking it asks the background service worker to create an alias via AnonAddy and inserts the alias at your cursor.

<h2> Requirements </h2>

Chromium browser (Chrome, Edge, Brave, Arc, etc.)

An AnonAddy account + API token

An alias domain you control:

Your username subdomain (e.g., yourname.anonaddy.me) or

A custom domain connected to AnonAddy

Don’t use a full email as the alias domain. Use just the domain (yourname.anonaddy.me, john@yourname.anonaddy.me).

<h2> Install (developer mode) </h2>

Download or clone the project folder.

Open chrome://extensions, enable Developer mode.

Click Load unpacked → select the project folder (the one containing manifest.json).

Pin the extension if you like (toolbar puzzle icon → pin).

<h2> Configure </h2>

Click the extension → Details

<img width="459" height="305" alt="image" src="https://github.com/user-attachments/assets/97f2abe1-30d8-4041-b959-f652f731f0aa" />

Then press the Extension options.

<img width="722" height="281" alt="image" src="https://github.com/user-attachments/assets/c6cf4394-21ce-43b2-9cc1-614719b508fb" />


Set:

API Token: your AnonAddy API key.

Alias domain: e.g., yourname.anonaddy.me (no @).

<img width="683" height="293" alt="image" src="https://github.com/user-attachments/assets/4423fbc7-5f68-43e5-9f3a-e6100ac14c0e" />


Save and Reload the extension.

<h2> Usage </h2>

On LinkedIn:

Start a comment → click “Use proxy email” (button under the editor) → an alias is inserted at the caret.

Post your comment normally.

On AnonAddy website:

See a list of your aliases.

Use the Active toggle to instantly deactivate a spammy alias.

Files (MV3)
manifest.json         # Extension manifest (permissions, scripts)
background.js         # Service worker: provider API calls, burners, menus, commands
content.js            # Injects the button, inserts alias into editors
popup.html / popup.js # UI to list & toggle aliases (+ Copy button)
options.html / options.js
styles.css

No analytics or telemetry. Your data stays in Chrome’s extension storage.

<h2> Privacy & Security </h2>

The extension stores your API token and domain in chrome.storage.sync by default (you can switch to local in code if you prefer).

The token is never transmitted anywhere except directly to AnonAddy’s API for alias management.

Don’t distribute a packaged ZIP with your token included.

Review the code; it only interacts with LinkedIn editors and the AnonAddy API.

Note any new permissions in the README.

<h2> License </h2>

MIT — do whatever you want, just include the license and don’t sue me.

<h2> Acknowledgements </h2>

AnonAddy for the aliasing service 

Everyone who’s ever said “drop your email in the comments” (you inspired this project)
