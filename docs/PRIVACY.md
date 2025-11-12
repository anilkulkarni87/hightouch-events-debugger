# Privacy Policy — Hightouch Events Debugger (MV3)

**Last updated:** 2025-11-11  

Hightouch Events Debugger (“the Extension”) is a Chrome/Edge DevTools panel that helps developers inspect Hightouch Events SDK calls in their own browser. This is a **community-built tool** and is **not an official Hightouch product**.

The Extension is designed to be **local-only** and does **not** send any captured data to servers controlled by the developer.

---

## Data we collect

- **We do not collect, transmit, sell, or share any personal data.**
- The Extension does not include analytics, trackers, or any third-party SDKs that send data back to us.
- All inspection and summarization of network traffic happens **inside your browser’s DevTools context** while the panel is open.

Any data you see in the panel (including payloads, headers, and event details) is data your browser is already sending to Hightouch or other endpoints as part of normal browsing or your own application.

---

## How the Extension works

- The Extension adds a custom tab inside Chrome/Edge DevTools.
- While DevTools is open, it can listen to network requests and identify those that match certain hosts such as:
  - `events.hightouch.com` (and any additional hosts you configure)
- For matching requests, the Extension:
  - Reads request/response metadata (method, URL, status, headers, content type).
  - Optionally parses JSON request bodies to show a more readable summary (e.g., `type`, `userId`, `anonymousId`, `properties`, `context`).
- All of this happens **locally** in your browser. No event data is sent back to us.

Configuration such as host filters, toggles, and custom rules is stored using the browser’s extension storage (e.g., `chrome.storage`).

---

## Use of data and retention

- The Extension does **not** store copies of network payloads or logs anywhere outside the DevTools session.
- Parsed data is kept only in memory while DevTools and the panel are open.
- Configuration settings (such as event hosts, filter text, redaction rules, and summarization presets) may be stored in your browser profile so that the panel behaves consistently between sessions.
  - You can clear or uninstall the Extension at any time to remove these settings.

---

## Sharing of data

- We do **not** share any data with third parties.
- The Extension does not send your HTTP traffic, headers, or payloads to us or to any other external service for processing.
- The Extension does not use ad networks, analytics services, or tracking scripts.

---

## Permissions

The Extension requests the minimum set of permissions necessary to function:

- **DevTools**  
  Required to create a custom DevTools panel and observe network requests while DevTools is open.

- **Storage**  
  Used only to save local configuration such as:
  - Event hosts
  - Panel toggles (e.g., show preflights)
  - Custom summarization settings
  - Redaction rules

- **Host permissions** (e.g. `https://events.hightouch.com/*`)  
  Used so the DevTools panel can recognize and highlight event traffic to those endpoints in your local DevTools view.  
  These permissions **do not** make additional network requests by themselves.

---

## Redaction and security

The Extension includes basic privacy protections for display:

- Certain sensitive-looking patterns (such as emails or long tokens) may be masked in the UI by default.
- You can define additional custom redaction rules (regex patterns) to obscure specific fields like `writeKey`, session IDs, or customer identifiers in **displayed payloads**.

> **Important:** Redaction is **display- and export-only**. It affects what you see in the DevTools panel and CSV exports, **not** the actual HTTP requests your site sends to Hightouch or any other service.

The security of your environment still depends on the browser, operating system, and overall device security. If your machine or browser profile is compromised, network traffic—including what this Extension shows—may be visible to attackers regardless of this tool.

---

## Children’s privacy

The Extension is a developer tool intended for technical users and is **not designed for children** or for use by individuals under the age of 13.

We do not knowingly collect or process personal information from children.

---

## Your choices

- You can disable or remove the Extension at any time via the browser’s extensions page (e.g., `chrome://extensions`).
- You may also clear extension data (including stored settings and rules) through your browser’s settings or by removing the Extension.
- If you export configuration (e.g., presets or rules), the resulting file is generated **locally** and stored only where you choose to save it.

---

## Changes to this policy

We may update this Privacy Policy from time to time. When we do, we will update the “Last updated” date at the top of this page.

Material changes may also be mentioned in the project’s README or release notes.

---

## Contact

If you have any questions or concerns about this Privacy Policy or the Extension, please contact:

**Email:** `anil77k@gmail.com`  

(Replace this with your preferred contact address.)