# XML-to-React

[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](LICENSE)

Converts an XML document into a React tree.

## Installation

```sh
npm i --save xml-to-react
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.

## Usage

```js
import XMLToReact from 'xml-to-react';

const xmlToReact = new XMLToReact({/* converters */});
const reactTree = xmlToReact.convert(/* XML string */);
```

### Simple Example

Convert XML nodes into DOM elements with any provided attributes

```js
import ReactDOM from 'react-dom';
import XMLToReact from 'xml-to-react';
import MyListItem from './MyListItem';

const xmlToReact = new XMLToReact({
  Example: (attrs) => ({ type: 'ul', props: attrs }),
  Item: (attrs) => ({ type: MyListItem, props: attrs })
});

const reactTree = xmlToReact.convert(`
  <Example name="simple">
    <Item i="1">one</Item>
    <Item>two</Item>
    <Item>three</Item>
  </Example>
`);

ReactDOM.render('app-container', reactTree);
```

```jsx
export default function MyListItem({ children, i }) {
  return <li data-i={i}>{children}</li>;
}
```

This example would render the following:

```html
<div id="app-container">
  <ul name="simple">
    <li data-i="1">one</li>
    <li>two</li>
    <li>three</li>
  </ul>
</div>
```

### Converters

Converters are required mapping functions that define how an XML node should be converted to React. A converter must return an object in the format `{ type, [props] }`, which is intended to be passed to [`React.createElement`](https://reactjs.org/docs/react-api.html#createelement).

- `type` - required tagName, React component, or React fragment
- `props` - (optional) props object

#### Example

```js
function myConverter(attributes) {
  return {
    type: 'div',
    props: {
      className: 'test'
    }
  }
}
```

### `XMLToReact` constructor

The `XMLToReact` class is instantiated with a map of converters.

```js
{
  nodeName: converterFunction
}
```

### `convert( xml, data )`

- `xml` `{string}` - xml node or document
- `data` `{Object}` - (optional) any data to be passed to all converters
