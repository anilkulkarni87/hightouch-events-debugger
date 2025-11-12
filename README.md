# Hightouch Events Debugger (MV3)

A lightweight **Chrome/Edge DevTools panel** to inspect **Hightouch Events SDK** calls in the browser.

- Focused on `events.hightouch.com` (page / track / identify / group, etc.)
- Hightouch-inspired dark theme with emerald accents
- Privacy-first: runs inside DevTools, no telemetry, no servers

> This is a community-built tool, not an official Hightouch product.

---

## Features

- **Hightouch-aware parsing**
  - Detects Hightouch Events SDK requests (e.g. `/v1/page`, `/v1/track`)
  - Summarizes important fields:
    - `type` (`page`, `track`, `identify`, …)
    - `userId`, `anonymousId`
    - `properties.*` (e.g. `title`, `url`, `path`, `referrer`)
    - `context.*` (page, locale, timezone, session info, library, userAgentData)
    - `timestamp`, `messageId`

- **Preflight toggle**
  - Hide or show CORS `OPTIONS` preflight noise

- **Filter & CSV export**
  - Filter by URL or payload text
  - Export the current view as CSV for quick sharing with teammates

- **Redact PII**
  - Built-in masking for common patterns (emails, tokens)
  - Custom regex rules for your own secrets (e.g., `writeKey`, session IDs)
  - Redaction is **display/CSV-only** (does not modify your real requests)

- **Local-only / no telemetry**
  - No analytics, no remote logging
  - Only stores configuration in `chrome.storage` (hosts, toggles, presets, redaction rules)

---

## Install

### From the Chrome Web Store

> (Once published, replace with your extension link)

- **Chrome Web Store:** `https://chromewebstore.google.com/detail/…`

### From source (developer mode)

1. Clone this repository:

   ```bash
   git clone https://github.com/<your-account>/hightouch-events-debugger.git
   cd hightouch-events-debugger