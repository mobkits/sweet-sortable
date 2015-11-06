var styles = require('computed-style')
var transform = require('transform-property')
var has3d = require('has-translate3d')
var transition = require('transition-property')

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
  var res = 0
  if (x > rect.left && x < rect.left + w && y > rect.top && y < rect.top + h) {
    res = res + 1
    // lt lb rt rb
    if (x >= rect.left + w/2) {
      res = res + 1
    }
    if (y >= rect.top + h/2) {
      res = res + 2
    }
  }
  return res
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

exports.makeAbsolute = function (el, pel) {
  var pos = getAbsolutePosition(el, pel)
  var orig = copy(el.style, {
    height: pos.height + 'px',
    width: pos.width + 'px',
    left: pos.left + 'px',
    top: pos.top + 'px',
    position: 'absolute'
  })
  return orig
}

var doc = document.documentElement
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

var insertAfter = exports.insertAfter = function (newNode, ref) {
  if (ref.nextSibling) {
    ref.parentNode.insertBefore(newNode, ref.nextSibling)
  } else {
    ref.parentNode.appendChild(newNode)
  }
}

var copy = exports.copy = function (to, from) {
  var orig = {}
  Object.keys(from).forEach(function (k) {
    orig[k] = to[k]
    to[k] = from[k]
  })
  return orig
}

exports.indexof = function (el) {
  var children = el.parentNode.children
  for (var i = children.length - 1; i >= 0; i--) {
    var node = children[i];
    if (node === el) {
      return i
    }
  }
}

exports.transit = function (newNode, ref, position) {
  var rect = ref.getBoundingClientRect()
  var h = rect.height
  // var w = rect.width || newNode.clientWidth
  newNode.style.height = h + 'px'
  // var node = newNode.cloneNode(false)
  //console.log(styles(node, 'height'))
  //console.log(h/2)
  if (position === 'before') {
    ref.parentNode.insertBefore(newNode, ref)
  } else {
    insertAfter(newNode, ref)
  }
  return newNode
}

/**
 * Translate to `x` `y`.
 *
 * @api private
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

var prefix = transition.replace('transition', '').toLowerCase()
exports.transitionDuration = function(el, ms){
  var s = el.style;
  if (!prefix) {
    s[transition] = ms + 'ms transform linear'
  } else {
    s[transition] = ms + 'ms -' + prefix + '-transform linear'
  }
}
