# sweet-sortable

[![NPM version](https://img.shields.io/npm/v/sweet-sortable.svg?style=flat-square)](https://www.npmjs.com/package/sweet-sortable)
[![Build Status](https://img.shields.io/travis/chemzqm/sweet-sortable/master.svg?style=flat-square)](http://travis-ci.org/chemzqm/sweet-sortable)
[![Coverage Status](https://img.shields.io/coveralls/chemzqm/sweet-sortable/master.svg?style=flat-square)](https://coveralls.io/github/chemzqm/sweet-sortable?branch=master)
[![Dependency Status](https://img.shields.io/david/chemzqm/sweet-sortable.svg?style=flat-square)](https://david-dm.org/chemzqm/sweet-sortable)

  Make your element sortable with sweet animation of high performance.

  Works at least on ios safari, Mac Safari, Chrome, firefox, mobile chrome

  Should not works at ie < 9

  [demo](http://chemzqm.github.io/sweet-sortable/index.html).

## Features

* High performance animation
* Support mobile and desktop
* Handler element and disabled element can be set be css selector
* Not using html5 D&D, you can style dragging element by css
* Children can dynamic added or removed from list
* ~4k when minified and gzip (umd version)

## Limitation

* `border-box` must be used for `box-sizing`, eg:
``` css
*, *::before, *::after {
  box-sizing: border-box;
}
```
* Only horizon and vertical sort supportted
* transition property should **not** exist on dragging elements style attribute (set via css is fine)
* No connect support right now

## Installation

    $ npm install sweet-sortable

Or use the umd version in [build folder](https://github.com/chemzqm/sweet-sortable/tree/master/build)

## Example

``` html
<ul id='languages'>
  <li>Javascript</li>
  <li>Lua</li>
  <li disabled>Google Go</li>
  <li>Julia</li>
</ul>
```

``` js
var Sortable = require('sweet-sortable');
var el = document.getElementById('languages');
var sortable = new Sortable(el);
sortable.ignore('[disabled]');
sortable.bind('li');
```

## API

#### events

  - `update`, emitted with change element when sort changes happen.
  - `starting`, emitted just before dragging start
  - `start`(e), emitted when the drag starts.
  - `end`(e), emitted at the end of D&D

#### Sortable(el, [options])

Initialize Sortable with `el`.

`options.delta` is the center distance number in px to config when the animation take place,
`options.delay` set the delay for dragging start and touch move, default `100` (need this to avoid some wired problem)

increase the value if you want animation happens earlier.  default is 10

#### .bind(selector)

Bind internal events with selector, this method must be called.

#### .horizon()

Make sortable works in horizon mode (default vertical mode)

#### .ignore(selector)

Ignore items matching the given `selector`.

#### .handle(selector)

Set the handle to `selector`.

#### .connect(Sortable)

Connect to another Sortable instance, two way connect is possible

__Notice__ not realy stable yet

#### .unbind()

Unbind all the event listeners.

## License

Copyright © 2015 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

