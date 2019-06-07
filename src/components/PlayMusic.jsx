import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../store/actions/actionCreators';

const PlayMusic = props => {
  const playMusic = () => {
    props.actions.playMusic();
  };

  const stopMusic = () => {
    props.actions.stopMusic();
  };

  const { playingMusic } = props;

  return (
    <div className="play-music">
      <button
        onClick={() => {
          if(!playingMusic) {
            playMusic();
          } else {
            stopMusic();
          }
        }}
      >
        { !playingMusic? 'Play' : 'Stop'}
      </button>
    </div>
  );
};

const mapStateToProps = state => ({
  playingMusic: state.present.getIn(['playingMusic']),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const PlayMusicContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayMusic);
export default PlayMusicContainer;
