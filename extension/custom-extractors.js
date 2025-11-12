// custom-extractors.js — Hightouch-specific

import { defaultExtractors } from './parsers.js';

// tiny helper
function get(obj, path, fallback = undefined) {
  return path.split('.').reduce(
    (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
    obj
  ) ?? fallback;
}

const hightouchExtractor = {
  name: 'hightouch-event',
  match: ({ bodyObj }) => {
    if (!bodyObj || typeof bodyObj !== 'object') return false;
    // Very light heuristic: looks like a Hightouch-style event
    return typeof bodyObj.type === 'string' &&
           (bodyObj.writeKey || bodyObj.messageId || bodyObj.anonymousId);
  },
  summarize: ({ bodyObj, customFields }) => {
    const type = bodyObj.type;  // page / track / identify / group / screen
    const context = bodyObj.context || {};
    const page = get(bodyObj, 'context.page') || bodyObj.properties || {};

    const out = {
      sdk: 'hightouch',
      type,
      messageId: bodyObj.messageId,
      timestamp: bodyObj.timestamp || bodyObj.sentAt,
      userId: bodyObj.userId ?? null,
      anonymousId: bodyObj.anonymousId ?? null,
      // mask writeKey in the UI; you can also add a redaction rule
      writeKey_present: !!bodyObj.writeKey,

      page: {
        title: page.title,
        url: page.url,
        path: page.path,
        referrer: page.referrer,
      },

      properties: bodyObj.properties || {},
      context: {
        locale: context.locale,
        timezone: context.timezone,
        sessionId: context.sessionId,
        sessionStart: context.sessionStart,
        library: context.library,
        userAgentData: context.userAgentData,
      }
    };

    // Let users still tweak via Settings → customFields["hightouch-event"]
    const cfg = (customFields && customFields['hightouch-event']) || null;
    if (!cfg) return out;

    // Optional: reuse summarizer to cap deep nested structures
    const { summarizeValue } = (() => {
      // tiny adapter around makeSummarizer in parsers.js, if you want it:
      return { summarizeValue: (v) => v }; // simple version: no extra summarization
    })();

    if (cfg.maxString || cfg.maxArrayItems || cfg.maxObjectKeys) {
      out.properties = summarizeValue(out.properties);
      out.context = summarizeValue(out.context);
    }

    return out;
  }
};

export const extractors = [
  hightouchExtractor,
  ...defaultExtractors    // fallback to generic if match fails
];