// parsers.js — generic + Hightouch-aware, no TD-specific keys
// Controlled via Settings (chrome.storage.sync → customFields)
//
// Example config for "hightouch-event":
// {
//   "hightouch-event": {
//     "keys": ["type","anonymousId","userId","page.title","page.url"], // always include (if present)
//     "exclude": [],                    // never include (when includeAll=true)
//     "includeAll": true,               // include everything else (except exclude), with caps below
//     "sampleCount": 1,                 // not used here, but supported
//     "maxString": 600,                 // truncate long strings
//     "maxArrayItems": 5,               // list sample cap (adds __more__)
//     "maxObjectKeys": 50               // object keys cap (adds __more__)
//   }
// }

function makeSummarizer(cfg = {}) {
  const maxString = Number.isFinite(cfg.maxString) ? cfg.maxString : 500;
  const maxArrayItems = Number.isFinite(cfg.maxArrayItems) ? cfg.maxArrayItems : 3;
  const maxObjectKeys = Number.isFinite(cfg.maxObjectKeys) ? cfg.maxObjectKeys : 20;

  function summarizeValue(v) {
    if (v == null) return v;
    const t = typeof v;

    if (t === 'string') {
      return v.length > maxString ? v.slice(0, maxString) + ' …' : v;
    }
    if (t === 'number' || t === 'boolean') return v;

    if (Array.isArray(v)) {
      const out = v.slice(0, maxArrayItems).map(summarizeValue);
      if (v.length > maxArrayItems) out.push({ __more__: v.length - maxArrayItems });
      return out;
    }

    if (t === 'object') {
      const keys = Object.keys(v);
      const out = {};
      for (let i = 0; i < keys.length && i < maxObjectKeys; i++) {
        const k = keys[i];
        out[k] = summarizeValue(v[k]);
      }
      if (keys.length > maxObjectKeys) {
        out.__more__ = `+${keys.length - maxObjectKeys} keys`;
      }
      return out;
    }

    return v;
  }

  return { summarizeValue };
}

function buildObject(ev, cfg = {}) {
  const keys = Array.isArray(cfg.keys) ? cfg.keys : [];
  const exclude = new Set(Array.isArray(cfg.exclude) ? cfg.exclude : []);
  const includeAll = !!cfg.includeAll;

  const { summarizeValue } = makeSummarizer(cfg);
  const out = {};

  // 1) Always include requested keys (if present)
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(ev, k)) {
      out[k] = summarizeValue(ev[k]);
    }
  }

  // 2) Optionally include all other keys (minus exclude + already added)
  if (includeAll) {
    for (const k of Object.keys(ev)) {
      if (k in out || exclude.has(k)) continue;
      out[k] = summarizeValue(ev[k]);
    }
  }

  return out;
}

// tiny helper to drill into nested fields (e.g. "context.page.title")
function get(obj, path, fallback = undefined) {
  return path.split('.').reduce(
    (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
    obj
  ) ?? fallback;
}

export const defaultExtractors = [
  // Hightouch Events SDK-style single event payloads:
  // {
  //   "timestamp": "...",
  //   "type": "page",
  //   "properties": {...},
  //   "context": {...},
  //   "anonymousId": "...",
  //   "userId": null,
  //   "messageId": "...",
  //   "writeKey": "...",
  //   "sentAt": "..."
  // }
  {
    name: 'hightouch-event',
    match: ({ bodyObj }) => {
      if (!bodyObj || typeof bodyObj !== 'object') return false;
      // loose heuristic: looks like a Hightouch event envelope
      return typeof bodyObj.type === 'string' &&
             (bodyObj.anonymousId || bodyObj.userId || bodyObj.writeKey || bodyObj.messageId);
    },
    summarize: ({ bodyObj, customFields }) => {
      const cfg = (customFields && customFields['hightouch-event']) || {};
      const { summarizeValue } = makeSummarizer(cfg);

      const type = bodyObj.type;
      const context = bodyObj.context || {};
      const page = get(bodyObj, 'context.page') || bodyObj.properties || {};

      const out = {
        sdk: 'hightouch',
        type,
        messageId: bodyObj.messageId,
        timestamp: bodyObj.timestamp || bodyObj.sentAt,
        userId: bodyObj.userId ?? null,
        anonymousId: bodyObj.anonymousId ?? null,

        // don't expose writeKey directly; just note that it’s present
        writeKey_present: !!bodyObj.writeKey,

        page: {
          title: page.title,
          url: page.url,
          path: page.path,
          referrer: page.referrer
        },

        properties: bodyObj.properties || {},
        context: {
          locale: context.locale,
          timezone: context.timezone,
          sessionId: context.sessionId,
          sessionStart: context.sessionStart,
          library: context.library,
          userAgentData: context.userAgentData
        }
      };

      // If the user has configured keys/includeAll, run buildObject on the event-level object
      if (cfg.keys || cfg.includeAll || cfg.exclude) {
        // Flatten a minimal event envelope we want to expose to customization
        const flat = {
          sdk: out.sdk,
          type: out.type,
          messageId: out.messageId,
          timestamp: out.timestamp,
          userId: out.userId,
          anonymousId: out.anonymousId,
          writeKey_present: out.writeKey_present,
          page: out.page,
          properties: out.properties,
          context: out.context
        };
        return buildObject(flat, cfg);
      }

      // Otherwise just apply summarization caps to nested bits
      out.properties = summarizeValue(out.properties);
      out.context = summarizeValue(out.context);
      return out;
    }
  },

  // OPTIONAL: if Hightouch ever sends batch payloads like { "batch": [ ...events ] },
  // you can later add an extractor here for "hightouch-batch" .

  // Fallback: return the object with safe summarization caps if configured as "generic"
  {
    name: 'generic',
    match: () => true,
    summarize: ({ bodyObj, customFields }) => {
      const cfg = (customFields && customFields['generic']) || {};
      const { summarizeValue } = makeSummarizer(cfg);
      return summarizeValue(bodyObj);
    }
  }
];