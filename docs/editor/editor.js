// editor.js
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Scratch VM
    const vm = window.vm;
    if (!vm) {
        console.error('Scratch VM not found. Make sure Scratch GUI is loaded first.');
        return;
    }

    // Create a Yjs document
    const ydoc = new Y.Doc();

    // Connect to a public Yjs room
    const projectId = 'shared-scratch';
    const provider = new Y.WebsocketProvider(
        'wss://demos.yjs.dev',      // free public Yjs server
        `craftogether-${projectId}`, // room name
        ydoc
    );

    // Shared project map
    const yproject = ydoc.getMap('scratchProject');

    // Load existing project if any
    if (yproject.has('data')) {
        vm.loadProject(yproject.get('data'));
    }

    // Sync local changes to Yjs
    vm.on('PROJECT_CHANGED', () => {
        yproject.set('data', vm.toJSON());
    });

    // Sync remote changes from Yjs
    yproject.observe(event => {
        if (event.keysChanged.has('data')) {
            const json = yproject.get('data');
            vm.loadProject(json);
        }
    });

    console.log('✅ Real-time collaboration enabled!');
});
