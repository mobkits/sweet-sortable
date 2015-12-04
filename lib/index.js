/**
 * dependencies
 */

var emitter = require('emitter')
var classes = require('classes')
var events = require('events')
var closest = require('closest')
var event = require('event')
var throttle = require('per-frame')
var transform = require('transform-property')
var util = require('./util')
var Animate = require('./animate')
var transition = require('transition-property')
var transitionend = require('transitionend-property')

var hasTouch = 'ontouchend' in window

/**
 * export `Sortable`
 */

module.exports = Sortable

/**
 * Initialize `Sortable` with `el`.
 *
 * @param {Element} el
 */

function Sortable(el, opts){
  if (!(this instanceof Sortable)) return new Sortable(el, opts)
  if (!el) throw new TypeError('sortable(): expects an element')
  opts = opts || {}
  this.delta = opts.delta == null ? 15 : opts.delta
  this.el = el
  util.touchAction(el, 'none')
  this.pel = util.getRelativeElement(el)
  this.dragging = false

  var h
  this.on('start', function () {
    h = el.style.height
    var ch = el.getBoundingClientRect().height || el.clientHeight
    el.style.height = ch + 'px'
  })
  this.on('end', function () {
    el.style.height = h
  })
}

/**
 * Mixins.
 */

emitter(Sortable.prototype)

/**
 * Bind the draggable element selector
 *
 * @param {String} selector
 * @api public
 */
Sortable.prototype.bind = function (selector){
  this.selector = selector || ''
  this.docEvents = events(document, this)
  this.events = events(this.el, this)

  this.events.bind('touchstart')
  this.events.bind('touchmove')
  this.events.bind('touchend')
  this.docEvents.bind('touchcancel', 'ontouchend')
  this.docEvents.bind('touchend')

  if (!hasTouch) {
    this.events.bind('mousedown', 'ontouchstart')
    this.events.bind('mousemove', 'ontouchmove')
    this.docEvents.bind('mouseup', 'ontouchend')
  }


  // MS IE touch events
  this.events.bind('PointerDown', 'ontouchstart')
  this.events.bind('PointerMove', 'ontouchmove')
  this.docEvents.bind('PointerUp', 'ontouchend')
  return this
}

/**
 * Ignore items that t match the `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */
Sortable.prototype.ignore = function(selector){
  this.ignored = selector
  return this
}

Sortable.prototype.horizon = function () {
  this.dir = 'horizon'
  return this
}

