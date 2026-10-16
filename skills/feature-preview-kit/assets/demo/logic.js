// Tasks demo handlers — derived lists and updates the step DSL can't express.
FPK.handler('applyFilter', (ctx) => {
  const f = ctx.get('filter'), hideDone = ctx.get('settings.hideDone'), tasks = ctx.get('tasks') || [];
  ctx.set('visible', tasks.filter((t) => (f === 'open' ? !t.done : f === 'done' ? t.done : !(hideDone && t.done))));
  ctx.set('openCount', tasks.filter((t) => !t.done).length);
});
FPK.handler('loadSelected', (ctx) => {
  ctx.set('selected', (ctx.get('tasks') || []).find((t) => String(t.id) === String(ctx.get('selectedId'))) || null);
});
FPK.handler('toggleDone', (ctx) => {
  const id = String(ctx.get('selectedId'));
  ctx.set('tasks', (ctx.get('tasks') || []).map((t) => (String(t.id) === id ? Object.assign({}, t, { done: !t.done }) : t)));
  return ctx.run([{ run: 'loadSelected' }, { run: 'applyFilter' }, { toast: ctx.get('selected.done') ? 'Task reopened' : 'Task completed' }]);
});
// New tasks take "High" when the box is ticked, else the default priority from Settings.
FPK.handler('applyPriority', (ctx) => {
  const tasks = ctx.get('tasks'), last = tasks[tasks.length - 1];
  last.priority = ctx.get('draft.high') ? 'High' : ctx.get('settings.defaultPriority') || 'Normal';
});
