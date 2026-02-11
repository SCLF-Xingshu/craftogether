// editor.js
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Wait until Scratch GUI is loaded
document.addEventListener('DOMContentLoaded', () => {
    // gui.js already creates the Scratch VM and attaches it to window.vm
    const vm = window.vm;
    if (!vm) {
        console.error('Scratch VM not found. Make sure gui.js is loaded first.');
        return;
    }

    // Create a Yjs document
    const ydoc = new Y.Doc();

    // Connect to a public Yjs room
    const projectId = 'shared-scratch'; // change this for different rooms
    const provider = new WebsocketProvider(
        'wss://demos.yjs.dev',       // free public Yjs server
        `craftogether-${projectId}`,  // room name
        ydoc
    );

    // Shared project data
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

    console.log('✅ Real-time collaboration enabled for Scratch VM!');
});
