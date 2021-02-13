const data = document.getElementById('data');
let idClient = data.dataset.client;
let screenWidth = data.dataset.screenx;
let screenHeight = data.dataset.screeny;

const videoPlayer = document.querySelector('video');
const buttons = document.querySelectorAll('a');

//SOCKET 
var socket = io(undefined, { transports: ['polling']});

buttons.forEach(button =>{
    button.addEventListener('click', e => {
    socket.emit('stop-streaming');
    });
});

socket.emit('join-viewer', idClient);


// Redirect to Dashboard if the client disconnects
socket.on('redirect', (id) => {
    if(id === idClient) {
    alert('Client has disconnected');
    window.location.replace("/dashboard");
    }
});

//STREAMING
const peer = new Peer({
    host: location.hostname,
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs'
});

//Send peerID to client 
peer.on('open', (id) => {
    socket.emit('sendingPeerId', id, idClient);
});

//Receive the stream and load it on video element
peer.on('call', (call) => {
    call.answer();
    call.on('stream', (stream) => {
    videoPlayer.srcObject = stream
    videoPlayer.onloadedmetadata = (e) => videoPlayer.play()
    });
});

peer.on('disconnected', () => {
    alert('Server has disconnected');
    window.location.replace("/dashboard");
});

//CLIENT CONTROLLER

let fps = 10;
let mouseData;
let interval;

videoPlayer.addEventListener('mouseenter', e => {
    interval = setInterval(updateMove, 1000/fps);
});

videoPlayer.addEventListener('mouseleave', e => {
    clearInterval(interval);
});

videoPlayer.addEventListener('mousemove', e => {

    let posX = e.offsetX / e.target.offsetWidth;
    let posY = e.offsetY / e.target.offsetHeight;
    
    let x = posX * (screenWidth || 1920);
    let y = posY * (screenHeight || 1080);

    mouseData = { x, y, id:idClient };

});

videoPlayer.addEventListener('play', e => {
    loader(false);
});

videoPlayer.addEventListener('pause', e => {
    loader(true);
});

let updateMove = () => {
    if (mouseData) socket.emit('mouse-move', mouseData);
};

videoPlayer.addEventListener('click', e => {
    socket.emit('mouse-click', idClient);
});

window.addEventListener("keyup", e => {
    let data = { key: e.key, id: idClient };
    if (data) socket.emit('type', data);
});

// Loader
const loaderContainer = document.getElementById('preloader-container');
let loader = (activate) => {
  if (activate) {
    loaderContainer.classList.remove('d-none');
  }else{
    loaderContainer.classList.add('d-none');
  }
};

loader(true);
