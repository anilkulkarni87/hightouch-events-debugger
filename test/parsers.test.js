import { describe, it, expect } from 'vitest';
import { defaultExtractors } from '../extension/parsers.js';

describe('parsers defaultExtractors (Hightouch)', () => {
  it('has hightouch-event extractor that recognizes a single HT event and summarizes', () => {
    const ex = defaultExtractors.find(e => e.name === 'hightouch-event');
    expect(ex).toBeTruthy();

    const bodyObj = {
      timestamp: '2025-01-01T00:00:00.000Z',
      type: 'page',
      properties: {
        title: 'Welcome | Hightouch Docs',
        url: 'https://hightouch.com/docs',
        path: '/docs',
        referrer: 'https://www.google.com/'
      },
      context: {
        page: {
          title: 'Welcome | Hightouch Docs',
          url: 'https://hightouch.com/docs',
          path: '/docs',
          referrer: 'https://www.google.com/'
        },
        sessionId: 123,
        sessionStart: true,
        locale: 'en-US',
        timezone: 'America/Los_Angeles',
        library: { name: 'events-sdk-js', version: 'npm-1.3.0' }
      },
      anonymousId: 'anon-123',
      userId: null,
      messageId: 'msg-123',
      writeKey: 'super-secret-write-key',
      sentAt: '2025-01-01T00:00:00.010Z'
    };

    // includeAll so the flat envelope is returned with page/properties/context
    const ctx = {
      bodyObj,
      customFields: { 'hightouch-event': { includeAll: true, keys: ['type', 'anonymousId'] } }
    };

    expect(ex.match(ctx)).toBeTruthy();

    const summary = ex.summarize(ctx);

    // basic fields
    expect(summary.type).toBe('page');
    expect(summary.anonymousId).toBe('anon-123');

    // never expose writeKey; only the boolean
    expect(summary.writeKey_present).toBe(true);
    expect('writeKey' in summary).toBe(false);

    // page info should be summarized
    expect(summary.page).toBeTruthy();
    expect(summary.page.title).toBe('Welcome | Hightouch Docs');
    expect(summary.page.url).toBe('https://hightouch.com/docs');

    // context should exist (shape may be summarized)
    expect(summary.context).toBeTruthy();
    expect(summary.context.locale).toBe('en-US');
  });

  it('generic summarizer truncates long strings and caps arrays/objects', () => {
    // last extractor is generic in our implementation
    const generic = defaultExtractors[defaultExtractors.length - 1];
    expect(generic.name).toBe('generic');

    const longString = 'x'.repeat(2000);
    const bodyObj = {
      long: longString,
      arr: Array.from({ length: 20 }, (_, i) => i),
      obj: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`k${i}`, i]))
    };

    const ctx = {
      bodyObj,
      customFields: { generic: { maxString: 100, maxArrayItems: 5, maxObjectKeys: 10 } }
    };

    const summary = generic.summarize(ctx);

    // long string should be truncated (ends with ellipsis char + space)
    expect(typeof summary.long).toBe('string');
    expect(summary.long.length).toBeLessThan(longString.length);

    // array should be capped to 5 items + __more__
    expect(Array.isArray(summary.arr)).toBe(true);
    expect(summary.arr.length).toBeLessThanOrEqual(6);

    // object should be capped to 10 keys + __more__
    const objKeys = Object.keys(summary.obj);
    expect(objKeys.length).toBeLessThanOrEqual(11);
    expect('__more__' in summary.obj || objKeys.length <= 10).toBe(true);
  });
});