const express = require('express');
const net = require('net');

// webpage server
const app = express();
app.use(express.static('.'));
app.get('/', (req, res) => {
	res.redirect('/index.html');
});
console.log("listening on port 80");
const server = app.listen(80);

// telnet connection
let telnetSocket;

// socket.io (send data between ↑ those two)
const io = require('socket.io')(server)
io.on('connection', clientSocket => {
	console.log('hey we got the go sign');
	telnetSocket = new net.Socket();
	// telnetSocket.connect({ host: 'erionmud.com', port: 1234 });
	// telnetSocket.connect({ host: 'proceduralrealms.com', port: 3000 });
	telnetSocket.connect({ host: 'wocmud.org', port: 4000 });
	telnetSocket.on('data', data => {
		io.emit('data', data);
	});
	telnetSocket.on('end', () => {
		io.emit('disconnected');
	});

	clientSocket.on('sendData', data => {
		telnetSocket.write(`${data}\r\n`);
	});

	clientSocket.on('kill', () => {
		telnetSocket.destroy();
	})
})