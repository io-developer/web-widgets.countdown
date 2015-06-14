/**
 * Configurable countdown widget
 * Not requires jQuery!
 * @author Sergey Sedyshev
 * @see find more on github https://github.com/io-developer
 */

var iodev;

(function() {
	if (iodev && iodev.widgets && iodev.widgets.countdown) {
		return;
	}
	
	
	//-----------------------------------------
	//  BASE OPTIONS
	//-----------------------------------------
	
	/**
	 * @class
	 */
	function CountdownClassSet() {
		this.main = "countdown";
		this.separator = "countdown__separator";
		this.separatorContent = "countdown__separator-content";
		this.group = "countdown__group";
		this.group_hidden = "countdown__group_hidden";
		this.group_weeks = "countdown__group_weeks";
		this.group_days = "countdown__group_days";
		this.group_hours = "countdown__group_hours";
		this.group_minutes = "countdown__group_minutes";
		this.group_seconds = "countdown__group_seconds";
		this.group_radix_ = "countdown__group_radix_";
		this.groupRadix = "countdown__group-radix";
		this.groupLabel = "countdown__group-label";
		this.digit = "countdown__digit";
		this.digit_hidden = "countdown__digit_hidden";
		this.digitUnit = "countdown__digit-unit";
		this.digitUnit_ = "countdown__digit-unit_";
		this.digitUnit_hide = "countdown__digit-unit_hide";
		this.digitUnit_hidden = "countdown__digit-unit_hidden";
		this.digitUnitContent = "countdown__digit-unit-content";
		this.digitUnitContent_ = "countdown__digit-unit-content_";
	};
	
	
	/**
	 * @consts
	 */
	var CountdownAttributes = {
		FORMAT: "data-format"
		, FORMAT_RADIX: "data-format-radix"
		, TARGET_TIME: "data-target-time"
		, TARGET_TIME_USE_UTC: "data-target-time-use-utc"
		, LABELS_ENABLED: "data-labels-enabled"
		, LABELS_LANG: "data-labels-lang"
	};
	
	
	/**
	 * @consts
	 */
	var CountdownLangs = {
		EN: "en"
		, RU: "ru"
	};
	
	
	
	//-----------------------------------------
	//  MAIN OBJECT AND DOM NODES
	//-----------------------------------------
	
	/**
	 * @class
	 */
	function Countdown( elem ) {
		var that = this;
		
		/** @type {HTMLElement} */
		var _elem = elem;
		
		/** @type {CountdownModel} */
		var _model = new CountdownModel();
		
		/** @type {CountdownLabelProvider} */
		var _labelProvider = new CountdownLabelProviderRU();
		
		/** @type {Object<string, Arrsy>} */
		var _groupNodesByType = {};
		
		/**
		 * @returns {HTMLElement}
		 */
		this.getElement = function() {
			return _elem;
		};
		
		/**
		 * @returns {CountdownModel}
		 */
		this.getModel = function() {
			return _model;
		};
		
		/**
		 * @returns {CountdownLabelProvider}
		 */
		this.getLabelProvider = function() {
			return _labelProvider;
		};
		
		/**
		 * @param {CountdownLabelProvider} prov
		 */
		this.setLabelProvider = function( prov ) {
			_labelProvider = prov;
		};
		
		/**
		 * @param {CountdownGroupNode} node
		 */
		this.appendGroupNode = function( node ) {
			if (_elem != node.elem.parentNode) {
				_elem.appendChild(node.elem);
			}
			var nodes = _groupNodesByType[node.type];
			if (!nodes) {
				nodes = _groupNodesByType[node.type] = [];
			}
			nodes.push(node);
		};
		
		/**
		 * 
		 */
		this.update = function() {
			_model.update();
			
			_onWeeksUpdate();
			_onDaysUpdate();
			_onHoursUpdate();
			_onHoursUpdate();
			_onMinutesUpdate();
			_onMinutesUpdate();
		};
		
		/**
		 * @param {CountdownTypes|String} type
		 * @returns {undefined}
		 */
		function _updateGroupNodesByType( type ) {
			var groupNodes = _groupNodesByType[type];
			if (groupNodes) {
				var i = groupNodes.length;
				while (i-- > 0) {
					/** @type {CountdownGroupNode} */
					var groupNode = groupNodes[i];
					var fullNum = _model.getValueByType(type);
					var num = _model.getValueByType(type, groupNode.modifier);
					var label = _labelProvider.labelForType(type, num);
					groupNode.setNumber(num, fullNum);
					groupNode.setLabelContent(label);
				}
			}
		}
		
		function _onWeeksUpdate() {
			_updateGroupNodesByType(CountdownTypes.WEEKS);
		}
		
		function _onDaysUpdate() {
			_updateGroupNodesByType(CountdownTypes.DAYS);
		}
		
		function _onHoursUpdate() {
			_updateGroupNodesByType(CountdownTypes.HOURS);
		}
		
		function _onMinutesUpdate() {
			_updateGroupNodesByType(CountdownTypes.MINUTES);
		}
		
		function _onSecondsUpdate() {
			_updateGroupNodesByType(CountdownTypes.SECONDS);
		}
		
		
		_elem.countdownObject = this;
		
		_model.onWeeksUpdate = _onWeeksUpdate;
		_model.onDaysUpdate = _onDaysUpdate;
		_model.onHoursUpdate = _onHoursUpdate;
		_model.onMinutesUpdate = _onMinutesUpdate;
		_model.onSecondsUpdate = _onSecondsUpdate;
	};
	
	
	/**
	 * @class
	 */
	function CountdownGroupNode( classSet ) {
		var that = this;
		
		/** @type {CountdownClassSet} */
		var _cl = classSet;
		
		/** @type {HTMLElement} */
		this.elem = null;
		
		/** @type {HTMLElement} */
		this.radixElem = null;
		
		/** @type {HTMLElement} */
		this.labelElem = null;
		
		/** @type {CountdownDigitNode[]} */
		this.digitNodes = [];
		
		/** @type {String} */
		this.type = CountdownTypes.SECONDS;
		
		/** @type {String} */
		this.modifier = CountdownModifiers.UNRESOLVED;
		
		/** @type {Number} */
		this.radix = 10;
		
		/**
		 * @param {Number} num
		 * @param {Number} fullNum
		 */
		this.setNumber = function( num, fullNum ) {
			var canHide = true;
			var numDigits = that.digitNodes.length;
			var digits = _numberToDigits(num, numDigits, that.radix);
			var i = -1;
			while (++i < numDigits) {
				var digit = digits[numDigits - i - 1];
				
				/** @type {CountdownDigitNode} */
				var digitNode = this.digitNodes[i];
				digitNode.showUnit(digit);
				
				if ((i == (numDigits - 1)) && fullNum > 0) {
					canHide = false;
				}
				
				if (digit == 0 && canHide && digitNode.autohideEnabled) {
					elemAddClass(digitNode.elem, _cl.digit_hidden);
				} else {
					canHide = false;
					elemRemoveClass(digitNode.elem, _cl.digit_hidden);
				}
			}
			
			if (canHide) {
				elemAddClass(that.elem, _cl.group_hidden);
			} else {
				elemRemoveClass(that.elem, _cl.group_hidden);
			}
		};
		
		/**
		 * @param {String} str
		 */
		this.setLabelContent = function( str ) {
			if (that.labelElem) {
				that.labelElem.innerHTML = str;
			}
		};
		
		/**
		 * @param {Number} num
		 * @param {Number} numDigits
		 * @param {Number} radix
		 * @returns {Number[]}
		 */
		function _numberToDigits( num, numDigits, radix ) {
			numDigits = numDigits || 4;
			radix = radix || 10;
			radix = radix < 0 ? 0 : radix;
			radix = radix > 36 ? 36 : radix;
			var s = "000000000000000000000000000000" + Number(num).toString(radix);
			
			var arr = [];
			var i = -1;
			while (++i < numDigits) {
				var digit = (i > 0) ? s.slice(-i - 1, -i) : s.slice(-1);
				arr.push(parseInt(digit, radix));
			}
			return arr;
		};
	}
	
	
	/**
	 * @class
	 */
	function CountdownDigitNode( classSet ) {
		var that = this;
		
		/** @type {CountdownClassSet} */
		var _cl = classSet;
		var _currentIndex = -1;
		
		/** @type {Boolean} */
		this.autohideEnabled = false;
		
		/** @type {HTMLElement} */
		this.elem = null;
		
		/** @type {HTMLElement[]} */
		this.unitElems = [];
		
		/**
		 * @param {Number} index
		 */
		this.showUnit = function( index ) {
			var elem = that.unitElems[index];
			if (!elem || index == _currentIndex) {
				return;
			}
			var prevElem = that.unitElems[_currentIndex];
			if (prevElem) {
				elemAddClass(prevElem, _cl.digitUnit_hide);
				setTimeout(function() {
					elemAddClass(prevElem, _cl.digitUnit_hidden);
				}, 3000);
			}
			elemRemoveClass(elem, _cl.digitUnit_hide);
			elemRemoveClass(elem, _cl.digitUnit_hidden);
			_currentIndex = index;
		};
	}
	
	
	//-----------------------------------------
	//  DOM BUILDING
	//-----------------------------------------
	
	/**
	 * @class
	 */
	function CountdownDom( classSet ) {
		var that = this;
		
		/** @type {CountdownClassSet} */
		var _classSet = classSet;
		
		/** @type {CountdownBuilder} */
		var _builder = new CountdownBuilder();
		
		/**
		 * @return {CountdownClassSet}
		 */
		this.getClassSet = function() {
			return _classSet;
		};
		
		/**
		 * @param {CountdownClassSet} classSet
		 */
		this.setClassSet = function( classSet ) {
			_classSet = classSet;
		};
		
		/**
		 * 
		 */
		this.initAll = function() {
			elems = document.querySelectorAll("." + _classSet.main);
			var i = -1;
			var l = elems.length;
			while (++i < l) {
				var elem = elems[i];
				if (!elem.countdownObject) {
					_builder.build(elem, _classSet);
				}
			}
		};
		
		
		document.addEventListener("DOMContentLoaded", that.initAll);
	};
	
	
	/**
	 * @class
	 */
	function CountdownBuilder() {
		var that = this;
		
		/** @type {CountdownFormatParser} */
		var _formatParser = new CountdownFormatParser();
		
		/**
		 * @param {HTMLElement} elem
		 * @param {CountdownClassSet} classSet
		 * @returns {Countdown}
		 */
		this.build = function( elem, classSet ) {
			var obj = null;
			try {
				obj = _build(elem, classSet);
			} catch (err) {
				console.log("Catched exception in CountdownBuilder.build()");
				console.info(err);
			}
			return obj;
		};		
		
		/**
		 * @param {HTMLElement} elem
		 * @param {CountdownClassSet} classSet
		 * @returns {Countdown}
		 */
		function _build( elem, classSet ) {
			elem.innerHTML = "";
			
			var obj = new Countdown(elem);
			
			var targetTime = parseInt(elem.getAttribute(CountdownAttributes.TARGET_TIME));
			targetTime = targetTime || ((new Date()).getTime() + 7 * 24 * 3600 * 1000 + 5000);
			
			var targetTimeUseUtc = _parseBool(elem.getAttribute(CountdownAttributes.TARGET_TIME_USE_UTC));
			
			var format = elem.getAttribute(CountdownAttributes.FORMAT) || iodev.widgets.countdown.defaultFormat;
			var labelsEnabled = _parseBool(elem.getAttribute(CountdownAttributes.LABELS_ENABLED));
			var labelLangProvider = _resolveLangProvider(elem.getAttribute(CountdownAttributes.LABELS_LANG));
			
			var radix = elem.getAttribute(CountdownAttributes.FORMAT_RADIX);
			radix = radix ? parseInt(radix) : 10;
			radix = radix < 2 ? 2 : radix;
			radix = radix > 36 ? 36 : radix;
			
			var groups = _formatParser.parseToDigitGroups(format);
			_createAndAppendNodesTo(obj, classSet, groups, labelsEnabled, radix);
			
			obj.getModel().setTargetTime(targetTime);
			obj.getModel().setUseUtc(targetTimeUseUtc);
			obj.setLabelProvider(labelLangProvider);
			obj.update();
			
			return obj;
		};	
		
		/**
		 * @param {Countdown} obj
		 * @param {CountdownClassSet} cl
		 * @param {CountdownFormatGroup[]} groups
		 * @param {Boolean} labelsEnabled
		 * @param {Number} radix
		 */
		function _createAndAppendNodesTo( obj, cl, groups, labelsEnabled, radix ) {
			var elem = obj.getElement();
			var i = -1;
			var l = groups.length;
			while (++i < l) {
				/** @type {CountdownFormatGroup} */
				var group = groups[i];
				var groupNode = _createGroupNode(cl, group, labelsEnabled, radix);
				obj.appendGroupNode(groupNode);
				elem.appendChild(_createSeparator(cl, group.separatorText));
			}
		}
		
		/**
		 * @param {CountdownClassSet} cl
		 * @param {CountdownFormatGroup} group
		 * @param {Boolean} labelsEnabled
		 * @param {Number} radix
		 * @returns {CountdownGroupNode}
		 */
		function _createGroupNode( cl, group, labelsEnabled, radix ) {
			var groupNode = new CountdownGroupNode(cl);
			groupNode.type = group.type;
			groupNode.modifier = group.modifier;
			groupNode.radix = radix;
			groupNode.elem = elemCreate(''
				+ '<div'
				+	' class="' + cl.group
				+		' ' + _resolveGroupClassByType(cl, group.type)
				+		' ' + cl.group_radix_ + radix + '"'
				+ '></div>');
			
			var i = -1;
			var l = group.digits.length;
			while (++i < l) {
				var digitNode = _createDigitNode(cl, group.digits[i], radix);
				groupNode.digitNodes.push(digitNode);
				groupNode.elem.appendChild(digitNode.elem);
			}
			
			groupNode.radixElem = elemCreateIn(groupNode.elem, ''
				+ '<div'
				+	' class="' + cl.groupRadix + '"'
				+ '></div>');
			
			if (labelsEnabled) {
				groupNode.labelElem = elemCreateIn(groupNode.elem, ''
					+ '<div'
					+	' class="' + cl.groupLabel + '"'
					+ '></div>');
			}
			
			return groupNode;
		}
		
		/**
		 * @param {CountdownClassSet} cl
		 * @param {String} content
		 * @returns {HTMLElement}
		 */
		function _createSeparator( cl, content ) {
			return elemCreate(''
				+ '<div class="' + cl.separator + '">'
				+	'<div class="' + cl.separatorContent + '">'
				+		content.replace(/^\s+|\s+$/gi, "")
				+	'</div>'
				+ '</div>');
		}
		
		/**
		 * @param {CountdownClassSet} cl
		 * @param {CountdownFormatDigit} formatDigit
		 * @param {Number} radix
		 * @returns {CountdownDigitNode}
		 */
		function _createDigitNode( cl, formatDigit, radix ) {
			var digitNode = new CountdownDigitNode(cl);
			digitNode.autohideEnabled = !formatDigit.isPermanent;
			digitNode.elem = elemCreate(''
				+ '<div class="' + cl.digit + '"></div>');
			
			var i = -1;
			while (++i < radix) {
				var unitElem = elemCreateIn(digitNode.elem, ''
					+ '<div class="' + cl.digitUnit
					+		' ' + cl.digitUnit_ + i
					+		' ' + cl.digitUnit_hide
					+		' ' + cl.digitUnit_hidden + '"'
					+ '>'
					+	'<div class="' + cl.digitUnitContent
					+			' ' + cl.digitUnitContent_ + i + '"'
					+	'></div>'
					+ '</div>');
				
				digitNode.unitElems.push(unitElem);
			}
			
			return digitNode;
		}
		
		/**
		 * @param {CountdownClassSet} cl
		 * @param {String} type
		 * @returns {String}
		 */
		function _resolveGroupClassByType( cl, type ) {
			var hash = {};
			hash[CountdownTypes.WEEKS] = cl.group_weeks;
			hash[CountdownTypes.DAYS] = cl.group_days;
			hash[CountdownTypes.HOURS] = cl.group_hours;
			hash[CountdownTypes.MINUTES] = cl.group_minutes;
			hash[CountdownTypes.SECONDS] = cl.group_seconds;
			return hash[type] || "";
		}
		
		/**
		 * @param {String} s
		 * @returns {CountdownLabelProvider}
		 */
		function _resolveLangProvider( s ) {
			s = s ? s.toLowerCase() : "";
			if (s === CountdownLangs.RU) {
				return new CountdownLabelProviderRU();
			}
			return new CountdownLabelProviderEN();
		}
		
		/**
		 * @param {String} s
		 * @returns {Boolean}
		 */
		function _parseBool( s ) {
			s = ("" + s).toLowerCase();
			if (s == "false" || s == "off" || s == "null" || s == "undefined") {
				return false;
			}
			return s ? true : false;
		}
	};
	
	
	//-----------------------------------------
	//  MODEL
	//-----------------------------------------
	
	/**
	 * @class
	 */
	function CountdownModel() {
		var that = this;
		
		var _updateInterval = 100;
		var _updateIntervalId = 0;
		
		var _targetTime = (new Date()).getTime();
		var _useUtc = false;
		
		var _weeks = -1;
		
		var _days = -1;
		var _daysWeeked = -1;
		
		var _hours = -1;
		var _hoursDayed = -1;
		var _hoursWeeked = -1;
		
		var _minutes = -1;
		var _minutesHoured = -1;
		var _minutesDayed = -1;
		var _minutesWeeked = -1;
		
		var _seconds = -1;
		var _secondsMinuted = -1;
		var _secondsHoured = -1;
		var _secondsDayed = -1;
		var _secondsWeeked = -1;
		
		
		/** @type {Function} */
		this.onWeeksUpdate = null;
		
		/** @type {Function} */
		this.onDaysUpdate = null;
		
		/** @type {Function} */
		this.onHoursUpdate = null;
		
		/** @type {Function} */
		this.onMinutesUpdate = null;
		
		/** @type {Function} */
		this.onSecondsUpdate = null;
		
		
		/**
		 * @returns {Number}
		 */
		this.getUpdateInterval = function() {
			return _updateInterval;
		};
		
		/**
		 * @param {Number} milliseconds
		 */
		this.setUpdateInterval = function( milliseconds ) {
			_updateInterval = milliseconds;
		};
		
		/**
		 * @returns {Number}
		 */
		this.getTargetTime = function() {
			return _targetTime;
		};
		
		/**
		 * @param {Number} time
		 */
		this.setTargetTime = function( time ) {
			_targetTime = time;
		};
		
		/**
		 * @returns {Boolean}
		 */
		this.getUseUtc = function() {
			return _useUtc;
		};
		
		/**
		 * @param {Boolean} useUtc
		 */
		this.setUseUtc = function( useUtc ) {
			_useUtc = useUtc;
		};
		
		
		/**
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getWeeks = function( modifier ) {
			var hash = {};
			hash[CountdownModifiers.FULL] = _weeks;
			return hash[modifier || CountdownModifiers.FULL];
		};
		
		/**
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getDays = function( modifier ) {
			var hash = {};
			hash[CountdownModifiers.FULL] = _days;
			hash[CountdownModifiers.WEEKED] = _daysWeeked;
			return hash[modifier || CountdownModifiers.FULL];
		};
		
		/**
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getHours = function( modifier ) {
			var hash = {};
			hash[CountdownModifiers.FULL] = _hours;
			hash[CountdownModifiers.WEEKED] = _hoursWeeked;
			hash[CountdownModifiers.DAYED] = _hoursDayed;
			return hash[modifier || CountdownModifiers.FULL];
		};
		
		/**
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getMinutes = function( modifier ) {
			var hash = {};
			hash[CountdownModifiers.FULL] = _minutes;
			hash[CountdownModifiers.WEEKED] = _minutesWeeked;
			hash[CountdownModifiers.DAYED] = _minutesDayed;
			hash[CountdownModifiers.HOURED] = _minutesHoured;
			return hash[modifier || CountdownModifiers.FULL];
		};
		
		/**
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getSeconds = function( modifier ) {
			var hash = {};
			hash[CountdownModifiers.FULL] = _seconds;
			hash[CountdownModifiers.WEEKED] = _secondsWeeked;
			hash[CountdownModifiers.DAYED] = _secondsDayed;
			hash[CountdownModifiers.HOURED] = _secondsHoured;
			hash[CountdownModifiers.MINUTED] = _secondsMinuted;
			return hash[modifier || CountdownModifiers.FULL];
		};
		
		/**
		 * @param {CountdownTypes|String} type
		 * @param {CountdownModifiers|String} modifier
		 * @returns {Number}
		 */
		this.getValueByType = function( type, modifier ) {
			var hash = {};
			hash[CountdownTypes.WEEKS] = that.getWeeks;
			hash[CountdownTypes.DAYS] = that.getDays;
			hash[CountdownTypes.HOURS] = that.getHours;
			hash[CountdownTypes.MINUTES] = that.getMinutes;
			hash[CountdownTypes.SECONDS] = that.getSeconds;
			
			var fn = hash[type || CountdownTypes.SECONDS];
			if (fn) {
				return fn(modifier);
			}
			return 0;
		};
		
		/**
		 *
		 */
		this.update = function() {
			_update();
		};
		
		/**
		 * 
		 */
		function _update() {
			clearTimeout(_updateIntervalId);
			_updateIntervalId = setTimeout(_update, _updateInterval);
			
			var prevWeeks = _weeks;
			var prevDays = _days;
			var prevHours = _hours;
			var prevMinutes = _minutes;
			var prevSeconds = _seconds;
			
			_updateValues();
			
			if (_weeks != prevWeeks && that.onWeeksUpdate) {
				that.onWeeksUpdate(that);
			}
			if (_days != prevDays && that.onDaysUpdate) {
				that.onDaysUpdate(that);
			}
			if (_hours != prevHours && that.onHoursUpdate) {
				that.onHoursUpdate(that);
			}
			if (_minutes != prevMinutes && that.onMinutesUpdate) {
				that.onMinutesUpdate(that);
			}
			if (_seconds != prevSeconds && that.onSecondsUpdate) {
				that.onSecondsUpdate(that);
			}
		}
		
		/**
		 * 
		 */
		function _updateValues() {
			var SECOND = 1000;
			var MINUTE = 60 * SECOND;
			var HOUR = 60 * MINUTE;
			var DAY = 24 * HOUR;
			var WEEK = 7 * DAY;
			
			var now = new Date();
			var nowTime = _useUtc ? now.getTime() - 60000 * now.getTimezoneOffset() : now.getTime();
			var deltaTime = _targetTime - nowTime;
			var r = (deltaTime > 0) ? deltaTime : 0;
			
			_weeks = Math.floor(r / WEEK);
			_days = Math.floor(r / DAY);
			_hours = Math.floor(r / HOUR);
			_minutes = Math.floor(r / MINUTE);
			_seconds = Math.floor(r / SECOND);
			r %= WEEK;

			_daysWeeked = Math.floor(r / DAY);
			_hoursWeeked = Math.floor(r / HOUR);
			_minutesWeeked = Math.floor(r / MINUTE);
			_secondsWeeked = Math.floor(r / SECOND);
			r %= DAY;

			_hoursDayed = Math.floor(r / HOUR);
			_minutesDayed = Math.floor(r / MINUTE);
			_secondsDayed = Math.floor(r / SECOND);
			r %= HOUR;

			_minutesHoured = Math.floor(r / MINUTE);
			_secondsHoured = Math.floor(r / SECOND);
			r %= MINUTE;
			
			_secondsMinuted = Math.floor(r / SECOND);
		}
	};
	
	
	/**
	 * @interface
	 */
	function CountdownLabelProvider() {
		/**
		 * @param {CountdownTypes|String} type
		 * @param {Number} num
		 * @returns {String}
		 */
		this.labelForType = function( type, num ) {};
	};
	
	
	/**
	 * @class
	 * @implements CountdownLabelProvider
	 */
	function CountdownLabelProviderEN() {
		var that = this;
		
		var _textDictionary = {};
		_textDictionary[CountdownTypes.WEEKS] = ["Week", "Weeks"];
		_textDictionary[CountdownTypes.DAYS] = ["Day", "Days"];
		_textDictionary[CountdownTypes.HOURS] = ["Hour", "Hours"];
		_textDictionary[CountdownTypes.MINUTES] = ["Minute", "Minutes"];
		_textDictionary[CountdownTypes.SECONDS] = ["Second", "Seconds"];
		
		/**
		 * @returns {Object}
		 */
		this.getTextDictionary = function() {
			return _textDictionary;
		};
		
		/**
		 * @param {Object} dict
		 */
		this.setTextDictionary = function( dict ) {
			_textDictionary = dict;
		};
		
		/**
		 * @param {CountdownTypes|String} type
		 * @param {Number} num
		 * @returns {String}
		 */
		this.labelForType = function( type, num ) {
			var descs = _textDictionary[type];
			var d = num % 10;
			if (d == 1) {
				return descs[0];
			}
			return descs[1];
		};
	};
	
	
	/**
	 * @class
	 * @implements CountdownLabelProvider
	 */
	function CountdownLabelProviderRU() {
		var that = this;
		
		var _textDictionary = {};
		_textDictionary[CountdownTypes.WEEKS] = ["Неделя", "Недели", "Недель"];
		_textDictionary[CountdownTypes.DAYS] = ["День", "Дня", "Дней"];
		_textDictionary[CountdownTypes.HOURS] = ["Час", "Часа", "Часов"];
		_textDictionary[CountdownTypes.MINUTES] = ["Минута", "Минуты", "Минут"];
		_textDictionary[CountdownTypes.SECONDS] = ["Секунда", "Секунды", "Секунд"];
		
		/**
		 * @returns {Object}
		 */
		this.getTextDictionary = function() {
			return _textDictionary;
		};
		
		/**
		 * @param {Object} dict
		 */
		this.setTextDictionary = function( dict ) {
			_textDictionary = dict;
		};
		
		/**
		 * @param {CountdownTypes|String} type
		 * @param {Number} num
		 * @returns {String}
		 */
		this.labelForType = function( type, num ) {
			var descs = _textDictionary[type];
			var d = num % 100;
			if (d > 4 && d < 20) {
				return descs[2];
			}
			d = num % 10;
			if (d == 1) {
				return descs[0];
			}
			if (d > 0 && d < 5) {
				return descs[1];
			}
			return descs[2];
		};
	};
	
	
	/**
	 * @consts
	 */
	var CountdownTypes = {
		WEEKS: "weeks"
		, DAYS:"days"
		, HOURS: "hours"
		, MINUTES: "minutes"
		, SECONDS: "seconds"
	};
	
	
	/**
	 * @consts
	 */
	var CountdownModifiers = {
		UNRESOLVED: "unresolved"
		, FULL: "full"
		, WEEKED: "weeked"
		, DAYED: "dayed"
		, HOURED: "houred"
		, MINUTED: "minuted"
	};
	
	
	//-----------------------------------------
	//  FORMAT PARSING
	//-----------------------------------------
	
	/**
	 * @class
	 */
	function CountdownFormatParser() {
		var that = this;
		
		var _hashCharToType = {};
		_hashCharToType[CountdownFormatChars.DIGIT_WEEKS] = CountdownTypes.WEEKS;
		_hashCharToType[CountdownFormatChars.DIGIT_DAYS] = CountdownTypes.DAYS;
		_hashCharToType[CountdownFormatChars.DIGIT_HOURS] = CountdownTypes.HOURS;
		_hashCharToType[CountdownFormatChars.DIGIT_MINUTES] = CountdownTypes.MINUTES;
		_hashCharToType[CountdownFormatChars.DIGIT_SECONDS] = CountdownTypes.SECONDS;
		
		var _hashTypeToModifier = {};
		_hashTypeToModifier[CountdownTypes.WEEKS] = CountdownModifiers.WEEKED;
		_hashTypeToModifier[CountdownTypes.DAYS] = CountdownModifiers.DAYED;
		_hashTypeToModifier[CountdownTypes.HOURS] = CountdownModifiers.HOURED;
		_hashTypeToModifier[CountdownTypes.MINUTES] = CountdownModifiers.MINUTED;
		
		var _hashCharToModifier = {};
		_hashCharToModifier[CountdownFormatModifiers.VALUE_AUTO] = CountdownModifiers.UNRESOLVED;
		_hashCharToModifier[CountdownFormatModifiers.VALUE_FULL] = CountdownModifiers.FULL;
		_hashCharToModifier[CountdownFormatModifiers.VALUE_WEEKED] = CountdownModifiers.WEEKED;
		_hashCharToModifier[CountdownFormatModifiers.VALUE_DAYED] = CountdownModifiers.DAYED;
		_hashCharToModifier[CountdownFormatModifiers.VALUE_HOURED] = CountdownModifiers.HOURED;
		_hashCharToModifier[CountdownFormatModifiers.VALUE_MINUTED] = CountdownModifiers.MINUTED;
		
		/**
		 * @param {String} str
		 * @returns {CountdownFormatGroup[]}
		 */
		this.parseToDigitGroups = function( str ) {
			var groups = _parseToGroups(str);
			_resolveModifiers(groups);
			return groups;
		};
		
		function _parseToGroups( str ) {
			var groups = [];
			
			var group = null;
			var char = null;
			var i = -1;
			var l = str.length;
			while (++i < l) {
				var prevChar = char;
				char = str.charAt(i);
				
				if (char === CountdownFormatChars.ESCAPER) {
					continue;
				}
				if (prevChar === CountdownFormatChars.ESCAPER) {
					if (group) {
						group.separatorText += char;
					}
					continue;
				}
				
				if (char === CountdownFormatChars.MODIFIER) {
					continue;
				}
				if (prevChar === CountdownFormatChars.MODIFIER) {
					if (group) {
						_handleModifierChar(char, group);
					}
					continue;
				}
				
				var digitType = _hashCharToType[char.toLowerCase()];
				if (digitType) {
					if (prevChar === null || prevChar.toLowerCase() !== char.toLowerCase()) {
						group = new CountdownFormatGroup();
						group.type = digitType;
						groups.push(group);
					}
					
					var digit = new CountdownFormatDigit();
					digit.isPermanent = (char === char.toUpperCase());
					digit.char = char;
					group.digits.push(digit);
					
					continue;
				}
				
				if (group) {
					group.separatorText += char;
				}
			}
			
			return groups;
		}
		
		function _resolveModifiers( groups ) {
			var group = null;
			var i = -1;
			var l = groups.length;
			while (++i < l) {
				var prevGroup = group;
				group = groups[i];
				if (group.modifier === CountdownModifiers.UNRESOLVED) {
					group.modifier = CountdownModifiers.FULL;
					if (prevGroup) {
						group.modifier = _hashTypeToModifier[prevGroup.type] || group.modifier;
					}	
				}
			}
		}
		
		/**
		 * @param {String} char
		 * @param {CountdownFormatGroup} group
		 */
		function _handleModifierChar( char, group ) {
			group.modifier = _hashCharToModifier[char];
			if (!group.modifier) {
				throw new Error("Unexpected option char '" + char + "' in countdown format");
			}
		}
	};
	
	
	/**
	 * @class
	 */
	function CountdownFormatDigit() {
		this.isPermanent = true;
		this.char = "";
	};
	
	
	/**
	 * @class
	 */
	function CountdownFormatGroup() {
		this.type = CountdownTypes.SECONDS;
		this.modifier = CountdownModifiers.UNRESOLVED;
		this.separatorText = "";
		this.digits = [];
	};
	
	
	/**
	 * @consts
	 */
	var CountdownFormatChars = {
		ESCAPER: "\\"
		, MODIFIER: "/"
		, DIGIT_WEEKS: "w"
		, DIGIT_DAYS:"d"
		, DIGIT_HOURS: "h"
		, DIGIT_MINUTES: "m"
		, DIGIT_SECONDS: "s"
	};
	
	
	/**
	 * @consts
	 */
	var CountdownFormatModifiers = {
		VALUE_AUTO: "a"
		, VALUE_FULL: "f"
		, VALUE_WEEKED: "w"
		, VALUE_DAYED:"d"
		, VALUE_HOURED: "h"
		, VALUE_MINUTED: "m"
	};
	
	
	//-----------------------------------------
	//  PRIVATE DOM UTILITES
	//-----------------------------------------
	
	/**
	 * @param {String} html
	 * @returns {HTMLElement}
	 */
	function elemCreate( html ) {
		var elem = document.createElement("div");
		elem.innerHTML = html;
		return elem.firstChild;
	}
	
	/**
	 * @param {HTMLElement} parent
	 * @param {String} html
	 * @returns {HTMLElement}
	 */
	function elemCreateIn( parent, html ) {
		return parent.appendChild(elemCreate(html));
	}
	
	/**
	 * @param {HTMLElement} elem
	 * @param {String} className
	 * @returns {Boolean}
	 */
	function elemHasClass( elem, className ) {
		return (elemGetClassOffset(elem, className) >= 0);
	}
	
	/**
	 * @param {HTMLElement} elem
	 * @param {String} className
	 */
	function elemAddClass( elem, className ) {
		if (!elemHasClass(elem, className)) {
			elem.className += " " + className;
		}
	}
	
	/**
	 * @param {HTMLElement} elem
	 * @param {String} className
	 */
	function elemRemoveClass( elem, className ) {
		var pos = elemGetClassOffset(elem, className);
		if (pos >= 0) {
			/** @type {String} */
			var cl = elem.className;
			elem.className = cl.slice(0, pos) + cl.slice(pos + className.length);
		}
	}
	
	/**
	 * @param {HTMLElement} elem
	 * @param {String} className
	 * @returns {Number}
	 */
	function elemGetClassOffset( elem, className ) {
		/** @type {String} */
		var cl = elem.className.replace(/\s/gi, " ");
		var i = -1;
		var l = className.length;
		while (true) {
			i = cl.indexOf(className, i);
			if (i >= 0) {
				if (i > 0 && cl.charAt(i - 1) != " ") {
					continue;
				}
				if ((i + l) < (cl.length - 1) && cl.charAt(i + l) != " ") {
					continue;
				}
			}
			break;
		}
		return i;
	}
	
	
	//-----------------------------------------
	//  MODULE INITIALIZATION
	//-----------------------------------------
	
	iodev = iodev || {};
	iodev.widgets = iodev.widgets || {};
	iodev.widgets.countdown = {
		
		CountdownClassSet: CountdownClassSet
		, CountdownAttributes: CountdownAttributes
		, CountdownLangs: CountdownLangs
		
		, Countdown: Countdown
		, CountdownGroupNode: CountdownGroupNode
		, CountdownDigitNode: CountdownDigitNode
		, CountdownDom: CountdownDom
		, CountdownBuilder: CountdownBuilder
		
		, CountdownModel: CountdownModel
		, CountdownLabelProvider: CountdownLabelProvider
		, CountdownLabelProviderRU: CountdownLabelProviderRU
		, CountdownTypes: CountdownTypes
		, CountdownModifiers: CountdownModifiers

		, CountdownFormatParser: CountdownFormatParser
		, CountdownFormatDigit: CountdownFormatDigit
		, CountdownFormatGroup: CountdownFormatGroup
		, CountdownFormatChars: CountdownFormatChars
		, CountdownFormatModifiers: CountdownFormatModifiers
		

		
		, defaultDom: new CountdownDom(new CountdownClassSet())
		, defaultFormat: "WW D HH:MM:SS"
	};
	
})();

