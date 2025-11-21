// server.js - E2E encrypted messenger
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Store: Map<id, {ws, name, publicKey}>
const clients = new Map();

wss.on('connection', function connection(ws, req) {
  const clientId = Math.random().toString(36).slice(2, 9);
  let clientName = null;
  
  console.log('New connection, id:', clientId);
  
  ws.on('message', function incoming(msg) {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error('Invalid JSON:', msg);
      return;
    }
    
    switch(data.type) {
      case 'auth':
        // Register user: name + public key
        clientName = data.name;
        clients.set(clientId, { 
          ws, 
          name: clientName,
          publicKey: data.publicKey // JWK format public key
        });
        console.log(`User ${clientName} authenticated with id ${clientId}`);
        
        // Send client their ID
        ws.send(JSON.stringify({ 
          type: 'welcome', 
          id: clientId,
          name: clientName
        }));
        
        // Send updated user list with public keys to everyone
        broadcastUserList();
        break;
        
      case 'encrypted_msg':
        // Forward encrypted message
        // Server CANNOT read it!
        if (!clientName) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Please authenticate first' 
          }));
          return;
        }
        
        console.log(`${clientName} -> encrypted message`);
        
        if (data.to === 'all') {
          // Broadcast encrypted message to all (except sender)
          const message = {
            type: 'encrypted_msg',
            from: clientName,
            fromId: clientId,
            encryptedMessages: data.encryptedMessages,
            uniqueId: data.uniqueId, // IMPORTANT: Pass uniqueId for message sync
            ts: Date.now(),
            broadcast: true
          };
          
          clients.forEach((client, id) => {
            if (client.ws.readyState === WebSocket.OPEN && id !== clientId) {
              client.ws.send(JSON.stringify(message));
            }
          });
        } else {
          // Private message - send only to recipient
          const recipient = clients.get(data.to);
          if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
            console.log(`${clientName} -> ${recipient.name} (encrypted)`);
            
            // Send only to recipient (sender already displayed locally)
            recipient.ws.send(JSON.stringify({
              type: 'encrypted_msg',
              from: clientName,
              fromId: clientId,
              encrypted: data.encrypted,
              uniqueId: data.uniqueId, // IMPORTANT: Pass uniqueId for message sync
              ts: Date.now(),
              broadcast: false
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Recipient not found'
            }));
          }
        }
        break;
        
      case 'file_start':
      case 'file_chunk':
      case 'file_complete':
        // Forward file messages (already encrypted)
        if (!clientName) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Please authenticate first' 
          }));
          return;
        }
        
        console.log(`${clientName} -> ${data.type}`);
        
        if (data.to === 'all') {
          // Broadcast
          const message = {
            ...data,
            from: clientName,
            fromId: clientId,
            broadcast: true
          };
          
          clients.forEach((client, id) => {
            if (client.ws.readyState === WebSocket.OPEN && id !== clientId) {
              client.ws.send(JSON.stringify(message));
            }
          });
        } else {
          // Private
          const recipient = clients.get(data.to);
          if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
            recipient.ws.send(JSON.stringify({
              ...data,
              from: clientName,
              fromId: clientId,
              broadcast: false
            }));
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Recipient not found'
            }));
          }
        }
        break;
        
      case 'get_users':
        sendUserList(ws);
        break;
    }
  });
  
  ws.on('close', () => {
    if (clientName) {
      console.log(`User ${clientName} (${clientId}) disconnected`);
      clients.delete(clientId);
      broadcastUserList();
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Send user list to specific client
function sendUserList(ws) {
  const userList = Array.from(clients.entries()).map(([id, data]) => ({
    id: id,
    name: data.name,
    publicKey: data.publicKey // Public keys are transmitted openly - this is safe!
  }));
  
  ws.send(JSON.stringify({
    type: 'user_list',
    users: userList
  }));
}

// Send list to everyone
function broadcastUserList() {
  const userList = Array.from(clients.entries()).map(([id, data]) => ({
    id: id,
    name: data.name,
    publicKey: data.publicKey
  }));
  
  const message = JSON.stringify({
    type: 'user_list',
    users: userList
  });
  
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

console.log('🔐 E2E Encrypted WebSocket server started on port 8080');
console.log('Server cannot read messages - they are encrypted end-to-end!');
