getJasmineRequireObj().scopeTester = function() {
	testScopeContamination.ScopeMonitor = ScopeMonitor;
	return testScopeContamination;

	function testScopeContamination(itFunc, options){

		options = options || {};

		options = JSON.parse(JSON.stringify(options));

		if(options.noScopeTest) {
			return itFunc;
		}

		// Shaul - 24/8/2014 - Fix for async tests, Jasmine expects a function with at least one argument 
		// for an async test and zero arguments for a sync test
		if (itFunc.length > 0) {
			return innerIsScopeContaminatedAsync;
		} else {
			// sync func
			return innerIsScopeContaminated;
		}

		function innerIsScopeContaminated() {
			var monitor = takeWindowSnapshot();
			itFunc.apply(this,arguments);
			checkWindowDifference(monitor);
		}

		function innerIsScopeContaminatedAsync(doneCallback) {
			var monitor = takeWindowSnapshot();
			var callback = doneCallback;
			arguments[0] = function done() {
				checkWindowDifference(monitor);
				callback();
			};
			itFunc.apply(this,arguments);
		}

		function takeWindowSnapshot() {
			var monitor = new ScopeMonitor(window);
			var ignoredVars = options.ignoreVars || [];
			var ignoredFunc = options.ignorePred || function(){return false;};
				
			monitor.addIgnoreWords(ignoredVars);
			monitor.addIgnorePredicate(ignoredFunc);
			monitor.snapshot(window);
			return monitor;
		}

	}

	function checkWindowDifference(monitor) {
		var diff = monitor.difference();
		
		if(diff.count > 0) {//Found vars on the scope
			var foundVars = foundVarsToStr(diff.valueMap);
			console.error('The scope was contaminated by : ' + foundVars);
			expect("scope").toBe("NOT contaminated");
		}		
	}

	function foundVarsToStr(valueMap) {
		
		var valueMapStr = '{';
		for (var key in valueMap) {
			valueMapStr += key + ' : ' + valueMap[key] + ', ';
		}
		
		// Removes last ', '
		if(valueMapStr.length > 1) {
			valueMapStr = valueMapStr.substring(0, valueMapStr.length - 2);
		}
		
		valueMapStr += '}';

		return valueMapStr;
	}

	function Set()
	{
		var _this = this;
		
		function ctor(list)
		{
			var uniqueList = removeDuplicates(list);
			// Clone the data
			_this.data = JSON.parse(JSON.stringify(uniqueList));
		}	
		
		function removeDuplicates(list)
		{
			var uniqueList = [];
			for(var i = 0; i < list.length; i++)
			{
				var value = list[i];
				if (!listcontains(uniqueList, value))
				{
					uniqueList.push(value);
				}
			}
			
			return uniqueList;
		}
		
		this.add = function add(obj)
		{
			if (!listcontains(_this.data, obj))
			{
				_this.data.push(obj);
			}
		};
		
		this.difference = function difference(other)	
		{
			var list = [];
			for(var i = 0; i < _this.data.length; i++)
			{
				var value = _this.data[i];
				if (!listcontains(other.data, value))
				{
					list.push(value);
				}
			}
			
			return new Set(list);
		};
		
	    this.filter = function filter(pred)
	    {
	        var filtered = [];
	        
	        for(var i = 0; i < _this.data.length; i++)
			{
	            var item = _this.data[i];
	            if (pred(item))
	            {
	                filtered.push(item);
	            }
	        }
	        
	        return new Set(filtered);
	    };
	    
		function listcontains(list, value)
		{
			for(var i = 0; i < list.length; i++)
			{
				if (value === list[i])
				{
					return true;
				}
			}
			return false;
		}
	      
		
		ctor.apply(null, arguments);
	}


	function ScopeMonitor()
	{
		var _this = this;
		
		function ctor(scope)
		{
			_this._scope = scope;
			_this._snapshot = null;	
	        _this.ignorePred = null;
			_this._ignoreSet = new Set([]);
		}
		
		_this.addIgnoreWords = function addIgnoreWords(names)
		{
			for(var i = 0; i < names.length; i++)	
			{
				_this._ignoreSet.add(names[i]);
			}
		};

	    _this.addIgnorePredicate = function addIgnorePredicate(pred)
		{
	        _this.ignorePred = pred;
		};
	    
		
		_this.snapshot = function snapshot()
		{
			_this._snapshot = inspectScope(_this._scope);
		};
		
		_this.difference = function difference()
		{
			var currentState = inspectScope(_this._scope);
			var diffNoIgnore = currentState.difference(_this._snapshot);
			var diffWithIgnore = diffNoIgnore.difference(_this._ignoreSet);
	        
	        if(_this.ignorePred)
	            diffWithIgnore = diffWithIgnore.filter(function(x) {return !_this.ignorePred(x);});
	        
			var valueMap = mapValues(diffWithIgnore);
			return {count : diffWithIgnore.data.length, valueMap: valueMap};
		};
		
		function mapValues(nameSet)
		{
			var result = {};
			for (var i = 0; i < nameSet.data.length; i++)
			{			
				var name = nameSet.data[i];
				var value = _this._scope[name];
				result[name] = value;
			}
			
			return result;
		}
		
		function inspectScope(scope)
		{
			var set = new Set([]);
			for (var prop in scope)
			{
				set.add(prop);
			}
			return set;
		}
		
		ctor.apply(null, arguments);
	}
};