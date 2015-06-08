var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var width,height;

var connections = [];
var clients = {};

app.use(express.static(__dirname + '/js'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/sperm.html');
});


io.on('connection',function(socket){
	console.log('one connection acquired');
	if(connections.length<2){
		clients[socket.id] = socket;
	connections.push(socket.id);
	console.log(connections);
	
	
	socket.on('size',function(size){
		console.log('inside size');
		console.log(size);
		width = width<size.width?width:size.width;
		height = height<size.height?height:size.height;
		io.emit('size',{width:width,height:height});
		connections = [];
	});

	if(connections.length===2){
		io.emit('ready');
	}

	socket.on('pos',function(data){
		console.log('inside ranpos');
		socket.broadcast.emit('opp',data);
	});

	socket.on('opdata',function(data){
		socket.broadcast.emit('opdata',data);
	});

	socket.on('reducedHealth',function(data){
		socket.broadcast.emit('reducedHealth',data);
	});

	socket.on('score',function(data){
		socket.broadcast.emit('score',data);
	});

	socket.on('hit',function(){
		socket.broadcast.emit('hit',"LOST");
		socket.emit('hit',"WON");
		clients[connections[0]].disconnect();
		clients[connections[1]].disconnect();
		connections = [];
	});

	socket.on('z',function(){
		socket.broadcast.emit('z');
	});

	socket.on('tochan',function(data){
		socket.broadcast.emit('tochan',data);
	});

	socket.on('disconnect', function(){
  			
  			socket.broadcast.emit('reload');
  			connections = [];
    		console.log('user disconnected in disconnect');
    		console.log(connections);
  		});
	socket.on('reload',function(){
			socket.broadcast.emit('reload');
  			socket.disconnect();
  			connections = [];
    		console.log('user disconnected in reload');
    		console.log(connections);
    	});
	}
	else {
		socket.disconnect();
	}
});


http.listen(3000,function(){
  console.log('listening on *:3000');
  console.log(connections);
});
