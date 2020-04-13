export default {
  root: { tag: 'root' },
  addingTask: (after) => ({ tag: 'adding', fallthrough: false, after: after }),
  task: (id = null) => ({
    tag: 'task',
    id,
  }),
  folder: (id = null) => ({ tag: 'folder', id }),
  editingTask: (id) => ({
    tag: 'editing',
    id,
    fallthrough: false,
  }),
}
