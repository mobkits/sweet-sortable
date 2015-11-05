/**
 * dependencies
 */

var emitter = require('emitter')
  , classes = require('classes')
  , events = require('events')
  , closest = require('closest')
  , styles = require('computed-style')
  , uid = require('uid')
  , event = require('event')
  , throttle = require('per-frame')
  , util = require('./util')
  , touchAction = require('touchaction-property')

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
  this.events = events(el, this);
  this.pel = util.getRelativeElement(el)
  this._reset = this.reset.bind(this)
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
  var node = this.findMatch(e)
  
  // element to move
  if (node) {
    node = util.matchAsChild(node, this.el)
  }
  // not found
  if (node == null) return
  this.index = util.indexof(node)
  this.display = styles(node, 'display')
  e.preventDefault()
  e.stopImmediatePropagation()
  var h = styles(node, 'height')
  var w =  styles(node, 'width')
  // place holder
  var holder = this.holder = node.cloneNode(false)
  classes(holder).add('sortable-holder')
  util.assign(holder.style, {
    borderColor: 'rgba(255,255,255,0)',
    backgroundColor: 'rgba(255,255,255,0)',
    height: h,
    width: w
 })
  holder.id = uid(7)
  // shadow element
  var d = this.dragEl = node.cloneNode(true)
  var pos = this.start = util.getAbsolutePosition(node, this.pel)
  util.assign(d.style, {
    width: w,
    height: h,
    left: pos.left + 'px',
    top: pos.top + 'px',
    position: 'absolute'
  })
  d.id = uid(7)
  this.mouseStart = {
    x: e.clientX,
    y: e.clientY
  }
  this.origin = node
  if (hasTouch) {
    event.bind(document, 'touchend', this._reset)
  } else {
    event.bind(document, 'mouseup', this._reset)
  }
  this.timer = setTimeout(function () {
    classes(d).add('sortable-dragging')
    this.el.insertBefore(d, node)
    this.el.insertBefore(holder, node)
    this.el.removeChild(node)
    if (touchAction) node.style[touchAction] = 'none';
  }.bind(this), 100)
  this.emit('start')
}

Sortable.prototype.ontouchmove =
Sortable.prototype.onmousemove = function(e) {
  if (this.dragEl == null || this.index == null) return
  e.preventDefault()
  e.stopPropagation()
  this.holder.style.display = this.display
  var sx = this.mouseStart.x
  var sy = this.mouseStart.y
  this.dragEl.style.left = (this.start.left + e.clientX - sx) + 'px'
  this.dragEl.style.top = (this.start.top + e.clientY - sy) + 'px'
  if (util.getPosition(e.clientX, e.clientY, this.el) !== 0) {
    this.positionHolder(e)
  }
  this.emit('move', e)
}

Sortable.prototype.ontouchend =
Sortable.prototype.onmouseup = function(e) {
  this.emit('done')
  e.stopPropagation()
  this.reset(e)
}

Sortable.prototype.remove = function() {
  var _reset = this._reset
  if (hasTouch) {
    event.unbind(document.documentElement, 'touchend', _reset)
  } else {
    event.unbind(document.documentElement, 'mouseup', _reset)
  }
  this.events.unbind();
  this.off();
}


Sortable.prototype.findMatch = function(e){
  if (this._handle) return closest(e.target, this._handle, this.el)
  return util.matchAsChild(e.target, this.el)
}

var positionHolder = function (e) {
  var d = this.dragEl
  if (d == null) return
  var rect = d.getBoundingClientRect()
  var sx = this.mouseStart.x
  var sy = this.mouseStart.y
  var x = rect.left + (rect.width || d.clientWidth)/2
  var y = rect.top + (rect.height || d.clientHeight)/2
  var h = this.holder
  var tod = Math.abs(e.clientY - sy) > Math.abs(e.clientX - sx)
  var children = this.el.children
  for (var i = children.length - 1; i >= 0; i--) {
    var node = children[i]
    var prev = node.previousSibling
    var next = node.nextSibling
    if (node === d || node === h) continue
    var pos = util.getPosition(x, y, node)
    if (pos === 0) continue
    if (tod) {
      if (pos <= 2 && prev !== h) { //prev
        this.el.insertBefore(h, node)
      } else if (pos > 2 && next !== h) { //prev
        util.insertAfter(h, node)
      }
    }
    else {
      if ((pos%2 === 1) && prev !== h) {
        this.el.insertBefore(h, node)
      } else if ((pos%2 === 0) && next !== h) {
        util.insertAfter(h, node)
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
  var d = this.dragEl
  if (!d) return
  if (this.timer) clearTimeout(this.timer)
  if (hasTouch) {
    event.unbind(document, 'touchend', this._reset)
  } else {
    event.unbind(document, 'mouseup', this._reset)
  }
  var p = this.el
  var h = this.holder
  var o = this.origin
  var append
  if (this.index == null && this.holder.style.display !== 'none') {
    // drop in
    p.insertBefore(o, h)
    this.emit('update', o)
  } else if (this.index != null && !o.parentNode) {
    // change position
    p.insertBefore(o, h)
    append = true
  } else if (this.index != null && o.parentNode) {
    // removed
    this.emit('update', o)
  }
  if (d.parentNode) d.parentNode.removeChild(d)
  if (h && h.parentNode) h.parentNode.removeChild(h)
  if (append === true && util.indexof(o) !== this.index) {
    this.emit('update', o)
  }
  delete this.index
  this.holder = this.origin = this.dragEl = null
  this.emit('end')
}

/**
* Connect the given `sortable`.
*
* once connected you can drag elements from
* the given sortable to this sortable.
*
* Example:
*
* @param {Sortable} sortable
* @return {Sortable} the given sortable.
* @api public
*/
Sortable.prototype.connect = function(sortable) {
  var self = this
  sortable.on('end', function () {
    self.reset()
  })

  sortable.on('start', function () {
    self.dragEl = sortable.dragEl
    self.origin = sortable.origin
    self.mouseStart = sortable.mouseStart
    self.display = sortable.display
    self.holder = sortable.holder.cloneNode(true)
    self.holder.id = uid(7)
    self.holder.style.display = 'none'
    self.el.appendChild(self.holder)
  })

  sortable.on('move', function (e) {
    var pos = util.getPosition(e.clientX, e.clientY, self.el)
    if (pos === 0) {
      self.holder.style.display = 'none'
    } else {
      self.holder.style.display = this.display
      positionHolder.call(self, e)
    }
  })

  sortable.on('done', function () {
    self.reset()
  })
}
