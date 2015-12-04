if (window.navigator.standalone) {
  // stop stupid safari over scroll
  document.addEventListener('touchmove', function(e) {
    e.preventDefault()
  })
}

var Sortable = require('..')

var one = new Sortable(document.getElementById('enabled'))
one.bind('li')
var two = new Sortable(document.getElementById('disabled'))
two.bind('li')

two.connect(one)
