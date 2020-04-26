import type { Key } from '../hooks/input'

export type Hotkey = (key: Key, input: string) => boolean

export const isExit: Hotkey = (key, input) =>
  key.ctrl && (input === 'c' || input === 'с')
export const isNewTask: Hotkey = (key, input) => input === 'n' || input === 'т'
export const isNewFolder: Hotkey = (key, input) =>
  input === 'f' || input === 'а'
export const isChange: Hotkey = (key, input) => input === 'c' || input === 'с'
export const isMark: Hotkey = (key, input) => input === 'm' || input === 'ь'
export const isDelete: Hotkey = (key, input) => input === 'd' || input === 'в'
export const isMoveUp: Hotkey = (key, input) => input === 'k' || input === 'л'
export const isMoveDown: Hotkey = (key, input) => input === 'j' || input === 'о'
export const isCut: Hotkey = (key, input) => input === 'x' || input === 'ч'
export const isPaste: Hotkey = (key, input) => input === 'p' || input === 'з'
export const isSearch: Hotkey = (key, input) => input === 's' || input === 'ы'
export const isEnter: Hotkey = (key) => key.return || key.rightArrow
export const isLeave: Hotkey = (key) => key.escape || key.leftArrow
export const isSelectNext: Hotkey = (key) => key.downArrow
export const isSelectPrev: Hotkey = (key) => key.upArrow
