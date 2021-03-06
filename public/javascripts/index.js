    var room = 'PortalChatRoom';
    var listCreated = false;
    var sessionId;
    var user = {};
    var userCreated = false
    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remoteVideos',
        // immediately ask for camera access
        autoRequestMedia: true,
        //set default nickname to Peer
        nick: 'Peer',
        receiveMedia: {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 0
        }
    });
    //webrtc.joinRoom(room);
    if (room) {
        //setRoom(room);
        webrtc.joinRoom(room, function (err, res) {
            console.log('joined', room, err, res);
        });
    }
    appendToList();
    //For Text Chat ------------------------------------------------------------------
    // Await messages from others
    webrtc.connection.on('message', function(data){
        console.log("Received");
        if(data.type === 'chat'){
            console.log('chat received',data.payload.message);
            //append name and message to textarea using id #messages
            $('#messages').append('<br>' + data.payload.nick + ': <br>' + data.payload.message + '&#10;');
        }
        if(data.type === 'add_user'){
            console.log("add_user")
            appendToList();
        }
        if(data.type === 'update_user'){
            console.log("update_user")
            appendToList();
        }
        if(data.type === 'remove_user'){
            console.log("remove_user")
            appendToList();
        }
    });
    // Send a chat message
    //When Send button (id is #send) is clicked
    $('#change').click(function(){
        //Get the message from the text box with #text id
        //var msg = $('#name').val();
        webrtc.config.nick = $('#name').val();
        //webrtc.sendToAll('name', { nick: webrtc.config.nick});
        //$('#messages').append('<br>You: <br>' + msg + '&#10;');
        //Set the value of text box to null
        //$('#text').val('');
        if(userCreated == false){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    //document.getElementById("demo").innerHTML = this.responseText;
                    console.log(this.responseText);
                    user = JSON.parse(this.responseText);
                    console.log(user);
                    var names = JSON.parse(this.responseText)
                    appendToList();
                    console.log('add_user')
                    webrtc.sendToAll('add_user');
                }
            };
            xhttp.open("POST", "/users/add", true);
            xhttp.setRequestHeader("Content-Type", "application/json");
            //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(JSON.stringify({name:$('#name').val()}));
        }
        else {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    //document.getElementById("demo").innerHTML = this.responseText;
                    console.log(this.responseText);
                    user = JSON.parse(this.responseText);
                    console.log(user);
                    var names = JSON.parse(this.responseText)
                    appendToList();
                    console.log('add_user')
                    webrtc.sendToAll('update_user');
                }
            };
            xhttp.open("POST", "/users/update", true);
            xhttp.setRequestHeader("Content-Type", "application/json");
            //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send(JSON.stringify({id:user.id,name:$('#name').val()}));
        }
    });
    // Send a chat message
    //When Send button (id is #send) is clicked
    $('#send').click(function(){
        //Get the message from the text box with #text id
        var msg = $('#text').val();
        webrtc.config.nick = $('#name').val();
        webrtc.sendToAll('chat', {message: msg, nick: webrtc.config.nick});
        $('#messages').append('<br>You: <br>' + msg + '&#10;');
        //Set the value of text box to null
        $('#text').val('');
    });
    function appendToList(){
        if(!listCreated){
            $("#items").append("<ul id='list' data-role='listview' data-inset='true'></ul>");
            listCreated = true;
            $("#items").trigger("create");
        }
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
                var users = JSON.parse(this.responseText)
                console.log(users);
                chatList(users);
            }
        };
        xhttp.open("GET", "/users", true);
        xhttp.send();
    }
    function chatList(users){
        $('#list').empty();
        $.each(users, function(i, user) {
            console.log(JSON.stringify(user));
            var name = JSON.stringify(user.name);
            $('#list').append('<li>'+name+'</li>');
        });
    }
    // grab the room from the URL
    //var room = location.search && location.search.split('?')[1];
    // create our webrtc connection
