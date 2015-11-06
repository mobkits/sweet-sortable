# sortable

  Make your element sortable with sweet animation of high performance.

  Works at least on ios safari, Mac Safari, Chrome, firefox, mobile chrome

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
* Css transition property should **not** exist on dragging elements
* No connect support right now

## Installation

    $ npm install sweet-sortable

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
  - `start`(e), emitted when the drag starts.
  - `end`(e), emitted at the end of D&D

#### Sortable(el)

Initialize Sortable with `el`.

#### .bind(selector)

Bind internal events with selector, this method must be called.

#### .horizon()

Make sortable works in horizon mode (default vertical mode)

#### .ignore(selector)

Ignore items matching the given `selector`.

#### .handle(selector)

Set the handle to `selector`.

#### .remove()

Unbind all the event listeners.

## License

Sweet-sortable, make elements sortable with sweet animation
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

