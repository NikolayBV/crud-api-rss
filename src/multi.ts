import cluster from 'node:cluster';
import {createServer} from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';
import server from "./server/server";
import {UsersController} from "./db/UsersController";

const numCPUs = availableParallelism();
let BASE_PORT = 4000;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({PORT: BASE_PORT});
        BASE_PORT++;
    }

    let nextWorkerIndex = 0;

    createServer((req, res) => {
        if (cluster.workers) {
            const workerIds = Object.keys(cluster.workers);
            const workerId = workerIds[nextWorkerIndex];
            const worker = cluster.workers[workerId];
            if (worker) {
                const url = req.url;
                const method = req.method;
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });

                req.on('end', () => {
                    worker.send({ type: method, url, data: body });
                });
                nextWorkerIndex = (nextWorkerIndex + 1) % workerIds.length;
            }
        }
        cluster.on('message', (worker, message) => {
            res.end(message)
        });
    }).listen(3000);
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    const PORT = process.env.PORT;

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    console.log(`Worker ${process.pid} started`);
}
