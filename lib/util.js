var styles = require('computed-style')
var transform = require('transform-property')
var has3d = require('has-translate3d')
var transition = require('transition-property')
var touchAction = require('touchaction-property')

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
    s[transform] = 'translateX(' + x + 'px),translateY(' + y + 'px)'
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

exports.getChildElements = function (el) {
  var nodes = el.childNodes
  var arr = []
  for (var i = 0, l = nodes.length; i < l; i++) {
    var n = nodes[i]
    if (n.nodeType === 1) {
      arr.push(n)
    }
  }
  return arr
}