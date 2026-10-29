# DynamicBarKit 2

DynamicBar add-ons are small JavaScript programs that draw pages in the open island and show short
events beside the closed one. An add-on is a folder with `manifest.json` and a script (`main.js`);
zip the folder as `.dbaddon` to share it. The script runs in JavaScriptCore, so there is no DOM,
no `require`, no `import`: only plain JavaScript (ES2020), the browser-style globals `console`,
`setTimeout`, `setInterval` and `fetch`, and the `DynamicBarKit` object.

## manifest.json
```json
{
  "id": "dev.local.hello",
  "name": "Hello",
  "version": "1.0.0",
  "author": "You",
  "description": "Says hello from the island.",
  "symbol": "sparkles",
  "main": "main.js",
  "permissions": ["network"],
  "height": 172,
  "kit": 2,
  "settings": [
    { "key": "greeting", "title": "Greeting", "type": "text", "default": "Hello" },
    { "key": "loud", "title": "Loud", "type": "toggle", "default": false },
    { "key": "size", "title": "Size", "type": "number", "default": 28, "min": 16, "max": 44, "step": 2 },
    { "key": "tone", "title": "Tone", "type": "choice", "options": ["Warm", "Cool"], "default": "Warm" }
  ]
}
```
Required: `id` (lowercase letters, digits, dots, dashes), `name`, `version`. Optional: `author`,
`description`, `symbol` (SF Symbol), `main`, `height` (172–320), `width` (378–600), `kit`, `permissions`, `settings`.

### Permissions
- `network` — Fetch web addresses (public hosts only).
- `openURL` — Open web links in your browser when you tap one of its buttons.
- `media` — See what is playing and control playback.
- `clipboard` — Read and write the clipboard when you tap one of its buttons.
- `island` — Open and close the island by itself.

### Settings
Each setting becomes a control in the add-on's row in Settings ▸ Developer. Read it with
`DynamicBarKit.settings.get(key)`. Types:
- `toggle` — a switch; value true/false
- `choice` — a menu; options [strings], value is the chosen one
- `number` — a slider; min, max, step
- `text` — a text field

## main.js
```js
const kit = DynamicBarKit;

function render() {
  const size = kit.settings.get("size");
  kit.page({
    type: "vstack", spacing: 8, children: [
      { type: "text", text: kit.settings.get("greeting"), size, weight: "bold" },
      { type: "button", title: "Ping", symbol: "bell.fill", action: "ping" }
    ]
  });
}

kit.onAction((action, value) => kit.flash({ symbol: "bell.fill", text: action }));
kit.onSettings(render);
render();
```

## Layout
- The open island is 378 pt wide and 172 pt tall. Ask for more room with `DynamicBarKit.page(tree, { height: 240, width: 480 })`: height from 172 to 320, width from 378 to 600. Or set `"height"` and `"width"` in manifest.json. The island grows from the notch: wider to both sides, taller downwards. Each page can have its own size and the island glides between them.
- Your page is laid out inside a safe area: 32 pt in from each side, 36 pt down from the top edge (below the notch) and 26 pt up from the bottom (above the page dots). That leaves (width − 64) × (height − 62) pt: 314 × 110 at the default size. `DynamicBarKit.island.safeArea(height, width)` returns the real numbers for this Mac.
- The safe area is added for you. Never pad the top yourself and never place anything in the notch: the cutout is about 190 × 32 pt at the top centre, and the glass there is black. Anything outside the safe area is clipped.
- The root node is centred in the safe area. Use a vstack or hstack as the root; put a spacer between children to push the first up and the last down. Put long content in a `scroll`.
- Budget the height. A text of size 40 is about 48 pt tall, size 28 about 34, size 13 about 16. A button is about 30 pt, a progress bar 5, a ring as tall as its size, a divider 1. Stacks add `spacing` (8) between children. If the total passes the safe height the console warns you: “the bottom is cut off”.
- Text sits on dark glass: white by default, opacity 0.55 for secondary lines. Keep it at 11 pt or more and at most two lines; use one accent colour and one primary button.
- A flash or an activity (closed island) puts a symbol right of the notch and up to 8 characters left of it. Each wing is about 50 pt wide; keep it short and glanceable. An activity stays until you pass null; a flash goes after a few seconds.
- Scripts run on the main thread: no long loops (a script that holds it for 2 seconds is stopped), no waiting. Use timers or promises, and update a page at most once a second unless a number is animating. Pause work in `onClose` and resume in `onOpen`.
- Links, the clipboard and `island.open()` are for people, not for scripts: openURL and the clipboard only work while a tap is being handled, and the island opens at most once every 5 seconds.

