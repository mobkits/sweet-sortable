var util = require('./util')
var transform = require('transform-property')
var transition = require('transition-property')
var transitionend = require('transitionend-property')
var event = require('event')
var uid = require('uid')

function Animate(pel, dragEl, holder) {
  var d = this.dragEl = dragEl
  var r = d.getBoundingClientRect()
  this.holder = holder
  this.dx = r.width || d.offsetWidth
  this.dy = r.height || d.offsetHeight
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
    util.transitionDuration(el, 280)
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
  var h = r.height || holder.offsetHeight
  var w = r.width || holder.offsetWidth
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
    var removed = !holder.parentNode
    if (!removed && o.transform && el.parentNode) {
      if (dir > 1) {
        util.insertAfter(holder, el)
      } else {
        el.parentNode.insertBefore(holder, el)
      }
    }
    util.copy(el.style, orig)
    if (removed) return
    // reset holder
    var rect = holder.getBoundingClientRect()
    if (dir%2 === 0) {
      s.height = ((rect.height || holder.offsetHeight) - self.dy) + 'px'
    } else {
      s.width = ((rect.width || holder.offsetWidth) - self.dx) + 'px'
    }
  }
  event.bind(el, transitionend, end)
  util.translate(el, x, y)
  return end
}

module.exports = Animate
