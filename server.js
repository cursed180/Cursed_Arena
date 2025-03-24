#!/usr/bin/env node

require('dotenv').config();

const express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 7860;

let url = 'http://localhost:' + port + '/';
    
// Can access environment variables from process.env
if(process.env.SPACE_ID) {
    url = `https://${process.env.SPACE_ID}.hf.space/`;
}

// Verify Hugging Face API key is available
if (!process.env.HUGGING_FACE_API_KEY) {
    console.warn('Warning: HUGGING_FACE_API_KEY is not set');
}

// Tell express to serve local files
app.use(express.static(__dirname + '/'));

server.listen(port);
console.log("Express server listening on port " + port);
console.log(url);

//default to index.html
app.get('/', function (req, res)
{
  res.sendFile(__dirname + '/index.html');
});

//Socket.io emits this event when a connection is made.
io.on('connection', function (socket)
{
  // Emit a message to send it to the client.
  socket.emit('ping', { msg: 'Connected successfully via socket.io.' });
  
  // Print messages from the client.
  socket.on('pong', function (data){
              console.log(data.msg);
            });
  socket.on('start', function(){
		socket.emit('setRemoteId', socket.id);
		console.log("broadcast new player with remote id "+socket.id);
		socket.broadcast.emit('join', {remoteId:socket.id});
		
		//send all existing clients to new
		const sockets = Array.from(io.sockets.sockets.values());
		sockets.forEach(s => {
			socket.emit('join', {remoteId: s.id});
		});	
            });

	/**
	 * universal broadcasting method
	 */
	socket.on('impactconnectbroadcasting', function(data) {
		socket.broadcast.emit(data.name, data.data);
        });

	/**
	 * announcing to everyone!
	 */
	socket.on('announce', function(data) {
		io.emit('announced', data);
	});

	/**
	 * disconnecting
	 */
	socket.on('disconnect', function() {
		console.log("disconnecting: "+socket.id);
		socket.broadcast.emit('removed', {remoteId: socket.id});
	});
});