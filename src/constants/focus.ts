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
  task: (id: number | null = null): FocusType => ({
    tag: 'task',
    id,
    fallthrough: true,
  }),
  folder: (
    id: null | number = null,
    name: null | string = null
  ): FolderFocus => ({
    tag: 'folder',
    id,
    fallthrough: false,
    name,
  }),
  editingTask: (id: null | number = null): FocusType => ({
    tag: 'editing',
    id,
    fallthrough: false,
  }),
}

export interface FocusType {
  tag: string
  id?: number | null
  fallthrough: boolean
}

export interface FolderFocus extends FocusType {
  name: string | null
}

export interface AddingFocus extends FocusType {
  after: number | null
}
