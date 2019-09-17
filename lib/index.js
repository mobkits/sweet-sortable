/**
 * dependencies
 */

var emitter = require('component-emitter')
var classes = require('component-classes')
var events = require('component-events')
var closest = require('component-closest')
var event = require('component-event')
var throttle = require('per-frame')
var transform = require('transform-property')
var util = require('./util')
var Animate = require('./animate')
var transition = require('transition-property')
var transitionend = require('transitionend-property')
var raf = require('component-raf')

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

function Sortable(el, opts) {
  if (!(this instanceof Sortable)) return new Sortable(el, opts)
  if (!el) throw new TypeError('sortable(): expects an element')
  opts = opts || {}
  this.delta = opts.delta == null ? 15 : opts.delta
  this.duration = opts.duration || 330
  this.delay = opts.delay || 100
  this.el = el
  util.touchAction(el, 'none')
  this.pel = util.getRelativeElement(el)
  this.dragging = false

  var h
  this.on('start', function () {
    h = el.style.height
    var ch = el.getBoundingClientRect().height
    el.style.height = ch + 'px'
  })
  this.on('end', function () {
    el.style.height = h
  })
  this.tx = 0
  this.ty = 0
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
Sortable.prototype.bind = function (selector) {
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
Sortable.prototype.ignore = function (selector) {
  this.ignored = selector
  return this
}

/**
 * Set to horizon mode
 *
 * @public
 * @return {undefined}
 */
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

Sortable.prototype.handle = function (selector) {
  this._handle = selector
  return this
}

/**
 * ontouchstart event handler
 *
 * @private
 */
Sortable.prototype.ontouchstart = function (e) {
  if (this.dragEl != null) return
  if (this.ignored && closest(e.target, this.ignored, this.el)) return
  var node = this.findDelegate(e)
  if (node == null) return
  if (this.timer) clearTimeout(this.timer)
  var touch = util.getTouch(e)
  if (this._handle) e.preventDefault()
  this.dragging = false
  this.emit('starting')
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
  }.bind(this), this.delay)
}

/**
 * ontouchmove event handler
 *
 * @private
 */
Sortable.prototype.ontouchmove = function (e) {
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
  this.positionHolder(touchDir)
  return false
}

/**
 * ontouchend event handler
 *
 * @private
 */
Sortable.prototype.ontouchend = function () {
  this.reset()
}

/**
 * Unbind all event listeners
 *
 * @public
 */
Sortable.prototype.remove =
  Sortable.prototype.unbind = function () {
    this.events.unbind()
    this.docEvents.unbind()
    this.off()
  }

