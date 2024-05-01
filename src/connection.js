import * as commandHistory from './commandHistory.js';

const term = new Terminal({
	fontFamily: 'Reddit Mono',
	letterSpacing: '0px',
	theme: {
		background: '#1a1a1a',
	},
});
io = io();
const fitAddon = new FitAddon.FitAddon();

export const connect = (consoleEl, commandLineEl) => {
	term.loadAddon(fitAddon);
	term.open(consoleEl);
	term._core._renderService.dimensions.css.cell.width = 4; // usually NaN idk why
	fitAddon.fit();
	
	io.on('data', data => {
		const stream = new Uint8Array(data);
		term.writeln(stream);
	});
	io.on('disconnected', () => {
		term.writeln(`\x1b[3m\x1b[90mYou've been disconnected!\x1b[0m`);
	});
	io.emit('begin');
	
	commandLineEl.addEventListener('keydown', e => {
		switch (e.key) {
			case 'Enter':
				e.preventDefault();
				const input = commandLineEl.value;
				commandLineEl.value = '';
				commandHistory.addToCommandHistory(input);
				commandHistory.resetCommandHistoryInd();
				io.emit('sendData', input);
				break;
			case 'ArrowUp':
				e.preventDefault();
				const prevCommand = commandHistory.getPrevCommand();
				if (prevCommand) commandLineEl.value = prevCommand;
				break;
			case 'ArrowDown':
				e.preventDefault();
				const nextCommand = commandHistory.getNextCommand();
				if (nextCommand) commandLineEl.value = nextCommand;
				break;
			default:
				break;
		}
	});
	
	window.addEventListener('keydown', e => {
		if (e.key === 'C' && e.ctrlKey) {
			io.emit('kill');
		}
	});
}

export const clear = () => {
	term.clear();
}