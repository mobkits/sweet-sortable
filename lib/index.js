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

var hasTouch = 'ontouchmove' in window
/**
 * export `Sortable`
 */

module.exports = Sortable;

/**
 * Initialize `Sortable` with `el`.
 *
 * @param {Element} el
 */

function Sortable(el){
  if (!(this instanceof Sortable)) return new Sortable(el);
  if (!el) throw new TypeError('sortable(): expects an element');
  this.el = el
  util.touchAction(el, 'none')
  this.events = events(el, this);
  this.pel = util.getRelativeElement(el)
}

/**
 * Mixins.
 */

emitter(Sortable.prototype);

/**
 * Bind the draggable element selector
 *
 * @param {String} selector
 * @api public
 */
Sortable.prototype.bind = function (selector){
  this.selector = selector || '';

  if (hasTouch) {
    this.events.bind('touchstart');
    this.events.bind('touchend');
    this.events.bind('touchmove');
  } else {
    this.events.bind('mousedown');
    this.events.bind('mouseup');
    this.events.bind('mousemove');
  }
}

/**
 * Ignore items that t match the `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */
Sortable.prototype.ignore = function(selector){
  this.ignored = selector;
  return this;
}

/**
 * Set the max item count of this sortable
 *
 * @param {String} count
 * @api public
 */
Sortable.prototype.max = function(count){
  this.maxCount = count;
  return this;
}

Sortable.prototype.horizon = function () {
  this.dir = 'horizon'
}

/**
 * Set handle to `selector`.
 *
 * @param {String} selector
 * @return {Sortable}
 * @api public
 */

Sortable.prototype.handle = function(selector){
  this._handle = selector;
  return this;
}

Sortable.prototype.ontouchstart =
Sortable.prototype.onmousedown = function(e) {
  // ignore
  if (this.ignored && closest(e.target, this.ignored, this.el)) return
  var touch = util.getTouch(e)
  var node = this.findMatch(touch)
  // element to move
  if (node) node = util.matchAsChild(node, this.el)
  // not found
  if (node == null) return
  if (node === this.disabled) return
  e.preventDefault()
  e.stopImmediatePropagation()
  this.timer = setTimeout(function () {
    this.dragEl = node
    this.index = util.indexof(node)
    var pos = util.getAbsolutePosition(node, this.pel)
    // place holder
    var holder = this.holder = node.cloneNode(false)
    holder.removeAttribute('id')
    classes(holder).add('sortable-holder')
    util.copy(holder.style, {
      height: pos.height + 'px',
      width: pos.width + 'px'
    })
    this.mouseStart = {
      x: touch.clientX,
      y: touch.clientY
    }
    classes(node).add('sortable-dragging')
    this.orig = util.copy(node.style, {
      height: pos.height + 'px',
      width: pos.width + 'px',
      left: pos.left + 'px',
      top: pos.top + 'px',
      position: 'absolute'
    })
    this.el.insertBefore(holder, node)
    this.bindDocument()
    this.dragging = true
    this.animate = new Animate(this.pel, node, holder)
    this.emit('start')
  }.bind(this), 100)
  return false
}

Sortable.prototype.ontouchmove =
Sortable.prototype.onmousemove = function(e) {
  if (this.dragEl == null || this.index == null) return
  if (hasTouch && e.changedTouches && e.changedTouches.length !== 1) return
  e.preventDefault()
  e.stopPropagation()
  var touch = util.getTouch(e)
  var touchDir = 0
  var sx = this.mouseStart.x
  var sy = this.mouseStart.y
  var d = this.dragEl
  var dx = touch.clientX - (this.x || sx)
  var dy = touch.clientY - (this.y || sy)
  this.x = touch.clientX
  this.y = touch.clientY
  if (this.dir === 'horizon') {
    this.tx = touch.clientX - sx
    util.translate(d, this.tx, 0)
    touchDir = dx > 0 ? 1 : 3
    if (dx === 0) return
  } else {
    this.ty = touch.clientY - sy
    util.translate(d, 0, this.ty)
    touchDir = dy > 0 ? 0 : 2
    if (dy === 0) return
  }
  if (util.getPosition(touch.clientX, touch.clientY, this.el)) {
    this.positionHolder(touch, touchDir)
  }
  return false
}

Sortable.prototype.ontouchend =
Sortable.prototype.onmouseup = function(e) {
  this.reset()
}

Sortable.prototype.remove = function() {
  this.events.unbind();
  this.off();
}

Sortable.prototype.findMatch = function(e){
  if (this._handle) return closest(e.target, this._handle, this.el)
  if (this.selector) {
    var el = closest(e.target, this.selector, this.el)
    return el
  }
  return util.matchAsChild(e.target, this.el)
}

var positionHolder = function (e, touchDir) {
  var d = this.dragEl
  if (d == null) return
  var delta = 10
  var rect = d.getBoundingClientRect()
  var x = rect.left + (rect.width || d.clientWidth)/2
  var y = rect.top + (rect.height || d.clientHeight)/2
  var h = this.holder
  var children = this.el.children
  for (var i = children.length - 1; i >= 0; i--) {
    var node = children[i]
    if (node === d || node === h) continue
    var pos = util.getPosition(x, y, node)
    if (!pos) continue
    if (this.dir === 'horizon') {
      if (touchDir === 1 && pos.dx > - delta) {
        this.animate.animate(node, 3)
      } else if (touchDir === 3 && pos.dx < delta){
        this.animate.animate(node, 1)
      }
    } else {
      if (touchDir === 2 && pos.dy < delta) {
        this.animate.animate(node, 0)
      } else if (touchDir === 0 && pos.dy > -delta){
        this.animate.animate(node, 2)
      }
    }
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
  if (this.timer) clearTimeout(this.timer)
  if (!this.dragging) return
  this.dragging = false
  this.timer = null
  var p = this.el
  var el = this.dragEl
  var h = this.holder
  this.moveTo(h, function () {
    el.style[transform] = ''
    p.insertBefore(el, h)
    p.removeChild(h)
    util.copy(el.style, this.orig)
    classes(el).remove('sortable-dragging')
    if (util.indexof(el) !== this.index) {
      this.emit('update', el)
    }
    delete this.index
    this.animate = this.holder = this.dragEl = null
    this.emit('end')
  }.bind(this))
}


/**
 * Bind document event
 *
 * @api private
 */
Sortable.prototype.bindDocument = function () {
  var self = this
  var name = hasTouch ? 'touchend' : 'mouseup'
  var reset = function () {
    event.unbind(document, name, reset)
    self.reset()
  }
  event.bind(document, name, reset)
}

Sortable.prototype.moveTo = function (target, cb) {
  var el = this.dragEl
  this.disabled = el
  util.transitionDuration(el, 300)
  var tx = this.tx || 0
  var ty = this.ty || 0
  var dis = this.getDistance(el, target, this.animate.dir)
  var x = tx + dis.x
  var y = ty + dis.y
  var nomove = (dis.x ===0 && dis.y === 0)
  var self = this
  var fn = function () {
    el.style[transition] = ''
    self.disabled = null
    cb()
  }
  if (nomove) {
    fn()
  } else {
    var end = function () {
      event.unbind(el, transitionend, end);
      fn()
    }
    event.bind(el, transitionend, end)
    util.translate(el, x, y)
  }
}

Sortable.prototype.getDistance = function (from, to, dir) {
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
