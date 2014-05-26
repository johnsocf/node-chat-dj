window.onload = function () {
	
	var socket = io.connect();

	socket.emit('join', prompt('What is your nickname?'));

	document.getElementById('chat').style.display = 'block';

	socket.on('announcement', function (msg) {
      var li = document.createElement('li');
      li.className = 'announcement';
      li.innerHTML = msg;
      document.getElementById('messages').appendChild(li);
    });

    addMessage = function (from, text) {
    	var li = document.createElement('li');
    	li.className = 'message';
    	li.innerHTML = '<b>' + from + '</b>: ' + text;
    	document.getElementById('messages').appendChild(li);

    	return li;
    }

    var input = document.getElementById('input');
    document.getElementById('form').onsubmit = function () {
    	//addMessage('me', input.value);

    	var li = addMessage('me', input.value);

    	socket.emit('text', input.value, function (data) {
    		li.className = 'confirmed';
    		li.title = data;
    	});

    	// reset the input
    	input.value = '';
    	input.focus();

    	return false;
    }

    socket.on('text', addMessage);

    var form = document.getElementById('dj');
    var results = document.getElementById('results');

    form.style.display = 'block';
    form.onsubmit = function () {
    	results.innerHTML = '';
    	socket.emit('search', document.getElementById('s').value, function (songs) {
    		for (var i = 0; i < songs.length; i++) {
    			(function (song){
    				var result = document.createElement('li');
    				result.innerHTML = song.ArtistName + ' -<b>' +
    				song.SongName + '</b>'
    				var a = document.createElement('a');
    				a.href = '#';
    				a.innerHTML = 'Select';
    				a.onclick = function () {
    					socket.emit('song', song);
                        play(song);
    					return false;
    				}
    				result.appendChild(a);
    				results.appendChild(result);
    			})(songs[i]);
    		}
    	});
    	return false;
    };

    var playing = document.getElementById('playing');
    function play (song) {
        if (!song) return;
        playing.innerHTML = '<hr><b>Now Playing: </b> ' + song.ArtistName + ''
        + song.SongName + '<br>';

        var iframe = document.createElement('iframe');
        iframe.frameborder = 0;
        iframe.src = song.Url;
        playing.appendChild(iframe);
    }

    socket.on('song', play);

    socket.on('elected', function () {
    	form.className = 'isDJ';
    });
}