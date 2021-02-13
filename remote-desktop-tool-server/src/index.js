// LIBRARIES
const { app } = require('electron');
const express = require('express');
const expressApp = express();
const http = require('http').createServer(expressApp);
const io = require('socket.io')(http);
const helmet = require('helmet');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const fs = require('fs');

// HEADERS
expressApp.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "*.googleapis.com", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            styleSrc: ["'self'", "'unsafe-inline'", "*.googleapis.com"]
        }
    }
}));

// STATIC FILES
expressApp.use(express.static(__dirname + '/assets'));

// VIEW ENGINE
expressApp.set('view engine', 'ejs');
expressApp.set('views', __dirname + '/views')

// ROUTES
const routes = require('./routes/index');
const { execArgv } = require('process');
expressApp.use(routes);

// SOCKET
//Array to save information about connected clients on socket server
var clients = [];
io.on('connection', (socket) => {

    socket.emit('connection-msg');


    //Dashboard is where we can see the clients connected
    socket.on('join-dashboard', () => {
        let id = socket.id;
        let name = 'dashboard';
        let ip = socket.request.connection.remoteAddress.slice(7);
        let client = { id, name, ip };

        socket.join(client.id);
        console.log(`Dashboard joined.`);

        //Save client info on array
        clients.push(client);

        //Send clients info to load on the Dashboard
        io.to(id).emit('addClients', clients);
    });

    // Clients are who will be monitoring
    socket.on('join-client', ({ name, img, screenX, screenY }) => {
        let id = socket.id;
        let ip = socket.request.connection.remoteAddress.slice(7);
        let client = { id, name, ip, img, screenX, screenY };

        socket.join(id);
        console.log(`${name} joined. ID: ${id}.`);
        
        //Save client info on array
        clients.push(client);

        // Send new client info to load on the Dashboard
        io.emit('addClient', client);
       
    });

    // Viewer is where we can see the desktop of a specific client
    socket.on('join-viewer', (idClient) => {
        socket.id = `viewer:${idClient}`;
        let id = socket.id;
        let name = 'viewer';
        let ip = socket.request.connection.remoteAddress.slice(7);
        let client = { id, name, ip };

        socket.join(client.id);
        console.log(`Viewer joined. ${id}`);

        //Save client info on array
        clients.push(client);
    });

    // Events emitted by the viewer and they are sent to client's desktop in order to control it
    socket.on('mouse-move', (data) => {
        let { x, y, id } = data;
        io.to(id).emit('mouse-move', { x, y });
    })

    socket.on('mouse-click', (id) => {
        io.to(id).emit('mouse-click');
    });

    socket.on('type', (data) => {
        let { key, id } = data;
        io.to(id).emit('type', key);
    });

    socket.on('sendingPeerId', (peerId, destId) => {
        socket.to(destId).emit('sendPeerId', peerId);
    });
    
    socket.on('disconnect', () => {
        clients.forEach(client => {
            if (client.id === socket.id && client.name !== 'dashboard' && client.name !== 'dashboard'){
                io.emit('removeClient', socket.id);
                io.emit('redirect', socket.id);
            }
        });
        clients = clients.filter(client => client.id !== socket.id);        
    });

    socket.on('stop-streaming', () => {
        io.emit('stop-stream');
    });
});

// PEER SERVER (streaming)
const peerServer = ExpressPeerServer(http, {
    debug: true,
    path: '/peerjs'
  });
expressApp.use('/', peerServer);

peerServer.on('connection', (client) => {  
    // console.log('Peer client connected');
});

// Get port from portConfig.json file
const portConfigStr = fs.readFileSync(path.join(__dirname, 'portConfig.json'), 'utf-8');
const portConfig = JSON.parse(portConfigStr);
const { port } = portConfig;

// RUN SERVER
app.on('ready', () => {
    http.listen(port, console.log(`Server start running on port ${port}`));
});
