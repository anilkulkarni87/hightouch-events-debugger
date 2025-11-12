// background.js — if you also update panel.js to match

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    htHosts: ['events.hightouch.com'],
    showNonEvents: false,
    htFilter: '',
    htRedact: false,
    showPreflight: false
  });
});