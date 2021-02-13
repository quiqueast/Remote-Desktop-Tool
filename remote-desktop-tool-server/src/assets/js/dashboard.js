//SOCKET 
var socket = io(undefined, { transports: ['polling']});
   
socket.emit("join-dashboard");

socket.on('addClients', (clients) => {
  loader(false);
  for (let i = 0; i < clients.length; i++ ) {
    let {id, name, ip, img, screenX, screenY} = clients[i];
    if ((name !== 'dashboard') && (name !== 'viewer')) addClient(id, name, ip, img, screenX, screenY);
  }
});

socket.on('addClient', (client) => {
  let {id, name, ip, img, screenX, screenY} = client;
  addClient(id, name, ip, img, screenX, screenY);
});

socket.on('removeClient', (id) => {
  removeClient(id);
});

// OTHER FUNCTIONS
// Add given client in to document
var addClient = (id, name, ip, img, screenX, screenY) => {
  let clientCardStr = 
  `<div id="${id}" class="col-xs-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div class="card">
          <img class="card-img-top" src="data:image/png;base64,${img}" alt="Card image cap">
          <div class="card-body">
            <h4 class="card-title">${ip}</h4>
            <p class="card-text">PC: ${name}</p>
            <a href="/view/${id}/${screenX}/${screenY}" class="btn btn-primary btn-block">View</a>
          </div>
      </div>
  </div>`;
  let clientCard = stringToHTML(clientCardStr);
  let clientsContainer = document.getElementById('clients');
  clientsContainer.appendChild(clientCard);
};

// Remove client from document
let removeClient = (id) => {
  let client = document.getElementById(id);
  let clientsContainer = document.getElementById('clients');
  clientsContainer.removeChild(client);
};

// Convert a string into HTML
let stringToHTML = (str) => {
  let div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstChild; 
};

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