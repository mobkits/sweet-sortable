/**
 * dependencies
 */

var emitter = require('emitter')
var classes = require('classes')
var events = require('events')
var closest = require('closest')
var event = require('event')
var throttle = require('per-frame')
var touchAction = require('touchaction-property')
var transform = require('transform-property')
var util = require('./util')
var Animate = require('./animate')

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
  this.touchAction('none')
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

Sortable.prototype.direction = function (dir) {
  if (dir === 'h') {
    this.dir = 'horizon'
  } else {
    this.dir = 'vertical'
  }
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
  var touch = this.getTouch(e)
  var node = this.findMatch(touch)
  // element to move
  if (node) node = util.matchAsChild(node, this.el)
  // not found
  if (node == null) return
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
    this.bindDocument(true)
    this.dragging = true
    this.animate = new Animate(this.pel, node, holder)
    this.emit('start')
  }.bind(this), 100)
  return false
}

Sortable.prototype.ontouchmove =
Sortable.prototype.onmousemove = function(e) {
  if (this.dragEl == null || this.index == null) return
  e.preventDefault()
  e.stopPropagation()
  if (hasTouch && e.changedTouches && e.changedTouches.length !== 1) return
  var touch = this.getTouch(e)
  var touchDir = 0
  var sx = this.mouseStart.x
  var sy = this.mouseStart.y
  var d = this.dragEl
  var dx = touch.clientX - (this.x || sx)
  var dy = touch.clientY - (this.y || sy)
  this.x = touch.clientX
  this.y = touch.clientY
  if (this.dir === 'horizon') {
    util.translate(d, touch.clientX - sx, 0)
    touchDir = dx > 0 ? 1 : 3
    if (dx === 0) return
  } else {
    util.translate(d, 0, touch.clientY - sy)
    touchDir = dy > 0 ? 0 : 2
    if (dy === 0) return
  }
  if (util.getPosition(touch.clientX, touch.clientY, this.el) !== 0) {
    this.positionHolder(touch, touchDir)
  }
  this.emit('move', touch)
}

Sortable.prototype.ontouchend =
Sortable.prototype.onmouseup = function(e) {
  this.emit('done')
  e.stopPropagation()
  this.reset()
}

Sortable.prototype.remove = function() {
  this.bindDocument(false)
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
  var rect = d.getBoundingClientRect()
  var x = rect.left + (rect.width || d.clientWidth)/2
  var y = rect.top + (rect.height || d.clientHeight)/2
  var h = this.holder
  var children = this.el.children
  for (var i = children.length - 1; i >= 0; i--) {
    var node = children[i]
    if (node === d || node === h) continue
    var pos = util.getPosition(x, y, node)
    if (pos === 0) continue
    if (this.dir === 'horizon') {
      if (touchDir === 1 && pos%2 === 0) {
        this.animate.animate(node, 3)
      } else if (touchDir === 3 && pos%2 === 1){
        this.animate.animate(node, 1)
      }
    } else {
      if (touchDir === 2) {
        this.animate.animate(node, 0)
      } else if (touchDir === 0){
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
  var d = this.dragEl
  this.bindDocument(false)
  var h = this.holder
  this.el.insertBefore(d, h)
  d.style[transform] = ''
  if (h && h.parentNode) h.parentNode.removeChild(h)
  util.copy(d.style, this.orig)
  classes(d).remove('sortable-dragging')
  if (util.indexof(d) !== this.index) {
    this.emit('update', d)
  }
  delete this.index
  this.animate = this.holder = this.dragEl = null
  this.emit('end')
}


/**
 * Gets the appropriate "touch" object for the `e` event. The event may be from
 * a "mouse", "touch", or "Pointer" event, so the normalization happens here.
 *
 * @api private
 */

Sortable.prototype.getTouch = function(e){
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

Sortable.prototype.touchAction = function(value){
  var s = this.el.style;
  if (touchAction) {
    s[touchAction] = value;
  }
}

Sortable.prototype.bindDocument = function (bind) {
  var _reset = this.reset.bind(this)
  if (hasTouch) {
    if (bind) {
      event.bind(document, 'touchend', _reset)
    } else {
      event.unbind(document, 'touchend', _reset)
    }
  } else {
    if (bind) {
      event.bind(document, 'mouseup', _reset)
    } else {
      event.unbind(document, 'mouseup', _reset)
    }
  }
}
