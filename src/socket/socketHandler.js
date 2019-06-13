import io from 'socket.io-client';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';
import { connect } from 'react-redux';
import React from 'react';

export const socket = io.connect('http://localhost:3000');

export class SocketHandler extends React.Component {

  //LISTENERS
  componentDidMount() {
    const that = this;
    socket.on('apply-pencil', data => {
      console.log(data.palleteColor + data.id);
      this.props.actions.applySoundToCell("C#5", that.props.currentCell);
      // drawPixel(data.palleteColor, data.id);
    });
  }

  emitApplyPencilToGrid (palleteColor, id) {
    socket.emit('apply-pencil', {
      palleteColor,
      id,
    });
  }
}









// Connect to store
const mapStateToProps = state => ({
  countCells: state.present.get('frames').get('columns') * state.present.get('frames').get('rows'),
  currentCell: state.present.getIn(['currentCell']),
  playingMusic: state.present.getIn(['playingMusic']),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const SocketHandlerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SocketHandler);
export default SocketHandlerContainer;


