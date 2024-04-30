import { connect, clear } from './src/connection.js';
import { createPopupMenu } from './src/popupMenu.js';

const consoleEl = document.querySelector('#console');
const commandLineEl = document.querySelector('#commandLine');

connect(consoleEl, commandLineEl);

const consoleContextMenuItems = [
	{
		text: 'Clear buffer',
		callback: clear,
	}
];
consoleEl.addEventListener('contextmenu', e => {
	e.preventDefault();
	createPopupMenu(consoleContextMenuItems, e.clientX, e.clientY);
})