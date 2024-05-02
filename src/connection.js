import * as commandHistory from './commandHistory.js';

const term = new Terminal({
	fontFamily: 'Reddit Mono',
	letterSpacing: '0px',
	theme: {
		background: '#1a1a1a',
	},
});
const minimapTerm = new Terminal({
	fontFamily: 'Reddit Mono',
	letterSpacing: '0px',
	theme: {
		background: '#1a1a1a',
	},
	rows: 16,
	cols: 16,
});
io = io();
const fitAddon = new FitAddon.FitAddon();
let fetchingMapData = false;

const convertLFtoCRLF = byteArray => {
	const crlfArray = new Uint8Array(byteArray.length * 2);
	let index = 0;
	for (let i = 0; i < byteArray.length; i++) {
        if (byteArray[i] === 10) { // LF (0x0A) found
            crlfArray[index++] = 13; // CR (0x0D)
            crlfArray[index++] = 10; // LF (0x0A)
        } else {
            crlfArray[index++] = byteArray[i];
        }
	}
	return crlfArray.slice(0, index);
}

export const connect = (consoleEl, commandLineEl, minimapEl) => {
	term.loadAddon(fitAddon);
	term.open(consoleEl);
	term._core._renderService.dimensions.css.cell.width = 4; // usually NaN idk why
	fitAddon.fit();

	minimapTerm.open(minimapEl);
	
	io.on('data', data => {
		const stream = new Uint8Array(data);
		// console.log(Array.from(stream).map(byte => ({ c: String.fromCharCode(byte), b: byte.toString(16) })));
		if (!fetchingMapData) term.writeln(convertLFtoCRLF(stream));
		else {
			fetchingMapData = false;
			minimapTerm.writeln(convertLFtoCRLF(stream));
		}
	});
	io.on('disconnected', () => {
		term.writeln(`\x1b[3m\x1b[90m[dreck] You've been disconnected!\x1b[0m`);
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
				sendCommand(input);
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
		if (e.key === 'c' && e.ctrlKey) {
			io.emit('kill');
		}
	});
}

export const sendCommand = command => {
	io.emit('sendData', command);
	if (['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'u', 'd'].includes(command)) {
		setTimeout(() => {
			fetchingMapData = true;
			io.emit('sendData', 'map');
		}, 500);
	}
}

export const clear = () => {
	term.clear();
}