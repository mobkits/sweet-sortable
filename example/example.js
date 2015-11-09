var Sortable = require('..')

var els = document.querySelectorAll('.numbers, .languages, .handle, .horizon')

// all
;[].slice.call(els).forEach(function(el){
  var sortable = new Sortable(el)
  if ('handle' == el.className) sortable.handle('span')
  if ('horizon' == el.className) {
    sortable.horizon()
    sortable.delta = 0
  }
  sortable.ignore('[disabled]')
  sortable.bind('li')
})

var more = ['Python', 'C#', 'Lisp', 'Matlab', 'SQL', 'XML', 'HTML', 'LaTeX', 'Prolog']
var p = document.querySelector('#languages')
document.getElementById('add').addEventListener('click', function(){
    var n = document.createElement('li')
    n.innerHTML = more.pop() || 'C'
    p.appendChild(n)
}, false)

document.getElementById('remove').addEventListener('click', function(){
    var n = p.firstElementChild
    p.removeChild(n)
}, false)
