
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import XMLToReact from 'xml-to-react';

class MyListItem extends Component {
  state = {
    ticked: false
  }

  handleClick(event) {
    this.setState({ ticked: !ticked });
  }

  return (
    <li onClick={this.handleClick}>
    {this.props.children}
    </li>
  );
}

const xmlToReact = new XMLToReact({
  List: attrs => ({ type: 'ul', props: attrs }),
  Todo: attrs => ({ type: MyListTodo, props: attrs })
});

const reactTree = xmlToReact.convert(`
  <List name="simple">
    <Todo i="1">one</Todo>
    <Todo>two</Todo>
    <Todo>three</Todo>
  </List>
`);

ReactDOM.render('app-container', reactTree);
