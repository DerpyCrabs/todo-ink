export default {
  root: { tag: 'root' },
  addingTask: (after?: number): FocusType => ({
    tag: 'addingTask',
    fallthrough: false,
    after: after,
  }),
  addingFolder: (after?: number): FocusType => ({
    tag: 'addingFolder',
    fallthrough: false,
    after: after,
  }),
  task: (id: number | null = null): FocusType => ({
    tag: 'task',
    id,
  }),
  folder: (id = null, name = null): FocusType => ({
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
  name?: string | null
  fallthrough?: boolean
  after?: number
}
