const http = require('http');
const cluster = require('cluster');

const workers = [];

if (cluster.isMaster) {
  for (let i = 0; i < 4; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }

  cluster.on('exit', (worker) => {
    console.log('Worker died, restarting...');
    const newWorker = cluster.fork();
    workers.push(newWorker);
  });

  const server = http.createServer((req, res) => {
    // Choose a worker at random
    const worker = workers[Math.floor(Math.random() * workers.length)];

    // Send the request to the worker
    worker.send(req);

    // Listen for a response from the worker
    worker.on('message', (response) => {
      // Send the response back to the client
      res.send(response);
    });
  });

  server.listen(3003);
} else {
  // Listen for requests from the master process
  process.on('message', (req) => {
    // Handle the request
    const response = handleRequest(req);

    // Send the response back to the master process
    process.send(response);
  });
}

function handleRequest(req) {
  // Handle the request here...

  // Return the response
  return response;
}