var Sortable = require('..');

var els = document.querySelectorAll('.numbers, .languages, .handle');
var ul = document.querySelector('.one');

// all
[].slice.call(els).forEach(function(el){
  var sortable = new Sortable(el);
  if ('handle' == el.className) sortable.handle('span');
  sortable.ignore('[disabled]');
  sortable.bind('li');
});

var publicEl = document.querySelector('.public');
var s = new Sortable(publicEl);
s.max(5);
s.bind('li');
s.on('max', function(count) {
  alert('max count ' + count +' reached');
});

var privateEl = document.querySelector('.private');
var s1 = new Sortable(privateEl);
s1.bind('li');
s.connect(s1);
s1.on('update', function(el){
    console.log(el);
});

var p = document.querySelector('#languages');
document.getElementById('add').addEventListener('click', function(){
    var n = document.createElement('div');
    n.innerHTML = '<li>Python</li>';
    p.appendChild(n);
}, false);

document.getElementById('remove').addEventListener('click', function(){
    var n = p.firstElementChild;
    p.removeChild(n);
}, false);

(function(){
  var p1 = document.querySelector('.p1');
  var s1 = new Sortable(p1);
  s1.bind('li');
  s1.on('update', function(el){
      console.log(el);
  });
  var p2 = document.querySelector('.p2');
  var s2 = new Sortable(p2);
  s2.bind('li');
  s1.connect(s2);
  s2.connect(s1);
  s2.on('update', function(el){
      console.log(el);
  });
})()
