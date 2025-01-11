const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;

  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
} else {
  require('../server'); // your server file
}

cluster.on('exit', (worker) => {
  console.log(`Worker ${worker.id} has exited`);
  cluster.fork();
});