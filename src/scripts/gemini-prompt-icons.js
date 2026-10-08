// Decorative icons only; labels and questions remain in the locale files.
const paths={
about:'<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
automation:'<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h5a4 4 0 0 1 4 4v5m-4-3 4 3 3-3"/>',
knowledge:'<path d="M3 4h7a2 2 0 0 1 2 2v15a4 4 0 0 0-4-2H3zm18 0h-7a2 2 0 0 0-2 2v15a4 4 0 0 1 4-2h5z"/><path d="M6 8h3m6 0h3"/>',
learning:'<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3m-12-5 2 4 2-4m-4 2h4"/>',
website:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.1M10 6.5h.1M7 13h5m-5 3h9"/>',
interview:'<path d="M3 4h13v9H8l-4 3v-3H3zm8 9v5h5l4 3v-3h1V9h-5"/>',
reader:'<path d="M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3zm0 14a3 3 0 0 1 3-3h13M8 7h7m-7 3h5"/>',
wiki:'<path d="M3 4h7a2 2 0 0 1 2 2v15a4 4 0 0 0-4-2H3zm18 0h-7a2 2 0 0 0-2 2v15a4 4 0 0 1 4-2h5z"/>',
kuse:'<path d="m2 8 10-5 10 5-10 5zm4 3v6c4 3 8 3 12 0v-6m4-3v8"/>',
novel:'<path d="M12 3v6m0 0H5v8m7-8h7v8"/><circle cx="12" cy="3" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
agents:'<rect x="9" y="2" width="6" height="6" rx="2"/><rect x="2" y="16" width="6" height="6" rx="2"/><rect x="16" y="16" width="6" height="6" rx="2"/><path d="M12 8v4H5v4m7-4h7v4"/>',
search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M3 10h14M10 3c-4 4-4 10 0 14m0-14c4 4 4 10 0 14"/>',
forms:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h4"/>',
classification:'<path d="m3 3 9 0 9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1"/><path d="m11 13 2 2 4-4"/>',
music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
enterprise:'<path d="M4 21V3h10v18m0-13h6v13M2 21h20M7 7h4m-4 4h4m-4 4h4m5-3h2m-2 4h2"/>',
documents:'<path d="M14 2H5v20h14V7zm0 0v5h5M8 11h8m-8 4 2 2 5-5"/>',
};
const colors = { automation: '#b487ab', knowledge: '#829aca', learning: '#85a898', website: '#ba927d' };
export function promptIcon(topic) {
  const key = Object.hasOwn(paths, topic) ? topic : 'knowledge';
  const color = colors[key] || '#9476af';
  return `<span class="gemini-prompt-icon" style="color:${color}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[key]}</svg></span>`;
}
