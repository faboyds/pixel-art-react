import React from 'react';

const GRID_INITIAL_COLOR = '#313131';

export default class PixelCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const keys = ['color', 'width'];
    const isSame = keys.every(
      key => this.props.cell[key] === nextProps.cell[key]
    );
    return !isSame;
  }
  render() {
    const {
      cell: { color, width },
      id,
      isCurrentCell,
      drawHandlers: { onMouseDown, onMouseOver }
    } = this.props;
    const styles = {
      width: `${width}%`,
      paddingBottom: `${width}%`,
      backgroundColor: color || GRID_INITIAL_COLOR,
      borderRadius: '0px 0px 0px 0px',
      border: '1px solid #383530'
    };

    if(isCurrentCell) {
      styles.border = '1px solid #ffffff';
    }

    return (
      <div
        onMouseDown={ev => onMouseDown(id, ev)}
        onMouseOver={ev => onMouseOver(id, ev)}
        onFocus={ev => onMouseOver(id, ev)}
        onTouchStart={ev => onMouseDown(id, ev)}
        style={styles}
      />
    );
  }
}
