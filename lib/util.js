var styles = require('computed-style')

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
 * Get absolute left top
 *
 * @param  {Element}  el
 * @param {Element} pel
 * @return {Object}
 * @api public
 */
exports.getAbsolutePosition = function (el, pel) {
  var r = el.getBoundingClientRect()
  var rect = pel.getBoundingClientRect()
  return {
    left: r.left - rect.left,
    top: r.top -rect.top
  }
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

exports.insertAfter = function (newNode, ref) {
  if (ref.nextSibling) {
    ref.parentNode.insertBefore(newNode, ref.nextSibling)
  } else {
    ref.parentNode.appendChild(newNode)
  }
}

exports.assign = function (to, from) {
  Object.keys(from).forEach(function (k) {
    to[k] = from[k]
  })
  return to
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
