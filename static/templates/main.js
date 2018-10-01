var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-15609829-1']);
_gaq.push(['_addDevId', 'i9k95']); // Google Analyticator App ID with Google
_gaq.push(['_gat._anonymizeIp']);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

window.MathJax = {
  showProcessingMessages: false,
  rmessageStyle: "none",
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    processEscapes: true
  },
  "fast-preview": {
    disabled: true
  },
  SVG: {
    linebreaks: {automatic: true, width: "80% container"}
  },
  "HTML-CSS": {
    linebreaks: {automatic: true, width: "80% container"}
  },
  CommonHTML: {
    linebreaks: {automatic: true, width: "80% container"}
  }
};
var followHash = function () {
  var anchor = document.querySelector('a[href="' + location.hash + '"]');
  var permissibleTargets = [
    "#demo",
    "#a11y",
    "#samples",
    "#ams-stub",
    "#siam-stub",
    "#stackoverflow-stub",
    "#ieee-stub",
    "#elsevier-stub",
    "#sponsorship-program",
    "#gettingstarted",
    "#apis",
    "#browsers",
    "#to-demo",
    "#to-a11y",
    "#to-samples",
    "#to-ams-stub",
    "#to-siam-stub",
    "#to-stackoverflow-stub",
    "#to-ieee-stub",
    "#to-elsevier-stub",
    "#to-sponsorship-program",
    "#to-gettingstarted",
    "#to-apis",
    "#to-browsers"
  ];
  // console.log(permissibleTargets.indexOf(location.hash));
  if (anchor && permissibleTargets.indexOf(location.hash) > -1) {
    anchor.click();
    // scroll a little to offset fade-out
    // HACK Firefox requires small timeout; not sure why
    setTimeout(function () {
      var h = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );
      var offset = h / 3;
      // console.log(offset);
      var target =
        document.getElementById(location.hash.slice(1)) ||
        document.getElementById("art");
      document.body.scrollTop += -offset;
      document.documentElement.scrollTop += -offset;
    }, 1);
  }
};
window.onhashchange = followHash;
// var script = document.createElement('script');
// script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML-full';
// document.head.appendChild(script);