/**
 * Set handle to `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.handle = function(selector){
  this._handle = selector
  return this
}

Sortable.prototype.ontouchstart = function(e) {
  if (this.dragEl != null) return
  if (this.ignored && closest(e.target, this.ignored, this.el)) return
  var node = this.findDelegate(e)
  if (node == null) return
  if (this.timer) clearTimeout(this.timer)
  var touch = util.getTouch(e)
  if (this._handle) e.preventDefault()
  this.timer = setTimeout(function () {
    this.dragEl = node
    this.dragging = true
    this.index = util.indexof(node)
    this.mouseStart = {}
    this.x = this.mouseStart.x = touch.clientX,
    this.y = this.mouseStart.y = touch.clientY
    var pos = util.getAbsolutePosition(node, this.pel)
    // place holder
    var holder = this.holder = node.cloneNode(false)
    holder.removeAttribute('id')
    classes(holder).add('sortable-holder')
    util.copy(holder.style, {
      borderColor: 'rgba(255,255,255,0)',
      backgroundColor: 'rgba(255,255,255,0)',
      height: pos.height + 'px',
      width: pos.width + 'px'
    })
    classes(node).add('sortable-dragging')
    this.orig = util.copy(node.style, {
      height: pos.height + 'px',
      width: pos.width + 'px',
      left: pos.left + 'px',
      top: pos.top + 'px',
      zIndex: 99,
      position: 'absolute'
    })
    this.el.insertBefore(holder, node)
    this.animate = new Animate(this.pel, node, holder)
    this.emit('start')
  }.bind(this), 100)
}

Sortable.prototype.ontouchmove = function(e) {
  if (this.mouseStart == null) return
  if (e.changedTouches && e.changedTouches.length !== 1) return
  var el = this.dragEl
  e.preventDefault()
  e.stopPropagation()
  var touch = util.getTouch(e)
  var touchDir = 0
  if (this.dir === 'horizon') {
    var dx = touch.clientX - this.x
    if (dx === 0) return
    touchDir = dx > 0 ? 1 : 3
    this.tx = touch.clientX - this.mouseStart.x
    util.translate(el, this.tx, 0)
  } else {
    var dy = touch.clientY - this.y
    if (dy === 0) return
    touchDir = dy > 0 ? 0 : 2
    this.ty = touch.clientY - this.mouseStart.y
    util.translate(el, 0, this.ty)
  }
  this.x = touch.clientX
  this.y = touch.clientY
  this.positionHolder(touch, touchDir)
  return false
}

Sortable.prototype.ontouchend = function() {
  this.reset()
}

Sortable.prototype.remove =
Sortable.prototype.unbind = function() {
  this.events.unbind()
  this.docEvents.unbind()
  this.off()
}

Sortable.prototype.findDelegate = function(e){
  var el
  if (this._handle) {
    el = closest(e.target, this._handle, this.el)
  } else if (this.selector) {
    el = closest(e.target, this.selector, this.el)
  } else {
    el = e.target
  }
  if (!el) return null
  return util.matchAsChild(el, this.el)
}

var positionHolder = function (e, touchDir) {
  var d = this.dragEl
  if (d == null) return
  var delta = this.delta
  var rect = d.getBoundingClientRect()
  var x = rect.left + rect.width/2
  var y = rect.top + rect.height/2
  var horizon = this.dir === 'horizon'
  var holder = this.holder
  var last = this.last || holder
  var el = last
  var property = touchDir < 2 ? 'nextSibling' : 'previousSibling'
  while(el) {
    if (el.nodeType !== 1 || el === d || el === holder) {
      el = el[property]
      continue
    }
    var r = el.getBoundingClientRect()
    if (horizon) {
      var dx = x - (r.left + r.width/2)
      if (touchDir === 1 && dx < - delta) break
      if (touchDir === 3 && dx > delta) break
      if (el === last) {
        if ((touchDir === 1 && x > r.right) || (touchDir === 3 && x < r.left)) {
          el = el[property]
          continue
        }
      }
      this.last = el
      this.animate.animate(el, (touchDir + 2)%4)
    } else {
      var dy = y - (r.top +  r.height/2)
      if (touchDir === 2 && dy > delta) break
      if (touchDir === 0 && dy < - delta) break
      if (el === last) {
        if ((touchDir === 0 && y > r.bottom) || (touchDir === 2 && y < r.top)) {
          el = el[property]
          continue
        }
      }
      this.last = el
      this.animate.animate(el, (touchDir + 2)%4)
    }
    el = el[property]
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
  if (this.timer) {
    clearTimeout(this.timer)
    this.timer = null
  }
  // make sure called once
  if (this.mouseStart == null) return
  this.mouseStart = null
  var el = this.dragEl
  var h = this.holder
  this.moveTo(el, h, function () {
    // performance better
    el.style[transform] = ''
    el.style[transition] = ''
    if (el.parentNode) {
      el.parentNode.insertBefore(el, h)
    }
    if (h.parentNode) {
      h.parentNode.removeChild(h)
    }
    util.copy(el.style, this.orig)
    if (util.indexof(el) !== this.index) {
      this.emit('update', el)
    }
    classes(el).remove('sortable-dragging')
    delete this.index
    this.last = this.animate = this.holder = this.dragEl = null
    this.dragging = false
    this.emit('end')
  }.bind(this))
}

Sortable.prototype.moveTo = function (el, target, cb) {
  var duration = 330
  util.transitionDuration(el, duration, 'ease')
  var tx = this.tx || 0
  var ty = this.ty || 0
  var dir = this.animate.dir
  if (!dir) {
    if (this.dir === 'horizon') {
      dir = tx > 0 ? 1 : 3
    } else {
      dir = ty > 0 ? 2 : 0
    }
  }
  var dis = util.getDistance(el, target, dir)
  var x = tx + dis.x
  var y = ty + dis.y
  var nomove = (dis.x ==0 && dis.y === 0)
  if (nomove) {
    setTimeout(cb, duration)
  } else {
    var end = function () {
      event.unbind(el, transitionend, end)
      cb()
    }
    event.bind(el, transitionend, end)
    util.translate(el, x, y)
  }
}
