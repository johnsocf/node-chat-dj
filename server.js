var express = require('express'),
	bodyParser = require('body-parser'),
	http = require ('http'),
	sio = require('socket.io'),
	request = require('superagent')

var app = express();
app.use(bodyParser());

app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);

var io = sio.listen(server),
	apiKey = '252e19dd17abdc299e79fdeddcd799f0',
	currentSong,
	dj;

function elect (socket) {
	dj = socket;
	io.sockets.emit('announcement', socket.nickname + ' is the new dj');
	socket.emit('elected');
	socket.dj = true;
	socket.on('disconnect', function () {
		dj = null;
		io.sockets.emit('announcement', 'the dj left - next one to jion becomes dj');
	});
}

io.sockets.on('connection', function (socket) {
	
	socket.on('join', function (name) {
		socket.nickname = name;
		socket.broadcast.emit('announcement', name + ' joined the chat.');
		if (!dj) {
			elect(socket);
		} else {
			socket.emit('song', currentSong);
		}
	});

	socket.on('song', function (song) {
    if (socket.dj) {
      currentSong = song;
      socket.broadcast.emit('song', song);
      console.log(song + ' playing');
    }
  });

  socket.on('search', function (q, fn) {
    request('http://tinysong.com/s/' + encodeURIComponent(q)
      + '?key=' + apiKey + '&format=json', function (res) {
      if (200 == res.status) fn(JSON.parse(res.text));
    });
  });

  socket.on('text', function (msg) {
    socket.broadcast.emit('text', socket.nickname, msg);
  });


});

server.listen(3000);