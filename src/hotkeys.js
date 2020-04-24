export const isExit = (key, input) =>
  key.ctrl && (input === 'c' || input === 'с')
export const isNewTask = (key, input) => input === 'n' || input === 'т'
export const isNewFolder = (key, input) => input === 'f' || input === 'а'
export const isChange = (key, input) => input === 'c' || input === 'с'
export const isMark = (key, input) => input === 'm' || input === 'ь'
export const isDelete = (key, input) => input === 'd' || input === 'в'
export const isMoveUp = (key, input) => input === 'k' || input === 'л'
export const isMoveDown = (key, input) => input === 'j' || input === 'о'
export const isCut = (key, input) => input === 'x' || input === 'ч'
export const isPaste = (key, input) => input === 'p' || input === 'з'
