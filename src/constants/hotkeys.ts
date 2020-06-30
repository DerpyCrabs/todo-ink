import type { Hotkey } from '../hooks/hotkeys'

export const isExit: Hotkey = (key, input) =>
  key.ctrl && (input === 'c' || input === 'с')
export const isNewTask: Hotkey = (key, input) => input === 't' || input === 'е'
export const isNewFolder: Hotkey = (key, input) =>
  input === 'f' || input === 'а'
export const isNewTaskBefore: Hotkey = (key, input) =>
  input === 'T' || input === 'Е'
export const isNewFolderBefore: Hotkey = (key, input) =>
  input === 'F' || input === 'А'
export const isNewNote: Hotkey = (key, input) => input === 'n' || input === 'т'
export const isNewNoteBefore: Hotkey = (key, input) =>
  input === 'N' || input === 'Т'
export const isChange: Hotkey = (key, input) => input === 'c' || input === 'с'
export const isMark: Hotkey = (key, input) => input === 'm' || input === 'ь'
export const isDelete: Hotkey = (key, input) => input === 'd' || input === 'в'
export const isMoveUp: Hotkey = (key, input) => input === 'k' || input === 'л'
export const isMoveDown: Hotkey = (key, input) => input === 'j' || input === 'о'
export const isCut: Hotkey = (key, input) => input === 'x' || input === 'ч'
export const isPaste: Hotkey = (key, input) => input === 'p' || input === 'з'
export const isPasteBefore: Hotkey = (key, input) =>
  input === 'P' || input === 'З'
export const isSearch: Hotkey = (key, input) => input === 's' || input === 'ы'
export const isEnter: Hotkey = (key) => key.return || key.rightArrow
export const isLeave: Hotkey = (key) => key.escape || key.leftArrow
export const isSelectNext: Hotkey = (key) => key.downArrow
export const isSelectPrev: Hotkey = (key) => key.upArrow
export const isEdit: Hotkey = (key, input) =>
  process.env.NODE_ENV === 'test' ? false : input === 'e' || input === 'у'
export const isUndo: Hotkey = (key, input) => input === 'u' || input === 'г'
export const isExpand: Hotkey = (key, input) => input === 'e' || input === 'у'
