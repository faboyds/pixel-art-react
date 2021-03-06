import { ActionCreators } from 'redux-undo';
import * as types from './actionTypes';

export function setInitialState(options) {
  return {
    type: types.SET_INITIAL_STATE,
    options
  };
}

export function changeDimensions(gridProperty, increment) {
  return {
    type: types.CHANGE_DIMENSIONS,
    gridProperty,
    increment
  };
}

export function updateGridBoundaries(gridElement) {
  return {
    type: types.UPDATE_GRID_BOUNDARIES,
    gridElement
  };
}

export function selectPaletteColor(position) {
  return {
    type: types.SELECT_PALETTE_COLOR,
    position
  };
}

export function setCustomColor(customColor) {
  return {
    type: types.SET_CUSTOM_COLOR,
    customColor
  };
}

export function cellAction({
  id,
  drawingTool,
  color,
  paletteColor,
  columns,
  rows
}) {
  return {
    type: `APPLY_${drawingTool}`,
    id,
    color,
    paletteColor,
    columns,
    rows
  };
}

export function setDrawing(frames, paletteGridData, cellSize, columns, rows) {
  return {
    type: types.SET_DRAWING,
    frames,
    paletteGridData,
    cellSize,
    columns,
    rows
  };
}

export function endDrag() {
  return {
    type: types.END_DRAG
  };
}

export function switchTool(tool) {
  return {
    type: types.SWITCH_TOOL,
    tool
  };
}

export function applySoundToCell(note, id) {
  return {
    type: types.APPLY_SOUND_TO_CELL,
    note,
    id
  };
}

export function playMusic() {
  return {
    type: types.PLAY_MUSIC
  };
}

export function stopMusic() {
  return {
    type: types.STOP_MUSIC
  };
}

export function setCellSize(cellSize) {
  return {
    type: types.SET_CELL_SIZE,
    cellSize
  };
}

export function setCurrentCell(currentCell) {
  return {
    type: types.SET_CURRENT_CELL,
    currentCell
  };
}

export function resetGrid() {
  return {
    type: types.SET_RESET_GRID
  };
}

export function showSpinner() {
  return {
    type: types.SHOW_SPINNER
  };
}

export function hideSpinner() {
  return {
    type: types.HIDE_SPINNER
  };
}

export function sendNotification(message) {
  return {
    type: types.SEND_NOTIFICATION,
    message
  };
}

export function changeActiveFrame(frameIndex) {
  return {
    type: types.CHANGE_ACTIVE_FRAME,
    frameIndex
  };
}

export function reorderFrame(selectedIndex, destinationIndex) {
  return {
    type: types.REORDER_FRAME,
    selectedIndex,
    destinationIndex
  };
}

export function createNewFrame() {
  return {
    type: types.CREATE_NEW_FRAME
  };
}

export function deleteFrame(frameId) {
  return {
    type: types.DELETE_FRAME,
    frameId
  };
}

export function duplicateFrame(frameId) {
  return {
    type: types.DUPLICATE_FRAME,
    frameId
  };
}

export function setDuration(duration) {
  return {
    type: types.SET_DURATION,
    duration
  };
}

export function changeFrameInterval(interval) {
  return {
    type: types.CHANGE_FRAME_INTERVAL,
    interval
  };
}

export function newProject() {
  return {
    type: types.NEW_PROJECT
  };
}

export function undo() {
  return ActionCreators.undo();
}

export function redo() {
  return ActionCreators.redo();
}
