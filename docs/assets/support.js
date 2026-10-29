/* DynamicBar — the Ko-fi "Support Me" button.
   Ko-fi's script loads just after the page's HTML is ready, so it never delays the first paint. */
(() => {
  const load = () => {
    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
    script.async = true;
    script.onload = () => {
      if (!window.kofiWidgetOverlay) return;
      kofiWidgetOverlay.draw("kag1o", {
        "type": "floating-chat",
        "floating-chat.donateButton.text": "Support Me",
        "floating-chat.donateButton.background-color": "#00b9fe",
        "floating-chat.donateButton.text-color": "#fff",
      });
    };
    document.head.append(script);
  };
  // Right after the page's own HTML is ready, not after every video and image has loaded.
  const start = () => setTimeout(load, 200);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
})();
