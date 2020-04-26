export default {
  root: { tag: 'root' },
  addingTask: (after?: number): AddingFocus => ({
    tag: 'addingTask',
    fallthrough: false,
    after: after,
  }),
  addingFolder: (after?: number): AddingFocus => ({
    tag: 'addingFolder',
    fallthrough: false,
    after: after,
  }),
  task: (id: number | null = null): FocusType => ({
    tag: 'task',
    id,
    fallthrough: true,
  }),
  folder: (id = null, name = null): FolderFocus => ({
    tag: 'folder',
    id,
    fallthrough: false,
    name,
  }),
  editingTask: (id = null): FocusType => ({
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
  after?: number
}
