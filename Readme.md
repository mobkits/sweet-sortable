
# sortable

  UI Sortable component, see the [demo](http://chemzqm.github.io/sortable/index.html).

  Original repo [yields/sortable](https://github.com/yields/sortable)

  The changes of this fork is the D&D events is automatically bind when `mousedown` event is triggered
  in the element, and removed when `mouseup` triggered, so no worry about the element added or removed on
  the fly, you can even inintialize sortable with an empty element.

## Installation

    $ component install chemzqm/sortable

## Example

``` html
<ul class='languages'>
  <li>Javascript</li>
  <li>Lua</li>
  <li disabled>Google Go</li>
  <li>Julia</li>
</ul>
```

``` js
var Sortable = require('sortable');
var sortable = new Sortable(el);
sortable.ignore('[disabled]');
sortable.bind('li');
```

## API

#### events

  - `update`, emitted when sort changes happen.
  - `start`(e), emitted when the drag starts.
  - `drop`(e), emitted when drop happens.

#### Sortable(el)

Initialize Sortable with `el`.

#### .bind(selector)

Bind internal events with selector, this method must be called.

#### .ignore(selector)

Ignore items matching the given `selector`.

#### .handle(selector)

Set the handle to `selector`.

#### .connect(sortable)

Connect to another sortable, the element of another sortable could be dragged to this sortable element.

### .remove()

Unbind all the events.

## License

  MIT
