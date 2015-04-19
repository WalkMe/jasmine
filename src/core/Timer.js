getJasmineRequireObj().Timer = function() {

  var defaultNow = (function(Date) {
    if (window.performance && window.performance.now) {
      return function() { return window.performance.now(); };
    } else {
      return function() { return new Date().getTime(); };
    }
  })(Date);

  function Timer(options) {
    options = options || {};

    var now = options.now || defaultNow,
      startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };

    this.now = now;
  }

  return Timer;
};
