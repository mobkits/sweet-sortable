
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-query/index.js", Function("exports, require, module",
"\nfunction one(selector, el) {\n  return el.querySelector(selector);\n}\n\nexports = module.exports = function(selector, el){\n  el = el || document;\n  return one(selector, el);\n};\n\nexports.all = function(selector, el){\n  el = el || document;\n  return el.querySelectorAll(selector);\n};\n\nexports.engine = function(obj){\n  if (!obj.one) throw new Error('.one callback required');\n  if (!obj.all) throw new Error('.all callback required');\n  one = obj.one;\n  exports.all = obj.all;\n};\n//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar query = require('query');\n\n/**\n * Element prototype.\n */\n\nvar proto = Element.prototype;\n\n/**\n * Vendor function.\n */\n\nvar vendor = proto.matchesSelector\n  || proto.webkitMatchesSelector\n  || proto.mozMatchesSelector\n  || proto.msMatchesSelector\n  || proto.oMatchesSelector;\n\n/**\n * Expose `match()`.\n */\n\nmodule.exports = match;\n\n/**\n * Match `el` to `selector`.\n *\n * @param {Element} el\n * @param {String} selector\n * @return {Boolean}\n * @api public\n */\n\nfunction match(el, selector) {\n  if (vendor) return vendor.call(el, selector);\n  var nodes = query.all(selector, el.parentNode);\n  for (var i = 0; i < nodes.length; ++i) {\n    if (nodes[i] == el) return true;\n  }\n  return false;\n}\n//@ sourceURL=component-matches-selector/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  if (el.addEventListener) {\n    el.addEventListener(type, fn, capture || false);\n  } else {\n    el.attachEvent('on' + type, fn);\n  }\n  return fn;\n};\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  if (el.removeEventListener) {\n    el.removeEventListener(type, fn, capture || false);\n  } else {\n    el.detachEvent('on' + type, fn);\n  }\n  return fn;\n};\n//@ sourceURL=component-event/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar matches = require('matches-selector')\n  , event = require('event');\n\n/**\n * Delegate event `type` to `selector`\n * and invoke `fn(e)`. A callback function\n * is returned which may be passed to `.unbind()`.\n *\n * @param {Element} el\n * @param {String} selector\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, selector, type, fn, capture){\n  return event.bind(el, type, function(e){\n    if (matches(e.target, selector)) fn(e);\n  }, capture);\n  return callback;\n};\n\n/**\n * Unbind event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  event.unbind(el, type, fn, capture);\n};\n//@ sourceURL=component-delegate/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar events = require('event');\nvar delegate = require('delegate');\n\n/**\n * Expose `Events`.\n */\n\nmodule.exports = Events;\n\n/**\n * Initialize an `Events` with the given\n * `el` object which events will be bound to,\n * and the `obj` which will receive method calls.\n *\n * @param {Object} el\n * @param {Object} obj\n * @api public\n */\n\nfunction Events(el, obj) {\n  if (!(this instanceof Events)) return new Events(el, obj);\n  if (!el) throw new Error('element required');\n  if (!obj) throw new Error('object required');\n  this.el = el;\n  this.obj = obj;\n  this._events = {};\n}\n\n/**\n * Subscription helper.\n */\n\nEvents.prototype.sub = function(event, method, cb){\n  this._events[event] = this._events[event] || {};\n  this._events[event][method] = cb;\n};\n\n/**\n * Bind to `event` with optional `method` name.\n * When `method` is undefined it becomes `event`\n * with the \"on\" prefix.\n *\n * Examples:\n *\n *  Direct event handling:\n *\n *    events.bind('click') // implies \"onclick\"\n *    events.bind('click', 'remove')\n *    events.bind('click', 'sort', 'asc')\n *\n *  Delegated event handling:\n *\n *    events.bind('click li > a')\n *    events.bind('click li > a', 'remove')\n *    events.bind('click a.sort-ascending', 'sort', 'asc')\n *    events.bind('click a.sort-descending', 'sort', 'desc')\n *\n * @param {String} event\n * @param {String|function} [method]\n * @return {Function} callback\n * @api public\n */\n\nEvents.prototype.bind = function(event, method){\n  var e = parse(event);\n  var el = this.el;\n  var obj = this.obj;\n  var name = e.name;\n  var method = method || 'on' + name;\n  var args = [].slice.call(arguments, 2);\n\n  // callback\n  function cb(){\n    var a = [].slice.call(arguments).concat(args);\n    obj[method].apply(obj, a);\n  }\n\n  // bind\n  if (e.selector) {\n    cb = delegate.bind(el, e.selector, name, cb);\n  } else {\n    events.bind(el, name, cb);\n  }\n\n  // subscription for unbinding\n  this.sub(name, method, cb);\n\n  return cb;\n};\n\n/**\n * Unbind a single binding, all bindings for `event`,\n * or all bindings within the manager.\n *\n * Examples:\n *\n *  Unbind direct handlers:\n *\n *     events.unbind('click', 'remove')\n *     events.unbind('click')\n *     events.unbind()\n *\n * Unbind delegate handlers:\n *\n *     events.unbind('click', 'remove')\n *     events.unbind('click')\n *     events.unbind()\n *\n * @param {String|Function} [event]\n * @param {String|Function} [method]\n * @api public\n */\n\nEvents.prototype.unbind = function(event, method){\n  if (0 == arguments.length) return this.unbindAll();\n  if (1 == arguments.length) return this.unbindAllOf(event);\n\n  // no bindings for this event\n  var bindings = this._events[event];\n  if (!bindings) return;\n\n  // no bindings for this method\n  var cb = bindings[method];\n  if (!cb) return;\n\n  events.unbind(this.el, event, cb);\n};\n\n/**\n * Unbind all events.\n *\n * @api private\n */\n\nEvents.prototype.unbindAll = function(){\n  for (var event in this._events) {\n    this.unbindAllOf(event);\n  }\n};\n\n/**\n * Unbind all events for `event`.\n *\n * @param {String} event\n * @api private\n */\n\nEvents.prototype.unbindAllOf = function(event){\n  var bindings = this._events[event];\n  if (!bindings) return;\n\n  for (var method in bindings) {\n    this.unbind(event, method);\n  }\n};\n\n/**\n * Parse `event`.\n *\n * @param {String} event\n * @return {Object}\n * @api private\n */\n\nfunction parse(event) {\n  var parts = event.split(/ +/);\n  return {\n    name: parts.shift(),\n    selector: parts.join(' ')\n  }\n}\n//@ sourceURL=component-events/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  if (!el) throw new Error('A DOM element reference is required');\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n  var arr = str.split(re);\n  if ('' === arr[0]) arr.shift();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n//@ sourceURL=component-classes/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n/**\n * Expose `toFunction()`.\n */\n\nmodule.exports = toFunction;\n\n/**\n * Convert `obj` to a `Function`.\n *\n * @param {Mixed} obj\n * @return {Function}\n * @api private\n */\n\nfunction toFunction(obj) {\n  switch ({}.toString.call(obj)) {\n    case '[object Object]':\n      return objectToFunction(obj);\n    case '[object Function]':\n      return obj;\n    case '[object String]':\n      return stringToFunction(obj);\n    case '[object RegExp]':\n      return regexpToFunction(obj);\n    default:\n      return defaultToFunction(obj);\n  }\n}\n\n/**\n * Default to strict equality.\n *\n * @param {Mixed} val\n * @return {Function}\n * @api private\n */\n\nfunction defaultToFunction(val) {\n  return function(obj){\n    return val === obj;\n  }\n}\n\n/**\n * Convert `re` to a function.\n *\n * @param {RegExp} re\n * @return {Function}\n * @api private\n */\n\nfunction regexpToFunction(re) {\n  return function(obj){\n    return re.test(obj);\n  }\n}\n\n/**\n * Convert property `str` to a function.\n *\n * @param {String} str\n * @return {Function}\n * @api private\n */\n\nfunction stringToFunction(str) {\n  // immediate such as \"> 20\"\n  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\n  // properties such as \"name.first\" or \"age > 18\"\n  return new Function('_', 'return _.' + str);\n}\n\n/**\n * Convert `object` to a function.\n *\n * @param {Object} object\n * @return {Function}\n * @api private\n */\n\nfunction objectToFunction(obj) {\n  var match = {}\n  for (var key in obj) {\n    match[key] = typeof obj[key] === 'string'\n      ? defaultToFunction(obj[key])\n      : toFunction(obj[key])\n  }\n  return function(val){\n    if (typeof val !== 'object') return false;\n    for (var key in match) {\n      if (!(key in val)) return false;\n      if (!match[key](val[key])) return false;\n    }\n    return true;\n  }\n}\n//@ sourceURL=component-to-function/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n/**\n * toString ref.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Return the type of `val`.\n *\n * @param {Mixed} val\n * @return {String}\n * @api public\n */\n\nmodule.exports = function(val){\n  switch (toString.call(val)) {\n    case '[object Function]': return 'function';\n    case '[object Date]': return 'date';\n    case '[object RegExp]': return 'regexp';\n    case '[object Arguments]': return 'arguments';\n    case '[object Array]': return 'array';\n    case '[object String]': return 'string';\n  }\n\n  if (val === null) return 'null';\n  if (val === undefined) return 'undefined';\n  if (val && val.nodeType === 1) return 'element';\n  if (val === Object(val)) return 'object';\n\n  return typeof val;\n};\n//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar toFunction = require('to-function');\nvar type;\n\ntry {\n  type = require('type-component');\n} catch (e) {\n  type = require('type');\n}\n\n/**\n * HOP reference.\n */\n\nvar has = Object.prototype.hasOwnProperty;\n\n/**\n * Iterate the given `obj` and invoke `fn(val, i)`.\n *\n * @param {String|Array|Object} obj\n * @param {Function} fn\n * @api public\n */\n\nmodule.exports = function(obj, fn){\n  fn = toFunction(fn);\n  switch (type(obj)) {\n    case 'array':\n      return array(obj, fn);\n    case 'object':\n      if ('number' == typeof obj.length) return array(obj, fn);\n      return object(obj, fn);\n    case 'string':\n      return string(obj, fn);\n  }\n};\n\n/**\n * Iterate string chars.\n *\n * @param {String} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction string(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj.charAt(i), i);\n  }\n}\n\n/**\n * Iterate object keys.\n *\n * @param {Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction object(obj, fn) {\n  for (var key in obj) {\n    if (has.call(obj, key)) {\n      fn(key, obj[key]);\n    }\n  }\n}\n\n/**\n * Iterate array-ish.\n *\n * @param {Array|Object} obj\n * @param {Function} fn\n * @api private\n */\n\nfunction array(obj, fn) {\n  for (var i = 0; i < obj.length; ++i) {\n    fn(obj[i], i);\n  }\n}\n//@ sourceURL=component-each/index.js"
));
require.register("yields-indexof/index.js", Function("exports, require, module",
"\n/**\n * indexof\n */\n\nvar indexof = [].indexOf;\n\n/**\n * Get the index of the given `el`.\n *\n * @param {Element} el\n * @return {Number}\n */\n\nmodule.exports = function(el){\n  if (!el.parentNode) return -1;\n\n  var list = el.parentNode.children\n    , len = list.length;\n\n  if (indexof) return indexof.call(list, el);\n  for (var i = 0; i < len; ++i) {\n    if (el == list[i]) return i;\n  }\n  return -1;\n};\n//@ sourceURL=yields-indexof/index.js"
));
require.register("chemzqm-sortable/index.js", Function("exports, require, module",
"/**\n * dependencies\n */\n\nvar matches = require('matches-selector')\n  , emitter = require('emitter')\n  , classes = require('classes')\n  , events = require('events')\n  , indexof = require('indexof')\n  , each = require('each');\n\n/**\n * export `Sortable`\n */\n\nmodule.exports = Sortable;\n\n/**\n * Initialize `Sortable` with `el`.\n *\n * @param {Element} el\n */\n\nfunction Sortable(el){\n  if (!(this instanceof Sortable)) return new Sortable(el);\n  if (!el) throw new TypeError('sortable(): expects an element');\n  this.events = events(el, this);\n  this.el = el;\n}\n\n/**\n * Mixins.\n */\n\nemitter(Sortable.prototype);\n\n/**\n * Ignore items that don't match `selector`.\n *\n * @param {String} selector\n * @return {Sortable}\n * @api public\n */\n\nSortable.prototype.ignore = function(selector){\n  this.ignored = selector;\n  return this;\n}\n\n/**\n * Set handle to `selector`.\n *\n * @param {String} selector\n * @return {Sortable}\n * @api public\n */\n\nSortable.prototype.handle = function(selector){\n  this._handle = selector;\n  return this;\n}\n\nSortable.prototype.bind = function (selector){\n  this.selector = selector || '';\n  this.events.bind('mousedown');\n  this.events.bind('mouseup');\n}\n\nSortable.prototype.onmousedown = function(e) {\n  if (this._handle) {\n    this.match = matches(e.target, this._handle);\n  }\n  this.reset();\n  this.draggable = up(e.target, this.selector, this.el);\n  if (!this.draggable) return;\n  this.draggable.draggable = true;\n  this.events.bind('dragstart');\n  this.events.bind('dragover');\n  this.events.bind('dragenter');\n  this.events.bind('dragend');\n  this.events.bind('drop');\n  this.clone = this.draggable.cloneNode(false);\n  classes(this.clone).add('sortable-placeholder');\n  return this;\n}\n\nSortable.prototype.onmouseup = function(e) {\n  this.reset();\n}\n\nSortable.prototype.remove = function() {\n  this.events.unbind();\n  this.off();\n}\n\n\n/**\n * on-dragstart\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragstart = function(e){\n  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();\n  if (this._handle && !this.match) return e.preventDefault();\n  var target = this.draggable;\n  this.display = window.getComputedStyle(target).display;\n  this.i = indexof(target);\n  e.dataTransfer.setData('text', ' ');\n  e.dataTransfer.effectAllowed = 'move';\n  classes(target).add('dragging');\n  this.emit('start', e);\n}\n\n/**\n * on-dragover\n * on-dragenter\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragenter =\nSortable.prototype.ondragover = function(e){\n  var el = e.target\n    , next\n    , ci\n    , i;\n\n  e.preventDefault();\n  if (!this.draggable || el == this.el) return;\n  e.dataTransfer.dropEffect = 'move';\n  this.draggable.style.display = 'none';\n\n  // parent\n  while (el.parentElement != this.el) el = el.parentElement;\n  next = el;\n  ci = indexof(this.clone);\n  i = indexof(el);\n  if (ci < i) next = el.nextElementSibling;\n  if (this.ignored && matches(el, this.ignored)) return;\n  this.el.insertBefore(this.clone, next);\n}\n\n\n/**\n * on-dragend\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragend = function(e){\n  if (!this.draggable) return;\n  if (this.clone) remove(this.clone);\n  this.draggable.style.display = this.display;\n  classes(this.draggable).remove('dragging');\n  if (this.i == indexof(this.draggable)) return;\n  this.emit('update');\n}\n\n/**\n * on-drop\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondrop = function(e){\n  e.stopPropagation();\n  this.el.insertBefore(this.draggable, this.clone);\n  this.ondragend(e);\n  this.emit('drop', e);\n  this.reset();\n}\n\n/**\n * Reset sortable.\n *\n * @api private\n * @return {Sortable}\n * @api private\n */\n\nSortable.prototype.reset = function(){\n  if (this.draggable) {\n    this.draggable.draggable = false;\n    this.draggable = null;\n  }\n  this.display = null;\n  this.i = null;\n\n  this.events.unbind('dragstart');\n  this.events.unbind('dragover');\n  this.events.unbind('dragenter');\n  this.events.unbind('dragend');\n  this.events.unbind('drop');\n}\n\n/**\n * Remove the given `el`.\n *\n * @param {Element} el\n * @return {Element}\n * @api private\n */\n\nfunction remove (el) {\n  if (!el.parentNode) return;\n  el.parentNode.removeChild(el);\n}\n\nfunction up (node, selector, container) {\n  do {\n    if (matches(node, selector)) {\n      return node;\n    }\n    node = node.parentNode;\n  } while (node !== container);\n}\n//@ sourceURL=chemzqm-sortable/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n/**\n * Expose `parse`.\n */\n\nmodule.exports = parse;\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\n/**\n * Parse `html` and return the children.\n *\n * @param {String} html\n * @return {Array}\n * @api private\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n\n  // tag name\n  var m = /<([\\w:]+)/.exec(html);\n  if (!m) throw new Error('No elements were generated.');\n  var tag = m[1];\n\n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return el.removeChild(el.lastChild);\n  }\n\n  // wrap map\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  var el = document.createElement('div');\n  el.innerHTML = prefix + html + suffix;\n  while (depth--) el = el.lastChild;\n\n  var els = el.children;\n  if (1 == els.length) {\n    return el.removeChild(els[0]);\n  }\n\n  var fragment = document.createDocumentFragment();\n  while (els.length) {\n    fragment.appendChild(el.removeChild(els[0]));\n  }\n\n  return fragment;\n}\n//@ sourceURL=component-domify/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n/**\n * Properties to ignore appending \"px\".\n */\n\nvar ignore = {\n  columnCount: true,\n  fillOpacity: true,\n  fontWeight: true,\n  lineHeight: true,\n  opacity: true,\n  orphans: true,\n  widows: true,\n  zIndex: true,\n  zoom: true\n};\n\n/**\n * Set `el` css values.\n *\n * @param {Element} el\n * @param {Object} obj\n * @return {Element}\n * @api public\n */\n\nmodule.exports = function(el, obj){\n  for (var key in obj) {\n    var val = obj[key];\n    if ('number' == typeof val && !ignore[key]) val += 'px';\n    el.style[key] = val;\n  }\n  return el;\n};\n//@ sourceURL=component-css/index.js"
));
require.register("component-sort/index.js", Function("exports, require, module",
"\n/**\n * Expose `sort`.\n */\n\nexports = module.exports = sort;\n\n/**\n * Sort `el`'s children with the given `fn(a, b)`.\n *\n * @param {Element} el\n * @param {Function} fn\n * @api public\n */\n\nfunction sort(el, fn) {\n  var arr = [].slice.call(el.children).sort(fn);\n  var frag = document.createDocumentFragment();\n  for (var i = 0; i < arr.length; i++) {\n    frag.appendChild(arr[i]);\n  }\n  el.appendChild(frag);\n};\n\n/**\n * Sort descending.\n *\n * @param {Element} el\n * @param {Function} fn\n * @api public\n */\n\nexports.desc = function(el, fn){\n  sort(el, function(a, b){\n    return ~fn(a, b) + 1;\n  });\n};\n\n/**\n * Sort ascending.\n */\n\nexports.asc = sort;\n//@ sourceURL=component-sort/index.js"
));
require.register("component-value/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar typeOf = require('type');\n\n/**\n * Set or get `el`'s' value.\n *\n * @param {Element} el\n * @param {Mixed} val\n * @return {Mixed}\n * @api public\n */\n\nmodule.exports = function(el, val){\n  if (2 == arguments.length) return set(el, val);\n  return get(el);\n};\n\n/**\n * Get `el`'s value.\n */\n\nfunction get(el) {\n  switch (type(el)) {\n    case 'checkbox':\n    case 'radio':\n      if (el.checked) {\n        var attr = el.getAttribute('value');\n        return null == attr ? true : attr;\n      } else {\n        return false;\n      }\n    case 'radiogroup':\n      for (var i = 0, radio; radio = el[i]; i++) {\n        if (radio.checked) return radio.value;\n      }\n      break;\n    case 'select':\n      for (var i = 0, option; option = el.options[i]; i++) {\n        if (option.selected) return option.value;\n      }\n      break;\n    default:\n      return el.value;\n  }\n}\n\n/**\n * Set `el`'s value.\n */\n\nfunction set(el, val) {\n  switch (type(el)) {\n    case 'checkbox':\n    case 'radio':\n      if (val) {\n        el.checked = true;\n      } else {\n        el.checked = false;\n      }\n      break;\n    case 'radiogroup':\n      for (var i = 0, radio; radio = el[i]; i++) {\n        radio.checked = radio.value === val;\n      }\n      break;\n    case 'select':\n      for (var i = 0, option; option = el.options[i]; i++) {\n        option.selected = option.value === val;\n      }\n      break;\n    default:\n      el.value = val;\n  }\n}\n\n/**\n * Element type.\n */\n\nfunction type(el) {\n  var group = 'array' == typeOf(el) || 'object' == typeOf(el);\n  if (group) el = el[0];\n  var name = el.nodeName.toLowerCase();\n  var type = el.getAttribute('type');\n\n  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';\n  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';\n  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';\n  if ('select' == name) return 'select';\n  return name;\n}\n//@ sourceURL=component-value/index.js"
));
require.register("component-dom/index.js", Function("exports, require, module",
"/**\n * Module dependencies.\n */\n\nvar delegate = require('delegate');\nvar classes = require('classes');\nvar indexof = require('indexof');\nvar domify = require('domify');\nvar events = require('event');\nvar value = require('value');\nvar query = require('query');\nvar type = require('type');\nvar css = require('css');\n\n/**\n * Attributes supported.\n */\n\nvar attrs = [\n  'id',\n  'src',\n  'rel',\n  'cols',\n  'rows',\n  'type',\n  'name',\n  'href',\n  'title',\n  'style',\n  'width',\n  'height',\n  'action',\n  'method',\n  'tabindex',\n  'placeholder'\n];\n\n/**\n * Expose `dom()`.\n */\n\nexports = module.exports = dom;\n\n/**\n * Expose supported attrs.\n */\n\nexports.attrs = attrs;\n\n/**\n * Return a dom `List` for the given\n * `html`, selector, or element.\n *\n * @param {String|Element|List}\n * @return {List}\n * @api public\n */\n\nfunction dom(selector, context) {\n  // array\n  if (Array.isArray(selector)) {\n    return new List(selector);\n  }\n\n  // List\n  if (selector instanceof List) {\n    return selector;\n  }\n\n  // node\n  if (selector.nodeName) {\n    return new List([selector]);\n  }\n\n  if ('string' != typeof selector) {\n    throw new TypeError('invalid selector');\n  }\n\n  // html\n  if ('<' == selector.charAt(0)) {\n    return new List([domify(selector)], selector);\n  }\n\n  // selector\n  var ctx = context\n    ? (context.els ? context.els[0] : context)\n    : document;\n\n  return new List(query.all(selector, ctx), selector);\n}\n\n/**\n * Expose `List` constructor.\n */\n\nexports.List = List;\n\n/**\n * Initialize a new `List` with the\n * given array-ish of `els` and `selector`\n * string.\n *\n * @param {Mixed} els\n * @param {String} selector\n * @api private\n */\n\nfunction List(els, selector) {\n  this.els = els || [];\n  this.selector = selector;\n}\n\n/**\n * Enumerable iterator.\n */\n\nList.prototype.__iterate__ = function(){\n  var self = this;\n  return {\n    length: function(){ return self.els.length },\n    get: function(i){ return new List([self.els[i]]) }\n  }\n};\n\n/**\n * Remove elements from the DOM.\n *\n * @api public\n */\n\nList.prototype.remove = function(){\n  for (var i = 0; i < this.els.length; i++) {\n    var el = this.els[i];\n    var parent = el.parentNode;\n    if (parent) parent.removeChild(el);\n  }\n};\n\n/**\n * Set attribute `name` to `val`, or get attr `name`.\n *\n * @param {String} name\n * @param {String} [val]\n * @return {String|List} self\n * @api public\n */\n\nList.prototype.attr = function(name, val){\n  // get\n  if (1 == arguments.length) {\n    return this.els[0] && this.els[0].getAttribute(name);\n  }\n\n  // remove\n  if (null == val) {\n    return this.removeAttr(name);\n  }\n\n  // set\n  return this.forEach(function(el){\n    el.setAttribute(name, val);\n  });\n};\n\n/**\n * Remove attribute `name`.\n *\n * @param {String} name\n * @return {List} self\n * @api public\n */\n\nList.prototype.removeAttr = function(name){\n  return this.forEach(function(el){\n    el.removeAttribute(name);\n  });\n};\n\n/**\n * Set property `name` to `val`, or get property `name`.\n *\n * @param {String} name\n * @param {String} [val]\n * @return {Object|List} self\n * @api public\n */\n\nList.prototype.prop = function(name, val){\n  if (1 == arguments.length) {\n    return this.els[0] && this.els[0][name];\n  }\n\n  return this.forEach(function(el){\n    el[name] = val;\n  });\n};\n\n/**\n * Get the first element's value or set selected\n * element values to `val`.\n *\n * @param {Mixed} [val]\n * @return {Mixed}\n * @api public\n */\n\nList.prototype.val =\nList.prototype.value = function(val){\n  if (0 == arguments.length) {\n    return this.els[0]\n      ? value(this.els[0])\n      : undefined;\n  }\n\n  return this.forEach(function(el){\n    value(el, val);\n  });\n};\n\n/**\n * Return a cloned `List` with all elements cloned.\n *\n * @return {List}\n * @api public\n */\n\nList.prototype.clone = function(){\n  var arr = [];\n  for (var i = 0, len = this.els.length; i < len; ++i) {\n    arr.push(this.els[i].cloneNode(true));\n  }\n  return new List(arr);\n};\n\n/**\n * Prepend `val`.\n *\n * @param {String|Element|List} val\n * @return {List} new list\n * @api public\n */\n\nList.prototype.prepend = function(val){\n  var el = this.els[0];\n  if (!el) return this;\n  val = dom(val);\n  for (var i = 0; i < val.els.length; ++i) {\n    if (el.children.length) {\n      el.insertBefore(val.els[i], el.firstChild);\n    } else {\n      el.appendChild(val.els[i]);\n    }\n  }\n  return val;\n};\n\n/**\n * Append `val`.\n *\n * @param {String|Element|List} val\n * @return {List} new list\n * @api public\n */\n\nList.prototype.append = function(val){\n  var el = this.els[0];\n  if (!el) return this;\n  val = dom(val);\n  for (var i = 0; i < val.els.length; ++i) {\n    el.appendChild(val.els[i]);\n  }\n  return val;\n};\n\n/**\n * Append self's `el` to `val`\n *\n * @param {String|Element|List} val\n * @return {List} self\n * @api public\n */\n\nList.prototype.appendTo = function(val){\n  dom(val).append(this);\n  return this;\n};\n\n/**\n * Insert self's `els` after `val`\n *\n * @param {String|Element|List} val\n * @return {List} self\n * @api public\n */\n\nList.prototype.insertAfter = function(val){\n  val = dom(val).els[0];\n  if (!val || !val.parentNode) return this;\n  this.els.forEach(function(el){\n    val.parentNode.insertBefore(el, val.nextSibling);\n  });\n  return this;\n};\n\n/**\n * Return a `List` containing the element at `i`.\n *\n * @param {Number} i\n * @return {List}\n * @api public\n */\n\nList.prototype.at = function(i){\n  return new List([this.els[i]], this.selector);\n};\n\n/**\n * Return a `List` containing the first element.\n *\n * @param {Number} i\n * @return {List}\n * @api public\n */\n\nList.prototype.first = function(){\n  return new List([this.els[0]], this.selector);\n};\n\n/**\n * Return a `List` containing the last element.\n *\n * @param {Number} i\n * @return {List}\n * @api public\n */\n\nList.prototype.last = function(){\n  return new List([this.els[this.els.length - 1]], this.selector);\n};\n\n/**\n * Return an `Element` at `i`.\n *\n * @param {Number} i\n * @return {Element}\n * @api public\n */\n\nList.prototype.get = function(i){\n  return this.els[i || 0];\n};\n\n/**\n * Return list length.\n *\n * @return {Number}\n * @api public\n */\n\nList.prototype.length = function(){\n  return this.els.length;\n};\n\n/**\n * Return element text.\n *\n * @param {String} str\n * @return {String|List}\n * @api public\n */\n\nList.prototype.text = function(str){\n  // TODO: real impl\n  if (1 == arguments.length) {\n    this.forEach(function(el){\n      el.textContent = str;\n    });\n    return this;\n  }\n\n  var str = '';\n  for (var i = 0; i < this.els.length; ++i) {\n    str += this.els[i].textContent;\n  }\n  return str;\n};\n\n/**\n * Return element html.\n *\n * @return {String} html\n * @api public\n */\n\nList.prototype.html = function(html){\n  if (1 == arguments.length) {\n    this.forEach(function(el){\n      el.innerHTML = html;\n    });\n  }\n  // TODO: real impl\n  return this.els[0] && this.els[0].innerHTML;\n};\n\n/**\n * Bind to `event` and invoke `fn(e)`. When\n * a `selector` is given then events are delegated.\n *\n * @param {String} event\n * @param {String} [selector]\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {List}\n * @api public\n */\n\nList.prototype.on = function(event, selector, fn, capture){\n  if ('string' == typeof selector) {\n    for (var i = 0; i < this.els.length; ++i) {\n      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);\n    }\n    return this;\n  }\n\n  capture = fn;\n  fn = selector;\n\n  for (var i = 0; i < this.els.length; ++i) {\n    events.bind(this.els[i], event, fn, capture);\n  }\n\n  return this;\n};\n\n/**\n * Unbind to `event` and invoke `fn(e)`. When\n * a `selector` is given then delegated event\n * handlers are unbound.\n *\n * @param {String} event\n * @param {String} [selector]\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {List}\n * @api public\n */\n\nList.prototype.off = function(event, selector, fn, capture){\n  if ('string' == typeof selector) {\n    for (var i = 0; i < this.els.length; ++i) {\n      // TODO: add selector support back\n      delegate.unbind(this.els[i], event, fn._delegate, capture);\n    }\n    return this;\n  }\n\n  capture = fn;\n  fn = selector;\n\n  for (var i = 0; i < this.els.length; ++i) {\n    events.unbind(this.els[i], event, fn, capture);\n  }\n  return this;\n};\n\n/**\n * Iterate elements and invoke `fn(list, i)`.\n *\n * @param {Function} fn\n * @return {List} self\n * @api public\n */\n\nList.prototype.each = function(fn){\n  for (var i = 0; i < this.els.length; ++i) {\n    fn(new List([this.els[i]], this.selector), i);\n  }\n  return this;\n};\n\n/**\n * Iterate elements and invoke `fn(el, i)`.\n *\n * @param {Function} fn\n * @return {List} self\n * @api public\n */\n\nList.prototype.forEach = function(fn){\n  for (var i = 0; i < this.els.length; ++i) {\n    fn(this.els[i], i);\n  }\n  return this;\n};\n\n/**\n * Map elements invoking `fn(list, i)`.\n *\n * @param {Function} fn\n * @return {Array}\n * @api public\n */\n\nList.prototype.map = function(fn){\n  var arr = [];\n  for (var i = 0; i < this.els.length; ++i) {\n    arr.push(fn(new List([this.els[i]], this.selector), i));\n  }\n  return arr;\n};\n\n/**\n * Filter elements invoking `fn(list, i)`, returning\n * a new `List` of elements when a truthy value is returned.\n *\n * @param {Function} fn\n * @return {List}\n * @api public\n */\n\nList.prototype.select =\nList.prototype.filter = function(fn){\n  var el;\n  var list = new List([], this.selector);\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    if (fn(new List([el], this.selector), i)) list.els.push(el);\n  }\n  return list;\n};\n\n/**\n * Filter elements invoking `fn(list, i)`, returning\n * a new `List` of elements when a falsey value is returned.\n *\n * @param {Function} fn\n * @return {List}\n * @api public\n */\n\nList.prototype.reject = function(fn){\n  var el;\n  var list = new List([], this.selector);\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    if (!fn(new List([el], this.selector), i)) list.els.push(el);\n  }\n  return list;\n};\n\n/**\n * Add the given class `name`.\n *\n * @param {String} name\n * @return {List} self\n * @api public\n */\n\nList.prototype.addClass = function(name){\n  var el;\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    el._classes = el._classes || classes(el);\n    el._classes.add(name);\n  }\n  return this;\n};\n\n/**\n * Remove the given class `name`.\n *\n * @param {String|RegExp} name\n * @return {List} self\n * @api public\n */\n\nList.prototype.removeClass = function(name){\n  var el;\n\n  if ('regexp' == type(name)) {\n    for (var i = 0; i < this.els.length; ++i) {\n      el = this.els[i];\n      el._classes = el._classes || classes(el);\n      var arr = el._classes.array();\n      for (var j = 0; j < arr.length; j++) {\n        if (name.test(arr[j])) {\n          el._classes.remove(arr[j]);\n        }\n      }\n    }\n    return this;\n  }\n\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    el._classes = el._classes || classes(el);\n    el._classes.remove(name);\n  }\n\n  return this;\n};\n\n/**\n * Toggle the given class `name`,\n * optionally a `bool` may be given\n * to indicate that the class should\n * be added when truthy.\n *\n * @param {String} name\n * @param {Boolean} bool\n * @return {List} self\n * @api public\n */\n\nList.prototype.toggleClass = function(name, bool){\n  var el;\n  var fn = 'toggle';\n\n  // toggle with boolean\n  if (2 == arguments.length) {\n    fn = bool ? 'add' : 'remove';\n  }\n\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    el._classes = el._classes || classes(el);\n    el._classes[fn](name);\n  }\n\n  return this;\n};\n\n/**\n * Check if the given class `name` is present.\n *\n * @param {String} name\n * @return {Boolean}\n * @api public\n */\n\nList.prototype.hasClass = function(name){\n  var el;\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    el._classes = el._classes || classes(el);\n    if (el._classes.has(name)) return true;\n  }\n  return false;\n};\n\n/**\n * Set CSS `prop` to `val` or get `prop` value.\n * Also accepts an object (`prop`: `val`)\n *\n * @param {String} prop\n * @param {Mixed} val\n * @return {List|String}\n * @api public\n */\n\nList.prototype.css = function(prop, val){\n  if (2 == arguments.length) {\n    var obj = {};\n    obj[prop] = val;\n    return this.setStyle(obj);\n  }\n\n  if ('object' == type(prop)) {\n    return this.setStyle(prop);\n  }\n\n  return this.getStyle(prop);\n};\n\n/**\n * Set CSS `props`.\n *\n * @param {Object} props\n * @return {List} self\n * @api private\n */\n\nList.prototype.setStyle = function(props){\n  for (var i = 0; i < this.els.length; ++i) {\n    css(this.els[i], props);\n  }\n  return this;\n};\n\n/**\n * Get CSS `prop` value.\n *\n * @param {String} prop\n * @return {String}\n * @api private\n */\n\nList.prototype.getStyle = function(prop){\n  var el = this.els[0];\n  if (el) return el.style[prop];\n};\n\n/**\n * Find children matching the given `selector`.\n *\n * @param {String} selector\n * @return {List}\n * @api public\n */\n\nList.prototype.find = function(selector){\n  return dom(selector, this);\n};\n\n/**\n * Empty the dom list\n *\n * @return self\n * @api public\n */\n\nList.prototype.empty = function(){\n  var elem, el;\n\n  for (var i = 0; i < this.els.length; ++i) {\n    el = this.els[i];\n    while (el.firstChild) {\n      el.removeChild(el.firstChild);\n    }\n  }\n\n  return this;\n}\n\n/**\n * Attribute accessors.\n */\n\nattrs.forEach(function(name){\n  List.prototype[name] = function(val){\n    if (0 == arguments.length) return this.attr(name);\n    return this.attr(name, val);\n  };\n});\n\n//@ sourceURL=component-dom/index.js"
));
require.register("sortable-example/index.js", Function("exports, require, module",
"/**\n * dependencies\n */\n\nvar matches = require('matches-selector')\n  , emitter = require('emitter')\n  , classes = require('classes')\n  , events = require('events')\n  , indexof = require('indexof')\n  , each = require('each');\n\n/**\n * export `Sortable`\n */\n\nmodule.exports = Sortable;\n\n/**\n * Initialize `Sortable` with `el`.\n *\n * @param {Element} el\n */\n\nfunction Sortable(el){\n  if (!(this instanceof Sortable)) return new Sortable(el);\n  if (!el) throw new TypeError('sortable(): expects an element');\n  this.events = events(el, this);\n  this.el = el;\n}\n\n/**\n * Mixins.\n */\n\nemitter(Sortable.prototype);\n\n/**\n * Ignore items that don't match `selector`.\n *\n * @param {String} selector\n * @return {Sortable}\n * @api public\n */\n\nSortable.prototype.ignore = function(selector){\n  this.ignored = selector;\n  return this;\n}\n\n/**\n * Set handle to `selector`.\n *\n * @param {String} selector\n * @return {Sortable}\n * @api public\n */\n\nSortable.prototype.handle = function(selector){\n  this._handle = selector;\n  return this;\n}\n\nSortable.prototype.bind = function (selector){\n  this.selector = selector || '';\n  this.events.bind('mousedown');\n  this.events.bind('mouseup');\n}\n\nSortable.prototype.onmousedown = function(e) {\n  if (this._handle) {\n    this.match = matches(e.target, this._handle);\n  }\n  this.reset();\n  this.draggable = up(e.target, this.selector, this.el);\n  if (!this.draggable) return;\n  this.draggable.draggable = true;\n  this.events.bind('dragstart');\n  this.events.bind('dragover');\n  this.events.bind('dragenter');\n  this.events.bind('dragend');\n  this.events.bind('drop');\n  this.clone = this.draggable.cloneNode(false);\n  classes(this.clone).add('sortable-placeholder');\n  return this;\n}\n\nSortable.prototype.onmouseup = function(e) {\n  this.reset();\n}\n\nSortable.prototype.remove = function() {\n  this.events.unbind();\n}\n\n\n/**\n * on-dragstart\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragstart = function(e){\n  if (this.ignored && matches(e.target, this.ignored)) return e.preventDefault();\n  if (this._handle && !this.match) return e.preventDefault();\n  var target = this.draggable;\n  this.display = window.getComputedStyle(target).display;\n  this.i = indexof(target);\n  e.dataTransfer.setData('text', ' ');\n  e.dataTransfer.effectAllowed = 'move';\n  classes(target).add('dragging');\n  this.emit('start', e);\n}\n\n/**\n * on-dragover\n * on-dragenter\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragenter =\nSortable.prototype.ondragover = function(e){\n  var el = e.target\n    , next\n    , ci\n    , i;\n\n  e.preventDefault();\n  if (!this.draggable || el == this.el) return;\n  e.dataTransfer.dropEffect = 'move';\n  this.draggable.style.display = 'none';\n\n  // parent\n  while (el.parentElement != this.el) el = el.parentElement;\n  next = el;\n  ci = indexof(this.clone);\n  i = indexof(el);\n  if (ci < i) next = el.nextElementSibling;\n  if (this.ignored && matches(el, this.ignored)) return;\n  this.el.insertBefore(this.clone, next);\n}\n\n\n/**\n * on-dragend\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondragend = function(e){\n  if (!this.draggable) return;\n  if (this.clone) remove(this.clone);\n  this.draggable.style.display = this.display;\n  classes(this.draggable).remove('dragging');\n  if (this.i == indexof(this.draggable)) return;\n  this.emit('update');\n}\n\n/**\n * on-drop\n *\n * @param {Event} e\n * @api private\n */\n\nSortable.prototype.ondrop = function(e){\n  e.stopPropagation();\n  this.el.insertBefore(this.draggable, this.clone);\n  this.ondragend(e);\n  this.emit('drop', e);\n  this.reset();\n}\n\n/**\n * Reset sortable.\n *\n * @api private\n * @return {Sortable}\n * @api private\n */\n\nSortable.prototype.reset = function(){\n  if (this.draggable) {\n    this.draggable.draggable = false;\n    this.draggable = null;\n  }\n  this.display = null;\n  this.i = null;\n\n  this.events.unbind('dragstart');\n  this.events.unbind('dragover');\n  this.events.unbind('dragenter');\n  this.events.unbind('dragend');\n  this.events.unbind('drop');\n}\n\n/**\n * Remove the given `el`.\n *\n * @param {Element} el\n * @return {Element}\n * @api private\n */\n\nfunction remove (el) {\n  if (!el.parentNode) return;\n  el.parentNode.removeChild(el);\n}\n\nfunction up (node, selector, container) {\n  do {\n    if (matches(node, selector)) {\n      return node;\n    }\n    node = node.parentNode;\n  } while (node !== container);\n}\n//@ sourceURL=sortable-example/index.js"
));
require.alias("chemzqm-sortable/index.js", "sortable-example/deps/sortable/index.js");
require.alias("chemzqm-sortable/index.js", "sortable-example/deps/sortable/index.js");
require.alias("chemzqm-sortable/index.js", "sortable/index.js");
require.alias("component-matches-selector/index.js", "chemzqm-sortable/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-emitter/index.js", "chemzqm-sortable/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "chemzqm-sortable/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-classes/index.js", "chemzqm-sortable/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-each/index.js", "chemzqm-sortable/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("yields-indexof/index.js", "chemzqm-sortable/deps/indexof/index.js");
require.alias("yields-indexof/index.js", "chemzqm-sortable/deps/indexof/index.js");
require.alias("yields-indexof/index.js", "yields-indexof/index.js");

require.alias("chemzqm-sortable/index.js", "chemzqm-sortable/index.js");

require.alias("component-dom/index.js", "sortable-example/deps/dom/index.js");
require.alias("component-dom/index.js", "dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");

require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("sortable-example/index.js", "sortable-example/index.js");

