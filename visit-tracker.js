(function () {
  var endpoint =
    "https://injaelee-visit-log.injaelee.workers.dev/collect.gif";
  var referrer = "";

  if (document.referrer) {
    try {
      referrer = new URL(document.referrer).origin;
    } catch (_error) {
      referrer = "";
    }
  }

  var params = new URLSearchParams({
    path: window.location.pathname,
    referrer: referrer,
  });
  var pixel = new Image();

  pixel.referrerPolicy = "strict-origin";
  pixel.src = endpoint + "?" + params.toString();
  window.__ownerVisitPixel = pixel;
})();
