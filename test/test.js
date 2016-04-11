/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var Touch = require('touch-simulate')
var Sortable = require('..')

var ul
var h
beforeEach(function () {
  ul = document.createElement('ul')
  ul.style.padding = '0px'
  ul.style.fontSize = '14px'
  ul.style.margin = '0px'
  var li = document.createElement('li')
  ul.appendChild(li)
  document.body.appendChild(ul)
  h = li.getBoundingClientRect().height
  ul.removeChild(li)
})

afterEach(function () {
  document.body.removeChild(ul)
})

function append(n) {
  for(var i = 0; i < n; i ++) {
    var li = document.createElement('li')
    li.textContent = i
    ul.appendChild(li)
  }
}

describe('Sortable()', function() {
  it('should init with new', function () {
    var s = new Sortable(ul)
    assert.equal(s.el, ul)
  })

  it('should init with option', function () {
    var s = new Sortable(ul, {delta: 5})
    assert.equal(s.el, ul)
    assert.equal(s.delta, 5)
  })

  it('should init without new', function () {
    var s = Sortable(ul)
    assert.equal(s.el, ul)
  })

  it('should throw when no element passed', function () {
    var err
    try {
      Sortable()
    } catch (e) {
      err = e
    }
    assert(!!err.message)
  })
})

describe('.ignore()', function () {
  it('should ignore', function () {
    append(1)
    var li = document.createElement('li')
    li.disabled = true
    var s = Sortable(ul)
    s.bind('li').ignore('[disabled]')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })
})

describe('.handler', function () {
  it('should not dragging', function () {
    append(2)
    var li = ul.querySelector('li')
    var s = Sortable(ul)
    s.bind('li').handle('.handler')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })

  it('should dragging with handler', function () {
    append(2)
    var li = ul.querySelector('li')
    var span = document.createElement('span')
    span.textContent = '≡'
    span.className = 'handler'
    li.appendChild(span)
    var s = Sortable(ul)
    s.bind('li').handle('.handler')
    var t = Touch(span)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, true)
    })
  })
})

describe('.bind()', function () {
  it('should bind to element of selector', function () {
    append(5)
    var s = Sortable(ul)
    s.bind('li')
    var li = ul.querySelector('li')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, true)
    })
  })

  it('should bind to element of selector with custom delay', function () {
    append(5)
    var s = Sortable(ul, {delay: 200})
    s.bind('li')
    var li = ul.querySelector('li')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })

  it('should not bind to element not match', function () {
    append(5)
    var div = document.createElement('div')
    ul.appendChild(div)
    var s = Sortable(ul)
    s.bind('li')
    var t = Touch(div)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })
})

describe('move', function () {
  this.timeout(5000)
  function moveMoment(count, index, angel, speed, dis) {
    append(count)
    var s = Sortable(ul)
    s.bind('li')
    var li = ul.children[index]
    var t = Touch(li, {speed: speed})
    return t.move(angel, h*dis).then(function () {
      // wait for end transition
      return t.wait(500)
    })
  }

  it('should move element up', function () {
    var p = moveMoment(2, 1, 1.5*Math.PI, 100, 1)
    return p.then(function () {
      assert.equal(ul.textContent, '10')
    })
  })

  it('should move element down', function () {
    var p = moveMoment(2, 0, 0.5*Math.PI, 100, 1)
    return p.then(function () {
      assert.equal(ul.textContent, '10')
    })
  })

  it('should move down and keep order', function () {
    var p = moveMoment(5, 0, 0.5*Math.PI, 100, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '12340')
    })
  })

  it('should move up and keep order', function () {
    var p = moveMoment(5, 4, 1.5*Math.PI, 100, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '40123')
    })
  })

  it('should works when move up and down several times', function () {
    append(3)
    var s = Sortable(ul, {delta: 5})
    s.bind('li')
    var li = ul.children[1]
    var t = Touch(li, {speed: 100})
    var pre = ul.textContent
    return t.moveUp(h, false)
          .moveDown(h, false)
          .moveUp(h,false)
          .moveDown(h)
          .wait(800)
          .then(function () {
              assert.equal(s.dragging, false)
              assert.equal(pre, ul.textContent)
          })
  })
})

describe('horizon', function () {
  this.timeout(5000)
  function createTable() {
    var table = document.createElement('table')
    table.appendChild(document.createElement('tbody'))
    var tr = document.createElement('tr')
    table.firstChild.appendChild(tr)
    tr.style.width = '300px'
    document.body.appendChild(table)
    return tr
  }

  var w = 20
  function appendHorizon(tr, n) {
    for(var i = 0; i < n; i ++) {
      var td = document.createElement('td')
      td.style.textAlign = 'center'
      td.style.padding = '0px'
      td.style.margin = '0px'
      td.style.width = '20px'
      td.style.height = '20px'
      td.textContent = i
      tr.appendChild(td)
    }
  }

  function moveMoment(count, index, angel, speed, dis) {
    var tr = createTable()
    appendHorizon(tr, count)
    var s = Sortable(tr)
    s.bind('td').horizon()
    var td = tr.children[index]
    var t = Touch(td, {speed: speed})
    return t.move(angel, w*dis).then(function () {
      // wait for end transition
      return t.wait(800)
    }).then(function () {
      return tr
    })
  }

  it('should move right and keep order', function () {
    var p = moveMoment(5, 0, 0, 200, 5)
    return p.then(function (tr) {
      assert.equal(tr.textContent, '12340')
    })
  })
  it('should move left and keep order', function () {
    var p = moveMoment(5, 4, Math.PI, 200, 5)
    return p.then(function (tr) {
      assert.equal(tr.textContent, '40123')
    })
  })
})

describe('.connect()', function () {
  var two
  this.timeout(5000)
  beforeEach(function () {
    var el = document.createElement('ul')
    el.style.padding = '0px'
    el.style.fontSize = '14px'
    el.style.margin = '20px 0px'
    document.body.appendChild(el)
    two = Sortable(el)
    var li = document.createElement('li')
    li.textContent = 'a'
    el.appendChild(li)
    two.bind('li')
  })

  afterEach(function () {
    two.unbind()
    document.body.removeChild(two.el)
  })

  it('should one way connect', function () {
    var one = Sortable(ul)
    one.bind('li')
    append(5)
    two.connect(one)
    var el = ul.querySelector('li:last-child')
    var t = new Touch(el)
    t.speed(80)
    return t.moveDown(40).wait(400).then(function () {
      assert.equal(el.parentNode, two.el)
    })
  })

  it('should connect to each other', function () {
    var one = Sortable(ul)
    one.bind('li')
    append(5)
    two.connect(one)
    one.connect(two)
    var el = ul.querySelector('li:last-child')
    var t = new Touch(el)
    t.speed(80)
    return t.moveDown(40).wait(400).then(function () {
      assert.equal(el.parentNode, two.el)
    })
  })
})

describe('.remove()', function () {
  it('should unbind all events', function () {
    var fired
    // change the function, be careful
    function prependFn(o, name) {
      var orig = o[name]
      var fn = function () {
        fired = true
        orig.apply(this, arguments)
      }
      o[name] = fn
    }
    var s = Sortable(ul)
    prependFn(s, 'ontouchstart')
    prependFn(s, 'ontouchmove')
    prependFn(s, 'ontouchend')
    append(2)
    s.bind('li')
    s.unbind()
    s.on('starting', function () {
      fired = true
    })
    s.on('start', function () {
      fired = true
    })
    var li = ul.firstChild
    var t = Touch(li)
    return t.moveDown(h).then(function () {
      assert(fired !== true)
    })
  })
})
