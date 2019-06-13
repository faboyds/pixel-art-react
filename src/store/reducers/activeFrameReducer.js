import * as types from '../actions/actionTypes';
import Tone from '../../../node_modules/tone';

export const GRID_INITIAL_COLOR = '#00000000';

let musicTimeouts = [];

const updateFrameProp = prop => propReducer => (frames, action) => {
  const activeIndex = frames.get('activeIndex');
  return frames.updateIn(['list', activeIndex, prop], stateProp =>
    propReducer(stateProp, action)
  );
};

const updateGrid = updateFrameProp('grid');
const updateInterval = updateFrameProp('interval');

const isSameColor = (colorA, colorB) =>
  (colorA || GRID_INITIAL_COLOR) === (colorB || GRID_INITIAL_COLOR);

const getSameColorAdjacentCells = (frameGrid, columns, rows, id, color) => {
  const adjacentCollection = [];
  let auxId;

  if ((id + 1) % columns !== 0) {
    // Not at the very right
    auxId = id + 1;
    if (isSameColor(frameGrid.get(auxId), color)) {
      adjacentCollection.push(auxId);
    }
  }
  if (id % columns !== 0) {
    // Not at the very left
    auxId = id - 1;
    if (isSameColor(frameGrid.get(auxId), color)) {
      adjacentCollection.push(auxId);
    }
  }
  if (id >= columns) {
    // Not at the very top
    auxId = id - columns;
    if (isSameColor(frameGrid.get(auxId), color)) {
      adjacentCollection.push(auxId);
    }
  }
  if (id < columns * rows - columns) {
    // Not at the very bottom
    auxId = id + columns;
    if (isSameColor(frameGrid.get(auxId), color)) {
      adjacentCollection.push(auxId);
    }
  }

  return adjacentCollection;
};

const drawPixel = (pixelGrid, color, id) => pixelGrid.set(id, color);

const setCurrentPixel = (pixelGrid, color, id) => pixelGrid.set(id, color);

const playSound = ({color, paletteColor: colorToPlay}) => {

  // const activeIndex = frames.get('activeIndex');
  // const currentColor = frames.getIn(['list', activeIndex, 'grid']).get(id);

  // compares current color to palette color being painted
  if (color !== colorToPlay) {

    let note = '';

    switch (colorToPlay) {
      case '#550000':
        note = 'F4';
        break;
      case '#740000':
        note = 'F#4';
        break;
      case '#b30000':
        note = 'G4';
        break;
      case '#ee0000':
        note = 'G#4';
        break;
      case '#ff6300':
        note = 'A4';
        break;
      case '#ffec00':
        note = 'A#4';
        break;
      case '#99ff00':
        note = 'B4';
        break;
      case '#28ff00':
        note = 'C5';
        break;
      case '#28ffe8':
        note = 'C#5';
        break;
      case '#007cff':
        note = 'D5';
        break;
      case '#0500ff':
        note = 'D#5';
        break;
      case '#4500ea':
        note = 'E5';
        break;
      case '#57009e':
        note = 'F5';
        break;
      case '#55004f':
        note = 'F#5';
        break;
      default:
        break;
    }

    const synth = new Tone.PolySynth().toMaster();
    synth.triggerAttackRelease(note, "8n");
  }
};

const applyBucketToGrid = (grid, { id, paletteColor, columns, rows }) => {
  const queue = [id];
  const cellColor = grid.get(id);
  let currentId;
  let newGrid = grid;
  let adjacents;
  let auxAdjacentId;
  let auxAdjacentColor;

  while (queue.length > 0) {
    currentId = queue.shift();
    newGrid = drawPixel(newGrid, paletteColor, currentId);
    adjacents = getSameColorAdjacentCells(
      newGrid,
      columns,
      rows,
      currentId,
      cellColor
    );

    for (let i = 0; i < adjacents.length; i++) {
      auxAdjacentId = adjacents[i];
      auxAdjacentColor = newGrid.get(auxAdjacentId);
      // Avoid introduce repeated or painted already cell into the queue
      if (
        queue.indexOf(auxAdjacentId) === -1 &&
        auxAdjacentColor !== paletteColor
      ) {
        queue.push(auxAdjacentId);
      }
    }
  }

  return newGrid;
};

const applyPencilToGrid = (pixelGrid, { paletteColor, id }) =>
  drawPixel(pixelGrid, paletteColor, id);

const applyBucket = updateGrid(applyBucketToGrid);

const applyPencil = updateGrid(applyPencilToGrid);

const applyEraser = updateGrid((pixelGrid, { id }) =>
  drawPixel(pixelGrid, GRID_INITIAL_COLOR, id)
);

const resetGrid = updateGrid(pixelGrid =>
  pixelGrid.map(() => GRID_INITIAL_COLOR)
);

const changeFrameInterval = updateInterval(
  (previousInterval, { interval }) => interval
);

const playGridMusic = (frames, action) => {

  const activeIndex = frames.get('activeIndex');
  const grid = frames.getIn(['list', activeIndex, 'grid']);

  let i = 0;
  for (const cell of grid) {

    musicTimeouts.push(setTimeout(() => {
      playSound({ color: '', paletteColor: cell });
    }, 350 * i));

    i +=1;
  }
};

export const stopGridMusic = () => {

  for (const to of musicTimeouts) {
    clearTimeout(to);
  }
  musicTimeouts = [];
};

const applySoundToCell = (action) => {

  let color = GRID_INITIAL_COLOR;

  switch (action.note) {
    case 'F4':
      color = '#550000';
      break;
    case 'F#4':
      color = '#740000';
      break;
    case 'G4':
      color = '#b30000';
      break;
    case 'G#4':
      color = '#ee0000';
      break;
    case 'A4':
      color = '#ff6300';
      break;
    case 'A#4':
      color = '#ffec00';
      break;
    case 'B4':
      color = '#99ff00';
      break;
    case 'C5':
      color = '#28ff00';
      break;
    case 'C#5':
      color = '#28ffe8';
      break;
    case 'D5':
      color = '#007cff';
      break;
    case 'D#5':
      color = '#0500ff';
      break;
    case 'E5':
      color = '#4500ea';
      break;
    case 'F5':
      color = '#57009e';
      break;
    case 'F#5':
      color = '#55004f';
      break;
    default:
      break;
  }

  playSound({ color: '', paletteColor: color });

  action.paletteColor = color;
};


const setCurrentCell = (frames, action)  => {

  const activeIndex = frames.get('activeIndex');
  const grid = frames.getIn(['list', activeIndex, 'grid']);

  playSound({ color: '', paletteColor: grid.get(action.currentCell) });
};

export default function(frames, action) {
  switch (action.type) {
    case types.APPLY_PENCIL:
      // playSound(action);
      return applyPencil(frames, action);
    case types.APPLY_SOUND_TO_CELL:
      applySoundToCell(action);
      return applyPencil(frames, action);
    case types.SET_CURRENT_CELL:
      setCurrentCell(frames, action);
      return frames;
    case types.APPLY_ERASER:
      return applyEraser(frames, action);
    case types.APPLY_BUCKET:
      return applyBucket(frames, action);
    case types.SET_RESET_GRID:
      return resetGrid(frames);
    case types.CHANGE_FRAME_INTERVAL:
      return changeFrameInterval(frames, action);
    case types.PLAY_MUSIC:
      playGridMusic(frames, action);
      return frames;
    default:
      return frames;
  }
}
