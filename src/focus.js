export default {
  addingTask: { tag: 'adding' },
  task: (id = null) => ({
    tag: 'task',
    id,
  }),
  editingTask: (id) => ({
    tag: 'editing',
    id,
  }),
}
