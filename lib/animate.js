var util = require('./util')
var transform = require('transform-property')
var transition = require('transition-property')
var transitionend = require('transitionend-property')
var event = require('component-event')
var uid = require('uid')

function Animate(pel, dragEl, holder) {
  this.dragEl = dragEl
  this.holder = holder
  this.width = parseInt(holder.style.width, 10)
  this.height = parseInt(holder.style.height, 10)
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
  this.dir = dir
  if (o.dir === dir) return
  o.dir = dir
  // var holder = this.holder
  if (o.end) {
    event.unbind(el, transitionend, o.end);
    if (o.transform) {
      o.transform = false
      this.transit(el, 0, 0, dir)
    } else {
      o.transform = true
      var props = this.getTransformProperty(dir, o.width, o.height)
      this.transit(el, props.x, props.y, dir)
    }
  } else {
    o.transform = true
    util.transitionDuration(el, 320)
    this.animates[el.id] = o
    this.start(o, el, dir)
  }
}

Animate.prototype.getTransformProperty = function (dir, w, h) {
  var o = {x: 0, y: 0}
  if (dir%2 === 0) {
    o.y = dir > 1 ? - h : h
  } else {
    o.x = dir > 1 ? - w : w
  }
  return o
}

Animate.prototype.start = function (o, el, dir) {
  var holder = this.holder
  var rect = holder.getBoundingClientRect()
  var r = el.getBoundingClientRect()
  var w = o.width = r.width
  var h = o.height = r.height
  o.orig = util.makeAbsolute(el, this.pel)
  // bigger the holder
  if (dir%2 === 0) {
    holder.style.height = (rect.height + h) + 'px'
  } else {
    holder.style.width = (rect.width + w) + 'px'
  }
  var props = this.getTransformProperty(dir, w, h)
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
      var h = Math.max(self.height, rect.height - o.height)
      s.height = h + 'px'
    } else {
      var w = Math.max(self.width, rect.width - o.width)
      s.width = w + 'px'
    }
    self.animates[el.id] = null
  }
  event.bind(el, transitionend, end)
  util.translate(el, x, y)
  return end
}

module.exports = Animate
