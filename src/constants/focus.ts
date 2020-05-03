export default {
  root: { tag: 'root' },
  addingTask: (after: number | null): AddingFocus => ({
    tag: 'addingTask',
    fallthrough: false,
    after: after,
  }),
  addingFolder: (after: number | null): AddingFocus => ({
    tag: 'addingFolder',
    fallthrough: false,
    after: after,
  }),
  selectedTask: (id: number | null = null): FocusType => ({
    tag: 'task',
    id,
    fallthrough: true,
  }),
  editingTask: (id: null | number = null): FocusType => ({
    tag: 'editing',
    id,
    fallthrough: false,
  }),
  folder: (id: null | number = null): FocusType => ({
    tag: 'folder',
    id,
    fallthrough: false,
    route: true,
  }),
  task: (id: null | number = null): FocusType => ({
    tag: 'task',
    id,
    fallthrough: false,
    route: true,
  }),
  search: (id: null | number = null): FocusType => ({
    tag: 'search',
    id,
    fallthrough: false,
    route: true,
  }),
}

export interface FocusType {
  tag: string
  id?: number | null
  fallthrough: boolean
  route?: boolean
}

export interface AddingFocus extends FocusType {
  after: number | null
}
