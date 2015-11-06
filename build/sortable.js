(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["sortable"] = factory();
	else
		root["sortable"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * dependencies
	 */

	var emitter = __webpack_require__(2)
	var classes = __webpack_require__(3)
	var events = __webpack_require__(5)
	var closest = __webpack_require__(8)
	var event = __webpack_require__(6)
	var throttle = __webpack_require__(11)
	var transform = __webpack_require__(13)
	var util = __webpack_require__(14)
	var Animate = __webpack_require__(19)
	var transition = __webpack_require__(17)
	var transitionend = __webpack_require__(20)

	var hasTouch = 'ontouchmove' in window
	/**
	 * export `Sortable`
	 */

	module.exports = Sortable;

	/**
	 * Initialize `Sortable` with `el`.
	 *
	 * @param {Element} el
	 */

	function Sortable(el){
	  if (!(this instanceof Sortable)) return new Sortable(el);
	  if (!el) throw new TypeError('sortable(): expects an element');
	  this.el = el
	  util.touchAction(el, 'none')
	  this.events = events(el, this);
	  this.pel = util.getRelativeElement(el)
	}

	/**
	 * Mixins.
	 */

	emitter(Sortable.prototype);

	/**
	 * Bind the draggable element selector
	 *
	 * @param {String} selector
	 * @api public
	 */
	Sortable.prototype.bind = function (selector){
	  this.selector = selector || '';

	  if (hasTouch) {
	    this.events.bind('touchstart');
	    this.events.bind('touchend');
	    this.events.bind('touchmove');
	  } else {
	    this.events.bind('mousedown');
	    this.events.bind('mouseup');
	    this.events.bind('mousemove');
	  }
	}

	/**
	 * Ignore items that t match the `selector`.
	 *
	 * @param {String} selector
	 * @return {Sortable}
	 * @api public
	 */
	Sortable.prototype.ignore = function(selector){
	  this.ignored = selector;
	  return this;
	}

	/**
	 * Set the max item count of this sortable
	 *
	 * @param {String} count
	 * @api public
	 */
	Sortable.prototype.max = function(count){
	  this.maxCount = count;
	  return this;
	}

	Sortable.prototype.horizon = function () {
	  this.dir = 'horizon'
	}

	/**
	 * Set handle to `selector`.
	 *
	 * @param {String} selector
	 * @return {Sortable}
	 * @api public
	 */

	Sortable.prototype.handle = function(selector){
	  this._handle = selector;
	  return this;
	}

	Sortable.prototype.ontouchstart =
	Sortable.prototype.onmousedown = function(e) {
	  // ignore
	  if (this.ignored && closest(e.target, this.ignored, this.el)) return
	  var touch = util.getTouch(e)
	  var node = this.findMatch(touch)
	  // element to move
	  if (node) node = util.matchAsChild(node, this.el)
	  // not found
	  if (node == null) return
	  if (node === this.disabled) return
	  e.preventDefault()
	  e.stopImmediatePropagation()
	  this.timer = setTimeout(function () {
	    this.dragEl = node
	    this.index = util.indexof(node)
	    var pos = util.getAbsolutePosition(node, this.pel)
	    // place holder
	    var holder = this.holder = node.cloneNode(false)
	    holder.removeAttribute('id')
	    classes(holder).add('sortable-holder')
	    util.copy(holder.style, {
	      height: pos.height + 'px',
	      width: pos.width + 'px'
	    })
	    this.mouseStart = {
	      x: touch.clientX,
	      y: touch.clientY
	    }
	    classes(node).add('sortable-dragging')
	    this.orig = util.copy(node.style, {
	      height: pos.height + 'px',
	      width: pos.width + 'px',
	      left: pos.left + 'px',
	      top: pos.top + 'px',
	      position: 'absolute'
	    })
	    this.el.insertBefore(holder, node)
	    this.bindDocument()
	    this.dragging = true
	    this.animate = new Animate(this.pel, node, holder)
	    this.emit('start')
	  }.bind(this), 100)
	  return false
	}

	Sortable.prototype.ontouchmove =
	Sortable.prototype.onmousemove = function(e) {
	  if (this.dragEl == null || this.index == null) return
	  if (hasTouch && e.changedTouches && e.changedTouches.length !== 1) return
	  e.preventDefault()
	  e.stopPropagation()
	  var touch = util.getTouch(e)
	  var touchDir = 0
	  var sx = this.mouseStart.x
	  var sy = this.mouseStart.y
	  var d = this.dragEl
	  var dx = touch.clientX - (this.x || sx)
	  var dy = touch.clientY - (this.y || sy)
	  this.x = touch.clientX
	  this.y = touch.clientY
	  if (this.dir === 'horizon') {
	    this.tx = touch.clientX - sx
	    util.translate(d, this.tx, 0)
	    touchDir = dx > 0 ? 1 : 3
	    if (dx === 0) return
	  } else {
	    this.ty = touch.clientY - sy
	    util.translate(d, 0, this.ty)
	    touchDir = dy > 0 ? 0 : 2
	    if (dy === 0) return
	  }
	  if (util.getPosition(touch.clientX, touch.clientY, this.el)) {
	    this.positionHolder(touch, touchDir)
	  }
	  return false
	}

	Sortable.prototype.ontouchend =
	Sortable.prototype.onmouseup = function(e) {
	  this.reset()
	}

	Sortable.prototype.remove = function() {
	  this.events.unbind();
	  this.off();
	}

	Sortable.prototype.findMatch = function(e){
	  if (this._handle) return closest(e.target, this._handle, this.el)
	  if (this.selector) {
	    var el = closest(e.target, this.selector, this.el)
	    return el
	  }
	  return util.matchAsChild(e.target, this.el)
	}

	var positionHolder = function (e, touchDir) {
	  var d = this.dragEl
	  if (d == null) return
	  var delta = 10
	  var rect = d.getBoundingClientRect()
	  var x = rect.left + (rect.width || d.clientWidth)/2
	  var y = rect.top + (rect.height || d.clientHeight)/2
	  var h = this.holder
	  var children = this.el.children
	  for (var i = children.length - 1; i >= 0; i--) {
	    var node = children[i]
	    if (node === d || node === h) continue
	    var pos = util.getPosition(x, y, node)
	    if (!pos) continue
	    if (this.dir === 'horizon') {
	      if (touchDir === 1 && pos.dx > - delta) {
	        this.animate.animate(node, 3)
	      } else if (touchDir === 3 && pos.dx < delta){
	        this.animate.animate(node, 1)
	      }
	    } else {
	      if (touchDir === 2 && pos.dy < delta) {
	        this.animate.animate(node, 0)
	      } else if (touchDir === 0 && pos.dy > -delta){
	        this.animate.animate(node, 2)
	      }
	    }
	  }
	}

	Sortable.prototype.positionHolder = throttle(positionHolder)

	/**
	 * Reset sortable.
	 *
	 * @api private
	 * @return {Sortable}
	 * @api private
	 */

	Sortable.prototype.reset = function(){
	  if (this.timer) clearTimeout(this.timer)
	  if (!this.dragging) return
	  this.dragging = false
	  this.timer = null
	  var p = this.el
	  var el = this.dragEl
	  var h = this.holder
	  this.moveTo(h, function () {
	    el.style[transform] = ''
	    p.insertBefore(el, h)
	    p.removeChild(h)
	    util.copy(el.style, this.orig)
	    classes(el).remove('sortable-dragging')
	    if (util.indexof(el) !== this.index) {
	      this.emit('update', el)
	    }
	    delete this.index
	    this.animate = this.holder = this.dragEl = null
	    this.emit('end')
	  }.bind(this))
	}


	/**
	 * Bind document event
	 *
	 * @api private
	 */
	Sortable.prototype.bindDocument = function () {
	  var self = this
	  var name = hasTouch ? 'touchend' : 'mouseup'
	  event.bind(document, name, function reset() {
	    event.unbind(document, name, reset)
	    self.reset()
	  })
	}

	Sortable.prototype.moveTo = function (target, cb) {
	  var el = this.dragEl
	  this.disabled = el
	  util.transitionDuration(el, 300)
	  var tx = this.tx || 0
	  var ty = this.ty || 0
	  var dis = this.getDistance(el, target, this.animate.dir)
	  var x = tx + dis.x
	  var y = ty + dis.y
	  var nomove = (dis.x ===0 && dis.y === 0)
	  var self = this
	  var fn = function () {
	    el.style[transition] = ''
	    self.disabled = null
	    cb()
	  }
	  if (nomove) {
	    fn()
	  } else {
	    event.bind(el, transitionend, function end() {
	      event.unbind(el, transitionend, end);
	      fn()
	    })
	    util.translate(el, x, y)
	  }
	}

	Sortable.prototype.getDistance = function (from, to, dir) {
	  var x
	  var y
	  var r = from.getBoundingClientRect()
	  var tr = to.getBoundingClientRect()
	  var prop
	  if (dir%2 === 0) {
	    x = 0
	    prop = dir === 0 ? 'top' : 'bottom'
	    y = tr[prop] - r[prop]
	  } else {
	    y = 0
	    prop = dir === 1 ? 'left' : 'right'
	    x = tr[prop] - r[prop]
	  }
	  return {x: x, y: y}
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var index = __webpack_require__(4);

	/**
	 * Whitespace regexp.
	 */

	var re = /\s+/;

	/**
	 * toString reference.
	 */

	var toString = Object.prototype.toString;

	/**
	 * Wrap `el` in a `ClassList`.
	 *
	 * @param {Element} el
	 * @return {ClassList}
	 * @api public
	 */

	module.exports = function(el){
	  return new ClassList(el);
	};

	/**
	 * Initialize a new ClassList for `el`.
	 *
	 * @param {Element} el
	 * @api private
	 */

	function ClassList(el) {
	  if (!el || !el.nodeType) {
	    throw new Error('A DOM element reference is required');
	  }
	  this.el = el;
	  this.list = el.classList;
	}

	/**
	 * Add class `name` if not already present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */

	ClassList.prototype.add = function(name){
	  // classList
	  if (this.list) {
	    this.list.add(name);
	    return this;
	  }

	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (!~i) arr.push(name);
	  this.el.className = arr.join(' ');
	  return this;
	};

	/**
	 * Remove class `name` when present, or
	 * pass a regular expression to remove
	 * any which match.
	 *
	 * @param {String|RegExp} name
	 * @return {ClassList}
	 * @api public
	 */

	ClassList.prototype.remove = function(name){
	  if ('[object RegExp]' == toString.call(name)) {
	    return this.removeMatching(name);
	  }

	  // classList
	  if (this.list) {
	    this.list.remove(name);
	    return this;
	  }

	  // fallback
	  var arr = this.array();
	  var i = index(arr, name);
	  if (~i) arr.splice(i, 1);
	  this.el.className = arr.join(' ');
	  return this;
	};

	/**
	 * Remove all classes matching `re`.
	 *
	 * @param {RegExp} re
	 * @return {ClassList}
	 * @api private
	 */

	ClassList.prototype.removeMatching = function(re){
	  var arr = this.array();
	  for (var i = 0; i < arr.length; i++) {
	    if (re.test(arr[i])) {
	      this.remove(arr[i]);
	    }
	  }
	  return this;
	};

	/**
	 * Toggle class `name`, can force state via `force`.
	 *
	 * For browsers that support classList, but do not support `force` yet,
	 * the mistake will be detected and corrected.
	 *
	 * @param {String} name
	 * @param {Boolean} force
	 * @return {ClassList}
	 * @api public
	 */

	ClassList.prototype.toggle = function(name, force){
	  // classList
	  if (this.list) {
	    if ("undefined" !== typeof force) {
	      if (force !== this.list.toggle(name, force)) {
	        this.list.toggle(name); // toggle again to correct
	      }
	    } else {
	      this.list.toggle(name);
	    }
	    return this;
	  }

	  // fallback
	  if ("undefined" !== typeof force) {
	    if (!force) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  } else {
	    if (this.has(name)) {
	      this.remove(name);
	    } else {
	      this.add(name);
	    }
	  }

	  return this;
	};

	/**
	 * Return an array of classes.
	 *
	 * @return {Array}
	 * @api public
	 */

	ClassList.prototype.array = function(){
	  var className = this.el.getAttribute('class') || '';
	  var str = className.replace(/^\s+|\s+$/g, '');
	  var arr = str.split(re);
	  if ('' === arr[0]) arr.shift();
	  return arr;
	};

	/**
	 * Check if class `name` is present.
	 *
	 * @param {String} name
	 * @return {ClassList}
	 * @api public
	 */

	ClassList.prototype.has =
	ClassList.prototype.contains = function(name){
	  return this.list
	    ? this.list.contains(name)
	    : !! ~index(this.array(), name);
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(arr, obj){
	  if (arr.indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */

	var events = __webpack_require__(6);
	var delegate = __webpack_require__(7);

	/**
	 * Expose `Events`.
	 */

	module.exports = Events;

	/**
	 * Initialize an `Events` with the given
	 * `el` object which events will be bound to,
	 * and the `obj` which will receive method calls.
	 *
	 * @param {Object} el
	 * @param {Object} obj
	 * @api public
	 */

	function Events(el, obj) {
	  if (!(this instanceof Events)) return new Events(el, obj);
	  if (!el) throw new Error('element required');
	  if (!obj) throw new Error('object required');
	  this.el = el;
	  this.obj = obj;
	  this._events = {};
	}

	/**
	 * Subscription helper.
	 */

	Events.prototype.sub = function(event, method, cb){
	  this._events[event] = this._events[event] || {};
	  this._events[event][method] = cb;
	};

	/**
	 * Bind to `event` with optional `method` name.
	 * When `method` is undefined it becomes `event`
	 * with the "on" prefix.
	 *
	 * Examples:
	 *
	 *  Direct event handling:
	 *
	 *    events.bind('click') // implies "onclick"
	 *    events.bind('click', 'remove')
	 *    events.bind('click', 'sort', 'asc')
	 *
	 *  Delegated event handling:
	 *
	 *    events.bind('click li > a')
	 *    events.bind('click li > a', 'remove')
	 *    events.bind('click a.sort-ascending', 'sort', 'asc')
	 *    events.bind('click a.sort-descending', 'sort', 'desc')
	 *
	 * @param {String} event
	 * @param {String|function} [method]
	 * @return {Function} callback
	 * @api public
	 */

	Events.prototype.bind = function(event, method){
	  var e = parse(event);
	  var el = this.el;
	  var obj = this.obj;
	  var name = e.name;
	  var method = method || 'on' + name;
	  var args = [].slice.call(arguments, 2);

	  // callback
	  function cb(){
	    var a = [].slice.call(arguments).concat(args);
	    obj[method].apply(obj, a);
	  }

	  // bind
	  if (e.selector) {
	    cb = delegate.bind(el, e.selector, name, cb);
	  } else {
	    events.bind(el, name, cb);
	  }

	  // subscription for unbinding
	  this.sub(name, method, cb);

	  return cb;
	};

	/**
	 * Unbind a single binding, all bindings for `event`,
	 * or all bindings within the manager.
	 *
	 * Examples:
	 *
	 *  Unbind direct handlers:
	 *
	 *     events.unbind('click', 'remove')
	 *     events.unbind('click')
	 *     events.unbind()
	 *
	 * Unbind delegate handlers:
	 *
	 *     events.unbind('click', 'remove')
	 *     events.unbind('click')
	 *     events.unbind()
	 *
	 * @param {String|Function} [event]
	 * @param {String|Function} [method]
	 * @api public
	 */

	Events.prototype.unbind = function(event, method){
	  if (0 == arguments.length) return this.unbindAll();
	  if (1 == arguments.length) return this.unbindAllOf(event);

	  // no bindings for this event
	  var bindings = this._events[event];
	  if (!bindings) return;

	  // no bindings for this method
	  var cb = bindings[method];
	  if (!cb) return;

	  events.unbind(this.el, event, cb);
	};

	/**
	 * Unbind all events.
	 *
	 * @api private
	 */

	Events.prototype.unbindAll = function(){
	  for (var event in this._events) {
	    this.unbindAllOf(event);
	  }
	};

	/**
	 * Unbind all events for `event`.
	 *
	 * @param {String} event
	 * @api private
	 */

	Events.prototype.unbindAllOf = function(event){
	  var bindings = this._events[event];
	  if (!bindings) return;

	  for (var method in bindings) {
	    this.unbind(event, method);
	  }
	};

	/**
	 * Parse `event`.
	 *
	 * @param {String} event
	 * @return {Object}
	 * @api private
	 */

	function parse(event) {
	  var parts = event.split(/ +/);
	  return {
	    name: parts.shift(),
	    selector: parts.join(' ')
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
	    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
	    prefix = bind !== 'addEventListener' ? 'on' : '';

	/**
	 * Bind `el` event `type` to `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */

	exports.bind = function(el, type, fn, capture){
	  el[bind](prefix + type, fn, capture || false);
	  return fn;
	};

	/**
	 * Unbind `el` event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */

	exports.unbind = function(el, type, fn, capture){
	  el[unbind](prefix + type, fn, capture || false);
	  return fn;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var closest = __webpack_require__(8)
	  , event = __webpack_require__(6);

	/**
	 * Delegate event `type` to `selector`
	 * and invoke `fn(e)`. A callback function
	 * is returned which may be passed to `.unbind()`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */

	exports.bind = function(el, selector, type, fn, capture){
	  return event.bind(el, type, function(e){
	    var target = e.target || e.srcElement;
	    e.delegateTarget = closest(target, selector, true, el);
	    if (e.delegateTarget) fn.call(el, e);
	  }, capture);
	};

	/**
	 * Unbind event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @api public
	 */

	exports.unbind = function(el, type, fn, capture){
	  event.unbind(el, type, fn, capture);
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies
	 */

	var matches = __webpack_require__(9)

	/**
	 * Export `closest`
	 */

	module.exports = closest

	/**
	 * Closest
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @param {Element} scope (optional)
	 */

	function closest (el, selector, scope) {
	  scope = scope || document.documentElement;

	  // walk up the dom
	  while (el && el !== scope) {
	    if (matches(el, selector)) return el;
	    el = el.parentNode;
	  }

	  // check scope for match
	  return matches(el, selector) ? el : null;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var query = __webpack_require__(10);

	/**
	 * Element prototype.
	 */

	var proto = Element.prototype;

	/**
	 * Vendor function.
	 */

	var vendor = proto.matches
	  || proto.webkitMatchesSelector
	  || proto.mozMatchesSelector
	  || proto.msMatchesSelector
	  || proto.oMatchesSelector;

	/**
	 * Expose `match()`.
	 */

	module.exports = match;

	/**
	 * Match `el` to `selector`.
	 *
	 * @param {Element} el
	 * @param {String} selector
	 * @return {Boolean}
	 * @api public
	 */

	function match(el, selector) {
	  if (!el || el.nodeType !== 1) return false;
	  if (vendor) return vendor.call(el, selector);
	  var nodes = query.all(selector, el.parentNode);
	  for (var i = 0; i < nodes.length; ++i) {
	    if (nodes[i] == el) return true;
	  }
	  return false;
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	function one(selector, el) {
	  return el.querySelector(selector);
	}

	exports = module.exports = function(selector, el){
	  el = el || document;
	  return one(selector, el);
	};

	exports.all = function(selector, el){
	  el = el || document;
	  return el.querySelectorAll(selector);
	};

	exports.engine = function(obj){
	  if (!obj.one) throw new Error('.one callback required');
	  if (!obj.all) throw new Error('.all callback required');
	  one = obj.one;
	  exports.all = obj.all;
	  return exports;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module Dependencies.
	 */

	var raf = __webpack_require__(12);

	/**
	 * Export `throttle`.
	 */

	module.exports = throttle;

	/**
	 * Executes a function at most once per animation frame. Kind of like
	 * throttle, but it throttles at ~60Hz.
	 *
	 * @param {Function} fn - the Function to throttle once per animation frame
	 * @return {Function}
	 * @public
	 */

	function throttle(fn) {
	  var rtn;
	  var ignoring = false;

	  return function queue() {
	    if (ignoring) return rtn;
	    ignoring = true;

	    raf(function() {
	      ignoring = false;
	    });

	    rtn = fn.apply(this, arguments);
	    return rtn;
	  };
	}


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Expose `requestAnimationFrame()`.
	 */

	exports = module.exports = window.requestAnimationFrame
	  || window.webkitRequestAnimationFrame
	  || window.mozRequestAnimationFrame
	  || fallback;

	/**
	 * Fallback implementation.
	 */

	var prev = new Date().getTime();
	function fallback(fn) {
	  var curr = new Date().getTime();
	  var ms = Math.max(0, 16 - (curr - prev));
	  var req = setTimeout(fn, ms);
	  prev = curr;
	  return req;
	}

	/**
	 * Cancel.
	 */

	var cancel = window.cancelAnimationFrame
	  || window.webkitCancelAnimationFrame
	  || window.mozCancelAnimationFrame
	  || window.clearTimeout;

	exports.cancel = function(id){
	  cancel.call(window, id);
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	
	var styles = [
	  'webkitTransform',
	  'MozTransform',
	  'msTransform',
	  'OTransform',
	  'transform'
	];

	var el = document.createElement('p');
	var style;

	for (var i = 0; i < styles.length; i++) {
	  style = styles[i];
	  if (null != el.style[style]) {
	    module.exports = style;
	    break;
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var styles = __webpack_require__(15)
	var transform = __webpack_require__(13)
	var has3d = __webpack_require__(16)
	var transition = __webpack_require__(17)
	var touchAction = __webpack_require__(18)

	/**
	 * Get the child of topEl by element within a child
	 *
	 * @param  {Element}  el
	 * @param {Element} topEl
	 * @return {Element}
	 * @api private
	 */
	exports.matchAsChild = function (el, topEl) {
	  if (el === topEl) return
	  do {
	    if (el.parentNode === topEl) return el
	    el = el.parentNode
	    if (el === document.body) break
	  } while(el)
	}

	/**
	 * Get position by clientX clientY in element
	 * 1 2 3 4 => tl tr bl br
	 *
	 * @param {Number} x
	 * @param {Number} y
	 * @param  {Element}  el
	 * @return {Boolean}
	 * @api public
	 */
	exports.getPosition = function (x, y, el) {
	  var rect = el.getBoundingClientRect()
	  var w = rect.width || el.clientWidth
	  var h = rect.height || el.clientHeight
	  if (x > rect.left && x < rect.left + w && y > rect.top && y < rect.top + h) {
	    return {
	      dx: x - (rect.left + w/2),
	      dy: y - (rect.top + h/2)
	    }
	  }
	  return false
	}

	/**
	 * Get absolute left top width height
	 *
	 * @param  {Element}  el
	 * @param {Element} pel
	 * @return {Object}
	 * @api public
	 */
	var getAbsolutePosition = exports.getAbsolutePosition = function (el, pel) {
	  var r = el.getBoundingClientRect()
	  var rect = pel.getBoundingClientRect()
	  return {
	    left: r.left - rect.left,
	    top: r.top -rect.top,
	    width: r.width || el.chientWidth,
	    height: r.height || el.clientHeight
	  }
	}

	/**
	 * Make an element absolute, return origin props
	 *
	 * @param  {Element}  el
	 * @param {Element} pel
	 * @return {Object}
	 * @api public
	 */
	exports.makeAbsolute = function (el, pel) {
	  var pos = getAbsolutePosition(el, pel)
	  var orig = copy(el.style, {
	    height: pos.height + 'px',
	    width: pos.width + 'px',
	    left: pos.left + 'px',
	    top: pos.top + 'px',
	    position: 'absolute',
	    float: 'none'
	  })
	  return orig
	}

	var doc = document.documentElement
	/**
	 * Get relative element of el
	 *
	 * @param  {Element}  el
	 * @return {Element}
	 * @api public
	 */
	exports.getRelativeElement = function (el) {
	  do {
	    if (el === doc) return el
	    var p = styles(el, 'position')
	    if (p === 'absolute' || p === 'fixed' || p === 'relative') {
	      return p
	    }
	    el = el.parentNode
	  } while(el)
	}

	/**
	 * Insert newNode after ref
	 *
	 * @param {Element} newNode
	 * @param {Element} ref
	 * @api public
	 */
	exports.insertAfter = function (newNode, ref) {
	  if (ref.nextSibling) {
	    ref.parentNode.insertBefore(newNode, ref.nextSibling)
	  } else {
	    ref.parentNode.appendChild(newNode)
	  }
	}

	/**
	 * Copy props from from to to
	 * return original props
	 *
	 * @param {Object} to
	 * @param {Object} from
	 * @return {Object}
	 * @api public
	 */
	var copy = exports.copy = function (to, from) {
	  var orig = {}
	  Object.keys(from).forEach(function (k) {
	    orig[k] = to[k]
	    to[k] = from[k]
	  })
	  return orig
	}

	/**
	 * Get index of element as children
	 *
	 * @param  {Element}  el
	 * @return {Number}
	 * @api public
	 */
	exports.indexof = function (el) {
	  var children = el.parentNode.children
	  for (var i = children.length - 1; i >= 0; i--) {
	    var node = children[i];
	    if (node === el) {
	      return i
	    }
	  }
	}

	/**
	 * Translate el to `x` `y`.
	 *
	 * @api public
	 */
	exports.translate = function(el, x, y){
	  var s = el.style
	  x = x || 0
	  y = y || 0
	  if (has3d) {
	    s[transform] = 'translate3d(' + x + 'px,' + y + 'px, 0)'
	  } else {
	    s[transform] = 'translateX(' + x + 'px)'
	    s[transform] = 'translateY(' + y + 'px)'
	  }
	}

	/**
	 * Set transition duration to `ms`
	 *
	 * @param  {Element}  el
	 * @param {Number} ms
	 * @api public
	 */
	var prefix = transition.replace(/transition/i, '').toLowerCase()
	exports.transitionDuration = function(el, ms){
	  var s = el.style;
	  if (!prefix) {
	    s[transition] = ms + 'ms transform ease-in-out'
	  } else {
	    s[transition] = ms + 'ms -' + prefix + '-transform ease-in-out'
	  }
	}

	/**
	 * Gets the appropriate "touch" object for the `e` event. The event may be from
	 * a "mouse", "touch", or "Pointer" event, so the normalization happens here.
	 *
	 * @api private
	 */
	exports.getTouch = function(e){
	  // "mouse" and "Pointer" events just use the event object itself
	  var touch = e;
	  if (e.changedTouches && e.changedTouches.length > 0) {
	    // W3C "touch" events use the `changedTouches` array
	    touch = e.changedTouches[0];
	  }
	  return touch;
	}

	/**
	 * Sets the "touchAction" CSS style property to `value`.
	 *
	 * @api private
	 */
	exports.touchAction = function(el, value){
	  var s = el.style;
	  if (touchAction) {
	    s[touchAction] = value;
	  }
	}



/***/ },
/* 15 */
/***/ function(module, exports) {

	// DEV: We don't use var but favor parameters since these play nicer with minification
	function computedStyle(el, prop, getComputedStyle, style) {
	  getComputedStyle = window.getComputedStyle;
	  style =
	      // If we have getComputedStyle
	      getComputedStyle ?
	        // Query it
	        // TODO: From CSS-Query notes, we might need (node, null) for FF
	        getComputedStyle(el) :

	      // Otherwise, we are in IE and use currentStyle
	        el.currentStyle;
	  if (style) {
	    return style
	    [
	      // Switch to camelCase for CSSOM
	      // DEV: Grabbed from jQuery
	      // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
	      // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
	      prop.replace(/-(\w)/gi, function (word, letter) {
	        return letter.toUpperCase();
	      })
	    ];
	  }
	}

	module.exports = computedStyle;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	var prop = __webpack_require__(13);

	// IE <=8 doesn't have `getComputedStyle`
	if (!prop || !window.getComputedStyle) {
	  module.exports = false;

	} else {
	  var map = {
	    webkitTransform: '-webkit-transform',
	    OTransform: '-o-transform',
	    msTransform: '-ms-transform',
	    MozTransform: '-moz-transform',
	    transform: 'transform'
	  };

	  // from: https://gist.github.com/lorenzopolidori/3794226
	  var el = document.createElement('div');
	  el.style[prop] = 'translate3d(1px,1px,1px)';
	  document.body.insertBefore(el, null);
	  var val = getComputedStyle(el).getPropertyValue(map[prop]);
	  document.body.removeChild(el);
	  module.exports = null != val && val.length && 'none' != val;
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	var styles = [
	  'transition',
	  'webkitTransition',
	  'MozTransition',
	  'OTransition',
	  'msTransition'
	]

	var el = document.createElement('p')
	var style

	for (var i = 0; i < styles.length; i++) {
	  if (null != el.style[styles[i]]) {
	    style = styles[i]
	    break
	  }
	}
	el = null

	module.exports = style


/***/ },
/* 18 */
/***/ function(module, exports) {

	
	/**
	 * Module exports.
	 */

	module.exports = touchActionProperty();

	/**
	 * Returns "touchAction", "msTouchAction", or null.
	 */

	function touchActionProperty(doc) {
	  if (!doc) doc = document;
	  var div = doc.createElement('div');
	  var prop = null;
	  if ('touchAction' in div.style) prop = 'touchAction';
	  else if ('msTouchAction' in div.style) prop = 'msTouchAction';
	  div = null;
	  return prop;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(14)
	var transform = __webpack_require__(13)
	var transition = __webpack_require__(17)
	var transitionend = __webpack_require__(20)
	var event = __webpack_require__(6)
	var uid = __webpack_require__(21)

	function Animate(pel, dragEl, holder) {
	  var d = this.dragEl = dragEl
	  var r = d.getBoundingClientRect()
	  this.holder = holder
	  this.dx = r.width || d.clientWidth
	  this.dy = r.height || d.clientHeight
	  this.pel = pel
	  this.animates = {}
	}

	/**
	 * Animate element with direction
	 * 0 1 2 3 is for down right up left
	 *
	 * @param  {Element}  el
	 * @param {Number} dir
	 * @api public
	 */
	Animate.prototype.animate = function (el, dir) {
	  if (!el.id) el.id = uid(7)
	  var o = this.animates[el.id] || {}
	  if (o.dir === dir) return
	  this.dir = dir
	  o.dir = dir
	  // var holder = this.holder
	  if (o.end) {
	    event.unbind(el, transitionend, o.end);
	    if (o.transform) {
	      o.transform = false
	      this.transit(el, 0, 0, dir)
	    } else {
	      o.transform = true
	      var props = this.getTransformProperty(dir)
	      this.transit(el, props.x, props.y, dir)
	    }
	  } else {
	    o.transform = true
	    util.transitionDuration(el, 300)
	    this.animates[el.id] = o
	    this.start(o, el, dir)
	  }
	}

	Animate.prototype.getTransformProperty = function (dir) {
	  var x
	  var y
	  if (dir%2 === 0) {
	    y = dir > 1 ? - this.dy : this.dy
	  } else {
	    x = dir > 1 ? - this.dx : this.dx
	  }
	  return {
	    x: x,
	    y: y
	  }
	}

	Animate.prototype.start = function (o, el, dir) {
	  var holder = this.holder
	  var r = holder.getBoundingClientRect()
	  var h = r.height || holder.clientHeight
	  var w = r.width || holder.clientWidth
	  var s = holder.style
	  o.orig = util.makeAbsolute(el, this.pel)
	  // bigger the holder
	  if (dir%2 === 0) {
	    s.height = (h + this.dy) + 'px'
	  } else {
	    s.width = (w + this.dx) + 'px'
	  }
	  var props = this.getTransformProperty(dir)
	  // test if transition begin
	  o.end = this.transit(el, props.x, props.y, dir)
	}

	Animate.prototype.transit = function (el, x, y, dir) {
	  var holder = this.holder
	  var s = holder.style
	  util.translate(el, x, y)
	  var next = this.next(el)
	  var prev = this.prev(el)
	  var self = this
	  var end = function () {
	    event.unbind(el, transitionend, end);
	    var o = self.animates[el.id]
	    if (!o) return
	    var orig = o.orig
	    self.animates[el.id] = null
	    // reset el
	    el.style[transition] = ''
	    el.style[transform] = ''
	    var p = el.parentNode
	    if (o.transform) {
	      if (dir > 1) {
	        if (prev) {
	          util.insertAfter(el, prev)
	        } else {
	          var first = p.firstChild
	          p.insertBefore(el, first)
	        }
	      } else {
	        if (next) {
	          p.insertBefore(el, next)
	        } else {
	          p.appendChild(el)
	        }
	      }
	    }
	    util.copy(el.style, orig)
	    // reset holder
	    var rect = holder.getBoundingClientRect()
	    if (dir%2 === 0) {
	      s.height = ((rect.height || holder.clientHeight) - self.dy) + 'px'
	    } else {
	      s.width = ((rect.width || holder.clientWidth) - self.dx) + 'px'
	    }
	  }
	  event.bind(el, transitionend, end)
	  return end
	}

	Animate.prototype.prev = function (el) {
	  do {
	    el = el.previousSibling
	    if (el === this.dragEl || el === this.holder) continue
	    if (el && el.nodeType === 1) return el
	  } while (el)
	  return null
	}

	Animate.prototype.next = function (el) {
	  do {
	    el = el.nextSibling
	    if (el === this.dragEl || el === this.holder) continue
	    if (el && el.nodeType === 1) return el
	  } while (el)
	  return null
	}

	module.exports = Animate


/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Transition-end mapping
	 */

	var map = {
	  'WebkitTransition' : 'webkitTransitionEnd',
	  'MozTransition' : 'transitionend',
	  'OTransition' : 'oTransitionEnd',
	  'msTransition' : 'MSTransitionEnd',
	  'transition' : 'transitionend'
	};

	/**
	 * Expose `transitionend`
	 */

	var el = document.createElement('p');

	for (var transition in map) {
	  if (null != el.style[transition]) {
	    module.exports = map[transition];
	    break;
	  }
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	/**
	 * Export `uid`
	 */

	module.exports = uid;

	/**
	 * Create a `uid`
	 *
	 * @param {String} len
	 * @return {String} uid
	 */

	function uid(len) {
	  len = len || 7;
	  return Math.random().toString(35).substr(2, len);
	}


/***/ }
/******/ ])
});
;