## API
- `DynamicBarKit.page(tree, { id, height })` — Shows a page in the open island; call again to update. Give pages different ids for several pages (6 at most). height 172–320 makes the island taller, width 378–600 wider. Trees are limited to 64 KB and 300 nodes.
- `DynamicBarKit.removePage(id)` — Takes a page away.
- `DynamicBarKit.flash({ symbol, text, tint, seconds })` — A short event beside the notch while the island is closed (1–10 s, text up to 8 characters).
- `DynamicBarKit.activity({ symbol, text, tint }) · activity(null)` — Something that stays beside the notch until you clear it: a timer, a score, a percentage.
- `DynamicBarKit.onAction((action, value) => …)` — A button was tapped (value is its data), a toggle flipped (true/false) or a slider moved (number).
- `DynamicBarKit.onOpen(fn) · onClose(fn)` — The island opened or closed. Pause work while it is closed.
- `DynamicBarKit.settings.get(key) · onSettings((key, value) => …)` — Reads what the person chose in the add-on's row in Settings; the callback fires when they change it.
- `DynamicBarKit.storage.get / set / remove` — Keeps JSON values between launches (256 KB).
- `setTimeout · setInterval · clearTimeout · clearInterval` — As in the browser. DynamicBarKit.every / after / cancel do the same (32 timers at most).
- `fetch(url) · DynamicBarKit.http.get(url, cb)` — GET only, 1 MB, public hosts, 4 at once and 60 a minute. fetch returns a promise with text() and json(). Needs “network”.
- `DynamicBarKit.system.battery() · cpu() · memory()` — { level, charging, plugged } · 0…1 · { used, total, fraction }
- `DynamicBarKit.media.nowPlaying() · playPause() · next() · previous() · onChange(fn)` — What is playing ({ title, artist, playing, duration, position }) and its controls. Needs “media”.
- `DynamicBarKit.openURL(url)` — Opens an http(s) link in the browser, only while handling a tap. Needs “openURL”.
- `DynamicBarKit.clipboard.read() · write(text)` — Only while handling a tap. Needs “clipboard”.
- `DynamicBarKit.island.safeArea(height, width) · notch · isOpen · open(pageId) · close()` — Measurements for your layout, and the island's state. open and close need “island” and are limited to once every 5 s.
- `DynamicBarKit.haptic()` — A tap on the Force Touch trackpad.

## Page nodes
Every node has a `type`.
- `vstack · hstack · zstack` — children, spacing, align (leading, center, trailing)
- `scroll` — children in a vertical scroll view; use it when a page is taller than its safe area
- `grid` — children in columns (default 3), spacing
- `text` — text, size (13), weight, color, opacity, mono, lines (2), align
- `symbol` — symbol (an SF Symbol name), size, weight, color
- `image` — src (a png, jpg or pdf inside your folder, 2 MB), width, height, radius
- `progress` — a bar: value 0…1, color
- `ring` — a circle: value 0…1, size (64), color, text in the middle
- `spark` — a line chart: values [numbers], color, height (28)
- `button` — title and/or symbol, action, data (sent as the value), color
- `toggle` — title, on, action; the action gets true or false
- `slider` — value, min (0), max (1), action; the action gets the number
- `spacer · divider` — space that grows; a thin line
- `any node` — padding, width, height, background, radius, border, opacity (colors: white, red, orange, yellow, green, teal, blue, purple, pink, gray or #RRGGBB)

## Tips for writing one
- Redraw by calling `DynamicBarKit.page` again with the whole tree; identical trees cost nothing.
- Keep state in variables; keep what must survive a restart in `DynamicBarKit.storage`.
- Everything shows in the console (Settings ▸ Developer): `console.log`, errors with line numbers, layout warnings.
- With Live reload on, saving `main.js` restarts the add-on.