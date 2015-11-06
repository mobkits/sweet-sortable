var Sortable = require('..')

var els = document.querySelectorAll('.numbers, .languages, .handle')
var ul = document.querySelector('.one')

// all
;[].slice.call(els).forEach(function(el){
  var sortable = new Sortable(el)
  if ('handle' == el.className) sortable.handle('span')
  sortable.ignore('[disabled]')
  sortable.bind('li')
})

//s.on('max', function(count) {
//  alert('max count ' + count +' reached')
//})


var p = document.querySelector('#languages')
document.getElementById('add').addEventListener('click', function(){
    var n = document.createElement('li')
    n.innerHTML = 'Python'
    p.appendChild(n)
}, false)

document.getElementById('remove').addEventListener('click', function(){
    var n = p.firstElementChild
    p.removeChild(n)
}, false)