//    var webrtc = new SimpleWebRTC({
//        // we don't do video
//        localVideoEl: '',
//        remoteVideosEl: '',
//        // dont ask for camera access
//        autoRequestMedia: false,
//        // dont negotiate media
//        receiveMedia: {
//            offerToReceiveAudio: false,
//            offerToReceiveVideo: false
//        }
//    });
    // called when a peer is created
    webrtc.on('createdPeer', function (peer) {
        console.log('createdPeer', peer);
        var remotes = document.getElementById('remotes');
        if (!remotes) return;
        var container = document.createElement('div');
        container.className = 'peerContainer';
        container.id = 'container_' + webrtc.getDomId(peer);
        // show the peer id
        var peername = document.createElement('div');
        peername.className = 'peerName';
        peername.appendChild(document.createTextNode('Peer: ' + peer.id));
        //container.appendChild(peername);
        // show a list of files received / sending
        var filelist = document.createElement('ul');
        filelist.className = 'fileList';
        container.appendChild(filelist);
        // show a file select form
        var fileinput = document.createElement('input');
        fileinput.type = 'file';
        // send a file
        fileinput.addEventListener('change', function() {
            fileinput.disabled = true;
            var file = fileinput.files[0];
            var sender = peer.sendFile(file);
            // create a file item
            var item = document.createElement('li');
            item.className = 'sending';
            // make a label
            var span = document.createElement('span');
            span.className = 'filename';
            span.appendChild(document.createTextNode(file.name));
            item.appendChild(span);
            span = document.createElement('span');
            span.appendChild(document.createTextNode(file.size + ' bytes'));
            item.appendChild(span);
            // create a progress element
            var sendProgress = document.createElement('progress');
            sendProgress.max = file.size;
            item.appendChild(sendProgress);
            // hook up send progress
            sender.on('progress', function (bytesSent) {
                sendProgress.value = bytesSent;
            });
            // sending done
            sender.on('sentFile', function () {
                item.appendChild(document.createTextNode('sent'));
                // we allow only one filetransfer at a time
                fileinput.removeAttribute('disabled');
            });
            // receiver has actually received the file
            sender.on('complete', function () {
                // safe to disconnect now
            });
            filelist.appendChild(item);
        }, false);
        fileinput.disabled = 'disabled';
        container.appendChild(fileinput);
        // show the ice connection state
        if (peer && peer.pc) {
            var connstate = document.createElement('div');
            connstate.className = 'connectionstate';
            container.appendChild(connstate);
            peer.pc.on('iceConnectionStateChange', function (event) {
                var state = peer.pc.iceConnectionState;
                console.log('state', state);
                container.className = 'peerContainer p2p' + state.substr(0, 1).toUpperCase()
                    + state.substr(1);
                switch (state) {
                    case 'checking':
                        connstate.innerText = 'Connecting to peer...';
                        break;
                    case 'connected':
                    case 'completed': // on caller side
                        connstate.innerText = 'Connection established.';
                        // enable file sending on connnect
                        fileinput.removeAttribute('disabled');
                        break;
                    case 'disconnected':
                        connstate.innerText = 'Disconnected.';
                        break;
                    case 'failed':
                        // not handled here
                        break;
                    case 'closed':
                        connstate.innerText = 'Connection closed.';
                        console.log(user);
                        //console.log(webrtc.getPeers(sessionId))
//                        var xhttp = new XMLHttpRequest();
//                        xhttp.onreadystatechange = function() {
//                            if (this.readyState == 4 && this.status == 200) {
//                                //document.getElementById("demo").innerHTML = this.responseText;
//                                console.log(this.responseText);
//                                user = JSON.parse(this.responseText);
//                                console.log(user);
//                                var names = JSON.parse(this.responseText)
//                                appendToList();
//                                console.log('remove_user')
//                                webrtc.sendToAll('remove_user');
//                            }
//                        };
//                        xhttp.open("POST", "/users/remove", true);
//                        xhttp.setRequestHeader("Content-Type", "application/json");
//                        //xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//                        xhttp.send(JSON.stringify(user));
                        //console.log(')
                        // disable file sending
                        fileinput.disabled = 'disabled';
                        // FIXME: remove container, but when?
                        break;
                }
            });
        }
        remotes.appendChild(container);
        // receiving an incoming filetransfer
        peer.on('fileTransfer', function (metadata, receiver) {
            console.log('incoming filetransfer', metadata);
            var item = document.createElement('li');
            item.className = 'receiving';
            // make a label
            var span = document.createElement('span');
            span.className = 'filename';
            span.appendChild(document.createTextNode(metadata.name));
            item.appendChild(span);
            span = document.createElement('span');
            span.appendChild(document.createTextNode(metadata.size + ' bytes'));
            item.appendChild(span);
            // create a progress element
            var receiveProgress = document.createElement('progress');
            receiveProgress.max = metadata.size;
            item.appendChild(receiveProgress);
            // hook up receive progress
            receiver.on('progress', function (bytesReceived) {
                receiveProgress.value = bytesReceived;
            });
            // get notified when file is done
            receiver.on('receivedFile', function (file, metadata) {
                console.log('received file', metadata.name, metadata.size);
                var href = document.createElement('a');
                href.href = URL.createObjectURL(file);
                href.download = metadata.name;
                href.appendChild(document.createTextNode('download'));
                item.appendChild(href);
                // close the channel
                receiver.channel.close();
            });
            filelist.appendChild(item);
        });
    });
    // local p2p/ice failure
    webrtc.on('iceFailed', function (peer) {
        var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        var fileinput = document.querySelector('#container_' + webrtc.getDomId(peer) + ' input');
        console.log('local fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });
    // remote p2p/ice failure
    webrtc.on('connectivityError', function (peer) {
        var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        var fileinput = document.querySelector('#container_' + webrtc.getDomId(peer) + ' input');
        console.log('remote fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });
    function setRoom(name) {
        document.querySelector('form').remove();
        document.getElementById('title').innerText = 'Session: ' + name;
        document.getElementById('subTitle').innerText =  'Link to join: ' + location.href;
        $('body').addClass('active');
    }
//    } else {
//        $('form>button').attr('disabled', null);
//        $('form').submit(function () {
//            var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
//            webrtc.createRoom(val, function (err, name) {
//                console.log(' create room cb', arguments);
//
//                var newUrl = location.pathname + '?' + name;
//                if (!err) {
//                    history.replaceState({foo: 'bar'}, null, newUrl);
//                    setRoom(name);
//                } else {
//                    console.log(err);
//                }
//            });
//            return false;
//        });
//    }
    webrtc.on('leftRoom', function (roomName) {
            console.log(roomName);
    });
    webrtc.on('connectionReady', function (sessionId) {
        // ...
        sessionId = sessionId;
        console.log(sessionId);
    })
    //webrtc.getPeers(sessionId, type)
