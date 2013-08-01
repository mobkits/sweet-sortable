
# sortable

  UI Sortable component, see the [demo](http://chemzqm.github.io/sortable/index.html).

  Original repo [yields/sortable](https://github.com/yields/sortable)

  The changes of this fork is the D&D events is automatically bind when `mousedown` event is triggered
  in the element, and removed when `mouseup` triggered, so no worry about the element added or removed on
  the fly, you can even inintialize sortable with an empty element.

  However, the changes breaks the work of method `connect`, so pay attation, the `connect` method is not supported.


## Installation

    $ component install chemzqm/sortable

## API

#### events

  - `update`, emitted when sort changes happen.
  - `start`(e), emitted when the drag starts.
  - `drop`(e), emitted when drop happens.

#### Sortable(el)

Initialize Sortable with `el`.

#### .ignore(selector)

Ignore items matching the given `selector`.

#### .handle(selector)

Set the handle to `selector`.

#### .bind(selector)

Bind internal events with selector.

#### .unbind()

Unbind internal events.

## License

  MIT
