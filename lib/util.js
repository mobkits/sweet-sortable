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
  } while(el)
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
    width: r.width || el.offsetWidth,
    height: r.height || el.offsetHeight
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
  while(el) {
    if (el === doc) return el
    var p = styles(el, 'position')
    if (p === 'absolute' || p === 'fixed' || p === 'relative') {
      return el
    }
    el = el.parentNode
  }
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

exports.getDistance = function (from, to, dir) {
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

/**
 * Set transition duration to `ms`
 *
 * @param  {Element}  el
 * @param {Number} ms
 * @api public
 */
var prefix = transition.replace(/transition/i, '').toLowerCase()
exports.transitionDuration = function(el, ms, ease){
  var s = el.style;
  ease = ease || 'ease-in-out'
  if (!prefix) {
    s[transition] = ms + 'ms transform ' + ease
  } else {
    s[transition] = ms + 'ms -' + prefix + '-transform ' + ease
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

exports.locateNode = function (parentNode, x, y, dir) {
  var rightDown = dir < 2
  var horizon = dir%2 === 1
  var node = rightDown ? parentNode.firstChild : parentNode.lastChild
  var prop = rightDown ? 'nextSibling': 'previousSibling'
  while(node) {
    if (node.nodeType !== 1) {
      node = node[prop]
      continue
    }
    var r = node.getBoundingClientRect()
    if (dir === 0 && y < r.top) break
    if (dir === 1 && x < r.left) break
    if (dir === 2 && y > r.bottom) break
    if (dir === 3 && x > r.right) break
    if (horizon && x > r.left && x < r.right) return node
    if (!horizon && y > r.top && y < r.bottom) return node
    node = node[prop]
  }
}

exports.inside = function (node, x, y) {
  var r = node.getBoundingClientRect()
  if (x > r.left && x < (r.left + r.width) && y > r.top && y < (r.top + r.bottom)) {
    return true
  }
  return false
}
