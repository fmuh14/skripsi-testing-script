import { ConnectionManager } from "./ConnectionManager.js";
const environment = "docker"

let benchmark_obj = {
  address: environment == "docker" ? "192.168.18.104" : "127.0.0.1",
  secure: true,
  port: environment == "docker" ? 5001 : 5001,
  request_interval:100,
  connection_interval:5500,
  transport: "webtransport"
}


let connection_obj = {
  connection_time: 0,
  times: [],
  clients: []
}


let connection_progress_obj = {
  counter: 0,
  total: 0,
  message: "Connection Starting.."
}

let benchmark_progress_obj = {
  counter: 0,
  total: 0,
  message: "Benchmark Starting.."
}

const date = new Date();
console.log(`Date test taken : ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`)

const connection_manager = new ConnectionManager(benchmark_obj,connection_obj,connection_progress_obj,benchmark_progress_obj);
console.log(benchmark_progress_obj.message);

connection_manager.createConnections().then(() => {
  console.log(`Total connection: ${connection_progress_obj.counter}`);
  console.log(`Time taken to enstablish ${benchmark_obj.connection_interval} connection: ${connection_obj.connection_time}`);
  const date = new Date();
  console.log(`Date test Finish : ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`)
  console.log("\n")
  connection_manager.closeConnection();
});

