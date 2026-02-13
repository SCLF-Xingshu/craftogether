// editor.js
document.addEventListener('DOMContentLoaded', async () => {
  // --- Scratch VM ---
  const vm = window.vm;
  if (!vm) {
    console.error('Scratch VM not found. Make sure Scratch GUI is loaded first.');
    return;
  }

  // --- Project ID ---
  const projectId = new URLSearchParams(location.search).get('project') || 'shared-scratch';

  // --- Yjs document ---
  const ydoc = new Y.Doc();
  const yProject = ydoc.getMap('project'); // renamed for clarity

  // --- Load backup from Supabase ---
  const { data: projectData } = await supabase
    .from('projects')
    .select('yjs_update')
    .eq('id', projectId)
    .single();

  if (projectData?.yjs_update) {
    Y.applyUpdate(ydoc, projectData.yjs_update);
  }

  // --- Apply Yjs state to Scratch VM ---
  if (yProject.has('data')) {
    vm.loadProject(yProject.get('data'));
  }

  // --- Listen to VM changes and update Yjs ---
  vm.on('PROJECT_CHANGED', () => {
    yProject.set('data', vm.toJSON());
  });

  // --- Observe Yjs changes and apply to VM ---
  yProject.observe(event => {
    if (event.keysChanged.has('data')) {
      const json = yProject.get('data');
      vm.loadProject(json);
    }
  });

  // --- Persist Yjs updates to Supabase ---
  ydoc.on('update', async (update) => {
    await supabase.from('projects')
      .upsert({ id: projectId, yjs_update: update });
  });

  // --- Realtime subscription for Supabase ---
  const channel = supabase.channel(`realtime-project-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      },
      payload => {
        const update = payload.new.yjs_update;
        if (update) Y.applyUpdate(ydoc, update);
      }
    )
    .subscribe();

  console.log(`Real-time collaboration enabled (Supabase) for project: ${projectId}`);
});
