var styles = require('computed-style')
var Tween = require('tween')
var raf = require('raf')

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
exports.getAbsolutePosition = function (el, pel) {
  var r = el.getBoundingClientRect()
  var rect = pel.getBoundingClientRect()
  return {
    left: r.left - rect.left,
    top: r.top -rect.top,
    width: r.width || el.chientWidth,
    height: r.height || el.clientHeight
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

var insertAfter = exports.insertAfter = function (newNode, ref) {
  if (ref.nextSibling) {
    ref.parentNode.insertBefore(newNode, ref.nextSibling)
  } else {
    ref.parentNode.appendChild(newNode)
  }
}

exports.copy = function (to, from) {
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
  newNode.style.height = h/2 + 'px'
  // var node = newNode.cloneNode(false)
  //console.log(styles(node, 'height'))
  //console.log(h/2)
  if (position === 'before') {
    ref.parentNode.insertBefore(newNode, ref)
  } else {
    insertAfter(newNode, ref)
  }
  // remove
  //var t = transition(newNode, node, h/2)
  //t.on('end', function () {
  //  newNode.parentNode.removeChild(newNode)
  //})
  return newNode
}

function transition(one, two, half) {
  var tween = Tween({h: 0})
  .ease('out-quad')
  .to({h: half})
  .duration(10)

  tween.update(function(o){
    one.style.height = (half - o.h) + 'px'
    two.style.height = (half + o.h) + 'px'
  })

  tween.on('end', function(){
    animate = function(){} // eslint-disable-line
  })

  function animate() {
    raf(animate)
    tween.update()
  }

  animate()
  return tween
}

exports.prev = function (el, skip) {
  do {
    el = el.previousSibling
    if (el === skip) continue
    if (el && el.nodeType === 1) return el
  } while (el)
  return null
}

exports.next = function (el, skip) {
  do {
    el = el.nextSibling
    if (el === skip) continue
    if (el && el.nodeType === 1) return el
  } while (el)
  return null
}
