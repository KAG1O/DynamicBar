/* DynamicBar — the Ko-fi "Support Me" button.
   Ko-fi's script loads only after the page has finished, so it never slows the first paint. */
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
  if (document.readyState === "complete") setTimeout(load, 800);
  else addEventListener("load", () => setTimeout(load, 800));
})();
