getJasmineRequireObj().passParameters = function() {
	return passParameters;

	function passParameters(spec, options) {
		options = options || {};
		var paramNames = ['noPerformanceTest'];
		for (var i = 0; i < paramNames.length; i++) {
			var name = paramNames[i];
			spec.result[name] = options[name];
		}
		return spec;
	}
};