Sortable.prototype.findDelegate = function (e) {
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

/**
 * Position the holder element and animate the overlaped element(s)
 *
 * @private
 * @param {Number} touchDir
 */
var positionHolder = function (touchDir) {
  var d = this.dragEl
  if (d == null) return
  var delta = this.delta
  var rect = d.getBoundingClientRect()
  var x = rect.left + rect.width / 2
  var y = rect.top + rect.height / 2
  if (!this.connected) this.emit('move', touchDir)
  var horizon = this.dir === 'horizon'
  var holder = this.holder
  var last = this.last || holder
  var el = last
  var property = touchDir < 2 ? 'nextSibling' : 'previousSibling'

  while (el) {
    if (el.nodeType !== 1 || el === d || el === holder) {
      el = el[property]
      continue
    }
    var r = el.getBoundingClientRect()
    if (horizon) {
      var dx = x - (r.left + r.width / 2)
      if (touchDir === 1 && dx < - delta) break
      if (touchDir === 3 && dx > delta) break
      if (el === last) {
        if ((touchDir === 1 && x > r.right) || (touchDir === 3 && x < r.left)) {
          el = el[property]
          continue
        }
      }
      this.last = el
      this.animate.animate(el, (touchDir + 2) % 4)
    } else {
      var dy = y - (r.top + r.height / 2)
      if (touchDir === 2 && dy > delta) break
      if (touchDir === 0 && dy < - delta) break
      if (el === last) {
        if ((touchDir === 0 && y > r.bottom) || (touchDir === 2 && y < r.top)) {
          el = el[property]
          continue
        }
      }
      this.last = el
      this.animate.animate(el, (touchDir + 2) % 4)
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

Sortable.prototype.reset = function () {
  if (this.timer) {
    clearTimeout(this.timer)
    this.timer = null
  }
  // make sure called once
  if (this.mouseStart == null) return
  this.mouseStart = null
  if (!this.connected) this.emit('reset')
  var parentNode = this.el
  var el = this.dragEl
  var h = this.holder
  var handled = this.handled
  function cb() {
    var update
    if (!handled) {
      // performance better
      el.style[transform] = ''
      el.style[transition] = ''
      parentNode.insertBefore(el, h)
      util.copy(el.style, this.orig)
      if (util.indexof(el) !== this.index) {
        update = true
      }
      classes(el).remove('sortable-dragging')
    } else {
      this.emit('remove', el)
    }
    this.clean()
    if (update) this.emit('update', el)
  }
  if (handled) return setTimeout(cb.bind(this), 500)
  var dir = this.getDirection()
  if (this.connected) {
    this.connectedMoveTo(el, h, dir, cb.bind(this))
  } else {
    this.moveTo(el, h, dir, cb.bind(this))
  }
}

/**
 * Get the last animate direction for dragEl
 *
 * @private
 * @return {Number}
 */
Sortable.prototype.getDirection = function () {
  var dir = this.animate.dir
  if (dir == null) {
    if (this.dir === 'horizon') {
      dir = this.tx > 0 ? 1 : 3
    } else {
      dir = this.ty > 0 ? 2 : 0
    }
  }
  return dir
}

/**
 * Move to for the connected status
 *
 * @public
 * @param  {Element}  el
 * @param {Element} target
 * @param {Number} dir
 * @param  {Function}  cb
 * @return {undefined}
 */
Sortable.prototype.connectedMoveTo = function (el, target, dir, cb) {
  var duration = this.duration
  var parentNode = el.parentNode
  var prop = dir % 2 === 0 ? 'height' : 'width'
  var d = parseInt(el.style[prop], 10)
  var r = parentNode.getBoundingClientRect()
  var s = r[prop]
  var border
  var start
  if (dir % 2 === 0) {
    border = dir === 0 ? 'top' : 'bottom'
  } else {
    border = dir === 1 ? 'left' : 'right'
  }
  var tx = this.tx
  var ty = this.ty
  var to = util.getBoundingClientRect(target)[border]
  var from = util.getBoundingClientRect(el)[border]
  var dis = to - from
  function animate(ts) {
    if (!start) start = ts
    var p = (ts - start) / duration
    if (p > 1) p = 1
    parentNode.style[prop] = (s - d * p) + 'px'
    var cur = util.getBoundingClientRect(target)[border]
    if (dir % 2 === 0) {
      var y = ty + (dis * p) + cur - to
      util.translate(el, tx, y)
    } else {
      var x = tx + (dis * p) + cur - to
      util.translate(el, x, ty)
    }
    if (p === 1) return cb()
    raf(animate)
  }
  raf(animate)
}

/**
 * Move el to target with move direction and callback
 *
 * @private
 * @param  {Element}  el
 * @param {Element} target
 * @param {Number} dir
 * @param  {Function}  cb
 */
Sortable.prototype.moveTo = function (el, target, dir, cb) {
  var duration = this.duration
  util.transitionDuration(el, duration, 'ease')
  var dis = util.getDistance(el, target, dir)
  var x = (this.tx || 0) + dis.x
  var y = (this.ty || 0) + dis.y
  var nomove = (dis.x == 0 && dis.y === 0)
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

/**
 * Connect to another sortable
 *
 * @public
 * @param {Sortable} sortable
 */
Sortable.prototype.connect = function (sortable) {
  var self = this
  var dir = 0
  var parentNode = this.el
  var rect = parentNode.getBoundingClientRect()
  var r = sortable.el.getBoundingClientRect()
  if (this.dir === 'horizon') {
    dir = rect.left > r.left ? 1 : 3
  } else {
    dir = rect.top > r.top ? 0 : 2
  }
  var h
  var padding
  this.on('start', function () {
    self.connected = false
  })
  sortable.on('start', function () {
    self.dragging = true
    self.connected = true
    self.orig = sortable.orig
    self.dragEl = sortable.dragEl
    self.mouseStart = sortable.mouseStart
    var holder = self.holder = sortable.holder.cloneNode(true)
    h = holder.style.height
    padding = holder.style.padding
    holder.style.height = '0px'
    holder.style.padding = '0px'
    holder.style[transition] = 'all 0.2s ease'
    if (dir < 2) {
      var first = parentNode.firstChild
      if (first) {
        parentNode.insertBefore(holder, first)
      } else {
        parentNode.appendChild(holder)
      }
    } else {
      parentNode.appendChild(holder)
    }
    setTimeout(function () {
      self.holder.style.height = h
      self.holder.style.padding = padding
    })
    function end() {
      event.unbind(holder, transitionend, end)
      holder.style[transition] = ''
      h = ''
    }
    event.bind(holder, transitionend, end)
    self.animate = new Animate(self.pel, self.dragEl, holder)
  })
  sortable.on('move', function (dir) {
    self.tx = sortable.tx
    self.ty = sortable.ty
    positionHolder.call(self, dir)
  })

  sortable.on('reset', function () {
    var rect = sortable.dragEl.getBoundingClientRect()
    var inside = util.intersect(parentNode, rect)
    if (inside) {
      sortable.handled = true
      self.reset()
    } else {
      self.clean()
    }
  })
}

/**
 * Clean the element and status
 *
 * @private
 */
Sortable.prototype.clean = function () {
  this.el.removeChild(this.holder)
  this.last = this.animate = this.holder = this.dragEl = null
  this.dragging = false
  this.handled = false
  this.mouseStart = null
  delete this.index
  this.emit('end')
}
