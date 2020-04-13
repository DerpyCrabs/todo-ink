export default {
  root: { tag: 'root' },
  addingTask: (after) => ({
    tag: 'addingTask',
    fallthrough: false,
    after: after,
  }),
  addingFolder: (after) => ({
    tag: 'addingFolder',
    fallthrough: false,
    after: after,
  }),
  task: (id = null) => ({
    tag: 'task',
    id,
  }),
  folder: (id = null) => ({ tag: 'folder', id, fallthrough: false }),
  editingTask: (id = null) => ({
    tag: 'editing',
    id,
    fallthrough: false,
  }),
}
