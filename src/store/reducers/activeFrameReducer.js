import * as types from '../actions/actionTypes';
import Tone from '../../../node_modules/tone';

export const GRID_INITIAL_COLOR = '#00000000';

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

const playSound = (frames, {color, paletteColor}) => {
  // compares current color to palette color being painted
  if (color !== paletteColor) {

    // create a synth and connect it to the master output (your speakers)
    const synth = new Tone.Synth().toMaster();

    let note = '';

    switch (paletteColor) {
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
        note = 'G4';
        break;
      case '#28ff00':
        note = 'C5';
        break;
      case '#28ffe8':
        note = 'C#4';
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

export default function(frames, action) {
  switch (action.type) {
    case types.APPLY_PENCIL:
      playSound(frames, action);
      return applyPencil(frames, action);
    case types.APPLY_ERASER:
      return applyEraser(frames, action);
    case types.APPLY_BUCKET:
      return applyBucket(frames, action);
    case types.SET_RESET_GRID:
      return resetGrid(frames);
    case types.CHANGE_FRAME_INTERVAL:
      return changeFrameInterval(frames, action);
    default:
      return frames;
  }
}
