import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import VirtualMachine from 'scratch-vm';
import ScratchGUI from 'scratch-gui';
import 'scratch-gui/dist/gui.css';

// Create the Scratch engine
const vm = new VirtualMachine();

// Create a Yjs document
const ydoc = new Y.Doc();

// Connect to a public Yjs room
const projectId = 'shared-scratch';
const provider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    `craftogether-${projectId}`,
    ydoc
);

// Shared project data
const yproject = ydoc.getMap('scratchProject');

// Load existing data if present
if (yproject.has('data')) {
    vm.loadProject(yproject.get('data'));
}

// When local changes happen, save them
vm.on('PROJECT_CHANGED', () => {
    yproject.set('data', vm.toJSON());
});

// When remote changes happen, load them
yproject.observe(event => {
    if (event.keysChanged.has('data')) {
        const json = yproject.get('data');
        vm.loadProject(json);
    }
});

// Mount Scratch GUI
const gui = new ScratchGUI({ vm });
document.getElementById('app').appendChild(gui.render());

// Wait until Scratch GUI is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Scratch GUI exposes `window.vm` if you attach it
  const vm = window.vm; // reference to Scratch VM from GUI

  // Yjs setup
  import * as Y from 'yjs';
  import { WebsocketProvider } from 'y-websocket';

  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    'craftogether-my-first-project',
    ydoc
  );
  const yproject = ydoc.getMap('scratchProject');

  // Load existing project if any
  if (yproject.has('data')) vm.loadProject(yproject.get('data'));

  // Sync changes
  vm.on('PROJECT_CHANGED', () => {
    yproject.set('data', vm.toJSON());
  });
  yproject.observe(event => {
    if (event.keysChanged.has('data')) {
      const json = yproject.get('data');
      vm.loadProject(json);
    }
  });
});

