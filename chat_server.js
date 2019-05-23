// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
	
	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.
		
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

//global variables
let all_users = [];
let rooms = [];

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
	
	socket.on('message_to_server', function(data) {
        // This callback runs when the server receives a new message from the client.
        
        let current_room = data['current_room']; //current room that the message was sent
		
		console.log("message: "+data["message"] + " in room :" + current_room); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{message:data["message"], current_room: current_room }); // broadcast the message to other users
    });

    socket.on('private_msg_to_server', function(data) {
        let sender = data['sender']; //Might not need room
        let user = data['user']; //This is the user that the person is sending to!
        let msg = data['message'];
        
        console.log("message: " + msg + " to person: " + user);

        io.sockets.emit("private_msg_to_client",{message: msg, user: user, sender: sender });

    });


    socket.on('logged_user_to_server', function(data) {
        let roomname = data['room'];
        let isFound = false;

        //Check if Main Lobby exist
        for(let i=0; i < rooms.length; i++) {
            if(String(Object.keys(rooms[i])) === roomname) {
                isFound = true;
            }
        }

        //Will push the Main Lobby if it doesn't exist
        if(isFound === false) {
            let new_room = {}; //create an object
            new_room[roomname] = []; //store the key as the name of the new room created
            rooms.push(new_room); //append to the array of rooms
        }

        let isUserFound = false;

        for (let i=0; i < all_users.length; i++) {
            if(all_users[i] === data['user']) {
                isUserFound = true;
                break;
            }
        }

        if(isUserFound === false) {
            all_users.push(data['user']);
        }

        console.log("Users currently in the system are: " + all_users);
        io.sockets.emit("logged_user_to_client", {message: "success", user: data['user']});



    });

    socket.on('main_lobby_to_server', function(data) {
        if(data['message'] === "main") {
            io.sockets.emit('main_lobby_to_client', {users_inthe_room: all_users});
        }
    });

    socket.on('create_room_to_server', function(data) {
        let roomname = data['room'];
        let creator = data['creator'];
        let pass = data['password'];

        console.log(data['room'] + " " + data['creator']);

        let new_room = {}; //create an object
        new_room[roomname] = []; //store the key as the name of the new room created
        rooms.push(new_room); //append to the array of rooms


        for (let i = 0; i < rooms.length; i++) {
            console.log("rooms array has: " + typeof(String(Object.keys(rooms[i]))));
            console.log("rooms array values have: " + Object.values(rooms[i]));
            // console.log("....." + rooms[0][roomname]);
        }

        io.sockets.emit('created_room_to_client',{room: roomname, creator: creator, password: pass})
    });


    socket.on('username_to_curr_room_server', function(data) {
        let user = data['user'];
        let current_room = data['current_room'];

        console.log("User: " + user + " joined into room: " + current_room);

        let users_inthe_room = [];

        //store the user into the array of rooms that has the current room name of variable 'current_room'
        for(let i=0; i < rooms.length; i++) {
            if(String(Object.keys(rooms[i])) === current_room) {
                //rooms[i][current_room] is an array
                let isFound = false;
                for(let j = 0; j < rooms[i][current_room].length; j++) {
                    if(rooms[i][current_room][j] === user) {
                        console.log("Same user found");
                        isFound = true;
                        break;
                    }
                }

                if(isFound === false) {
                    rooms[i][current_room].push(user);
                }
                
                console.log("...... " + Object.keys(rooms[i]) + " " + Object.values(rooms[i]));

                io.sockets.emit('username_to_curr_room_client',{user: rooms[i][current_room], current_room: current_room})

                break;
            }
        } 
    });

    //Before user changes room delete the user from that room in the server.
    socket.on("username_to_delete_server", function(data) {
        deleteUser(data['user'], data['current_room']);

        io.sockets.emit('username_to_delete_client', {user: data['user']})
    });

    socket.on("kick_to_server", function(data) {
        deleteUser(data['user'], data['room']);

        io.sockets.emit('kick_to_client', {user: data['user'], current_room: data['room']});

    });

    socket.on("ban_to_server", function(data) {
        deleteUser(data['user'], data['room']);

        io.sockets.emit('ban_to_client', {user: data['user'], room: data['room']});
    });
    
    function deleteUser(user_to_delete, room_of_user) {
        for( let i = 0; i < rooms.length; i++){ 
            if(String(Object.keys(rooms[i])) === room_of_user) {
                for (let j = 0; j < rooms[i][room_of_user].length; j++) {
                    if(rooms[i][room_of_user][j] === user_to_delete) {
                        rooms[i][room_of_user].splice(j, 1); 
                    }
                }
            }
        }
    }

});