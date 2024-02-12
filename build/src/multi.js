"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_http_1 = require("node:http");
const node_os_1 = require("node:os");
const node_process_1 = __importDefault(require("node:process"));
const server_1 = __importDefault(require("./server/server"));
const numCPUs = (0, node_os_1.availableParallelism)();
let BASE_PORT = 4000;
if (node_cluster_1.default.isPrimary) {
    console.log(`Primary ${node_process_1.default.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        node_cluster_1.default.fork({ PORT: BASE_PORT });
        BASE_PORT++;
    }
    let nextWorkerIndex = 0;
    (0, node_http_1.createServer)((req, res) => {
        if (node_cluster_1.default.workers) {
            const workerIds = Object.keys(node_cluster_1.default.workers);
            const workerId = workerIds[nextWorkerIndex];
            const worker = node_cluster_1.default.workers[workerId];
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
        node_cluster_1.default.on('message', (worker, message) => {
            res.end(message);
        });
    }).listen(3000);
    node_cluster_1.default.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
}
else {
    const PORT = node_process_1.default.env.PORT;
    server_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    console.log(`Worker ${node_process_1.default.pid} started`);
}
