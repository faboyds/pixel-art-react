import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CookieBanner from 'react-cookie-banner';
import WebMidi from 'webmidi';
import Speech from 'speak-tts';
import PixelCanvasContainer from './PixelCanvas';
import ModalContainer from './Modal';
import DimensionsContainer from './Dimensions';
import EraserContainer from './Eraser';
import PaletteGridContainer from './PaletteGrid';
import ResetContainer from './Reset';
import SaveDrawingContainer from './SaveDrawing';
import NewProjectContainer from './NewProject';
import SimpleNotificationContainer from './SimpleNotification';
import SimpleSpinnerContainer from './SimpleSpinner';
import UndoRedoContainer from './UndoRedo';
import PlayMusicContainer from './PlayMusic';
import initialSetup from '../utils/startup';
import drawHandlersProvider from '../utils/drawHandlersProvider';
import * as actionCreators from '../store/actions/actionCreators';

let midiInput;

let speech;

export class App extends React.Component {
  constructor() {
    super();
    this.state = {
      modalType: null,
      modalOpen: false,
      helpOn: false,
      showCookiesBanner: true,
      shiftIsPressed: false,
    };
    Object.assign(this, drawHandlersProvider(this));

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    initialSetup(this.props.dispatch, localStorage);

    const that = this;

    this.props.socket.on('apply-sound-to-cell', data => {
      that.props.actions.applySoundToCell(data.note, data.id);
    });

    WebMidi.enable((err) => {

      if (err) {
        console.log("WebMidi could not be enabled.", err);
        return;
      } 
      console.log("WebMidi enabled!");
      

      midiInput = WebMidi.inputs[0];

      if (midiInput) {
        midiInput.addListener('noteon', 'all',
          (e) => {
            console.log(`Received 'noteon' message (${e.note.name}${e.note.octave}).`);

            if (!that.props.playingMusic) {

              this.props.socket.emit('apply-sound-to-cell', {
                note: e.note.name + e.note.octave,
                id: that.props.currentCell
              });

              that.props.actions.applySoundToCell(e.note.name + e.note.octave, that.props.currentCell);
            }
          });
      }
    });

    speech = new Speech();
    if(speech.hasBrowserSupport()) {
      console.log("speech synthesis supported");

      speech.init({
        'lang': 'en-GB',
        'voice': 'Google UK English Female'
      }).then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        console.log("Speech is ready, voices are available", data);

      }).catch(e => {
        console.error("An error occured while initializing : ", e)
      });


    }
  }

  handleKeyDown(e) {
    e.preventDefault();

    if (e.keyCode === 9 && !this.state.shiftIsPressed /* tab */) {
      if (this.props.currentCell < this.props.countCells-1) {
        this.props.actions.setCurrentCell(this.props.currentCell + 1);
      }
    }

    if (e.keyCode === 9 && this.state.shiftIsPressed /* shift + tab */) {
      if (this.props.currentCell > 0) {
        this.props.actions.setCurrentCell(this.props.currentCell - 1);
      }
    }

    if (e.keyCode === 16 /* shift */) {
      this.setState({shiftIsPressed: true});
    }

    if (e.keyCode === 20 /* caps lock */) {
      if (!this.props.playingMusic) {

        if (!speech.speaking()) {

          speech.speak({
            text: 'The key bindings for this app navigations are. tab for moving one position forward. shift + tab' +
              ' for moving one position backwards. control to ear the current position. shift + control to play or stop the whole music.',
          }).then(() => {
            console.log("Success !");
          }).catch(err => {
            console.error("An error occurred :", err);
          });
        } else {
          speech.cancel();
        }
      }
    }
  }

  handleKeyUp(e) {
    e.preventDefault();

    if (e.keyCode === 16 /* shift */) {
      this.setState({shiftIsPressed: false});
    }

    if (e.keyCode === 17 && this.state.shiftIsPressed /* shift + ctrl */) {
      if (!this.props.playingMusic) {
        this.props.actions.playMusic();
      } else {
        this.props.actions.stopMusic();
      }
    } else if (e.keyCode === 17 /* ctrl */) {
      if (!this.props.playingMusic) {
        this.props.actions.setCurrentCell(this.props.currentCell);
      }
    }
  }

  changeModalType(type) {
    this.setState({
      modalType: type,
      modalOpen: true
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  hideCookiesBanner() {
    this.setState({
      showCookiesBanner: false
    });
  }

  toggleHelp() {
    this.setState({ helpOn: !this.state.helpOn });
  }

  render() {
    return (
      <div
        className="app__main"
        onMouseUp={this.onMouseUp}
        onTouchEnd={this.onMouseUp}
        onTouchCancel={this.onMouseUp}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      >
        <SimpleSpinnerContainer />
        <SimpleNotificationContainer
          fadeInTime={1000}
          fadeOutTime={1500}
          duration={1500}
        />
        <div
          className="app__frames-container"
          data-tooltip={
            this.state.helpOn
              ? `Create an awesome animation secuence.
              You can modify the duration of each frame, changing its own value.
              The number indicates where the frame ends in a range from 0 to 100.
              `
              : null
          }
        />
        <div className="app__central-container">
          <div className="left col-1-4">
            <div className="app__left-side">
              <div className="app__mobile--container">
                <div className="app__mobile--group">
                  <div data-tooltip={this.state.helpOn ? 'New project' : null}>
                    <NewProjectContainer />
                  </div>
                  <div className="app__load-save-container">
                    <button
                      className="app__load-button"
                      onClick={() => {
                        this.changeModalType('load');
                      }}
                      data-tooltip={
                        this.state.helpOn
                          ? 'Load projects you stored before'
                          : null
                      }
                    >
                      Load
                    </button>
                    <div
                      data-tooltip={
                        this.state.helpOn ? 'Save your project' : null
                      }
                    >
                      <SaveDrawingContainer />
                    </div>
                  </div>
                  <div
                    data-tooltip={
                      this.state.helpOn ? 'Undo Redo actions' : null
                    }
                  >
                    <UndoRedoContainer />
                  </div>
                  <div className="app__tools-wrapper grid-2">
                    <div
                      data-tooltip={this.state.helpOn ? 'Remove colors' : null}
                    >
                      <EraserContainer />
                    </div>

                    {/*
                    <div
                      data-tooltip={
                        this.state.helpOn
                          ? 'Sample a color from your drawing'
                          : null
                      }
                    >
                      <EyedropperContainer />
                    </div>
                    <div
                      data-tooltip={
                        this.state.helpOn
                          ? 'Choose a new color that is not in your palette'
                          : null
                      }
                    >
                      <ColorPickerContainer />
                      <div
                        data-tooltip={
                          this.state.helpOn
                            ? 'It fills an area of the current frame based on color similarity'
                            : null
                        }
                      >
                         <BucketContainer />

                      </div>

                    </div>
                    */}
                  </div>
                </div>
                <div className="app__mobile--group">
                  <PaletteGridContainer />
                </div>
              </div>
              <div className="app__mobile--container">
                {/*
                <div className="app__mobile--group">
                  <button
                    className="app__copycss-button"
                    onClick={() => {
                      this.changeModalType('copycss');
                    }}
                    data-tooltip={
                      this.state.helpOn ? 'Check your CSS generated code' : null
                    }
                  >
                    css
                  </button>
                </div>
                */}
                <div className="app__mobile--group">
                  <div className="app__social-container">
                    {/*
                    <div
                      data-tooltip={
                        this.state.helpOn
                          ? 'Tweet your creation in different formats'
                          : null
                      }
                    >
                      <button
                        className="app__twitter-button"
                        onClick={() => {
                          this.changeModalType('twitter');
                        }}
                      />
                    </div>
                    */}
                    <div
                      data-tooltip={
                        this.state.helpOn
                          ? 'Download your creation in different formats'
                          : null
                      }
                    >
                      <button
                        className="app__download-button"
                        onClick={() => {
                          this.changeModalType('download');
                        }}
                      />
                    </div>
                    <div data-tooltip="Toggle help tooltips">
                      <button
                        className={`app__toggle-help-button
                          ${this.state.helpOn ? ' selected' : ''}`}
                        onClick={() => {
                          this.toggleHelp();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="center col-2-4">
            <PixelCanvasContainer
              drawHandlersFactory={this.drawHandlersFactory}
            />
          </div>
          <div className="right col-1-4">
            <div className="app__right-side">
              <div className="app__mobile--container">
                <div className="app__mobile--group">
                  { /*
                  <button
                    className="app__preview-button"
                    onClick={() => {
                      this.changeModalType('preview');
                    }}
                    data-tooltip={
                      this.state.helpOn
                        ? 'Show a preview of your project'
                        : null
                    }
                  >
                    Preview
                  </button>
                    */ }
                  <div
                    data-tooltip={
                      this.state.helpOn ? 'Play your song' : null
                    }
                  >
                    <PlayMusicContainer />
                  </div>
                  <div
                    data-tooltip={
                      this.state.helpOn ? 'Reset the selected frame' : null
                    }
                  >
                    <ResetContainer />
                  </div>
                  <div
                    data-tooltip={
                      this.state.helpOn ? 'Number of columns and rows' : null
                    }
                  >
                    <DimensionsContainer />
                  </div>
                </div>
                {/*
                <div className="app__mobile--group">
                  <div
                    data-tooltip={
                      this.state.helpOn ? 'Size of one tile in px' : null
                    }
                  >
                    <CellSizeContainer />
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
        </div>


        <div>
          <h4>Short cuts</h4>
          <ul>
            <li><b>Tab</b> - move one cell forward</li>
            <li><b>Shift + Tab</b> - move one cell backward</li>
            <li><b>Ctrl</b> - play current cell sound</li>
            <li><b>Shift + Ctrl</b> - Play/Stop music</li>
            <li><b>Caps Lock</b> - Play help sound</li>
          </ul>
        </div>

        {/*
        <div className="css-container">
          <CssDisplayContainer />
        </div>
        */}
        {this.state.showCookiesBanner ? (
          <CookieBanner
            disableStyle
            message="
              This website uses cookies. By continuing to use
              this website you are giving consent to cookies
              being used. Thank you. "
            link={{
              msg: '',
              url: 'https://www.jvalen.com/pixelartcss/cookies.html',
              target: '_blank'
            }}
            onAccept={() => this.hideCookiesBanner()}
            cookie="user-has-accepted-cookies"
            dismissOnScroll={false}
          />
        ) : null}
        <ModalContainer
          type={this.state.modalType}
          isOpen={this.state.modalOpen}
          close={() => {
            this.closeModal();
          }}
          open={() => {
            this.changeModalType(this.state.modalType);
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  countCells: state.present.get('frames').get('columns') * state.present.get('frames').get('rows'),
  currentCell: state.present.getIn(['currentCell']),
  playingMusic: state.present.getIn(['playingMusic']),
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;
