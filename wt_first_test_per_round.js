import { ConnectionManager } from "./ConnectionManager.js";
const environment = "docker"
const round = 100;

let benchmark_obj = {
  address: environment == "docker" ? "192.168.18.104" : "127.0.0.1",
  secure: true,
  port: environment == "docker" ? 5001 : 5001,
  request_interval:100,
  connection_interval:100,
  transport: "webtransport"
}

let connection_obj = {
  connection_time: 0,
  connection_time_array: [],
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

for (let index = 0; index < round; index++) {  
  await connection_manager.createConnectionsPerRound(index).then((connection_time_per_round) => {
    console.log(`Round ${index} finish. Total connection: ${connection_progress_obj.counter}, Time taken to enstablish the connection ${connection_time_per_round} ms`);
    connection_obj.connection_time_array.push(connection_time_per_round)
  });
}

console.log(`Time taken to enstablish ${connection_progress_obj.counter} connection: ${connection_obj.connection_time_array.reduce((acc, currentValue) => acc + currentValue, 0)} ms`)
const finish_date = new Date();
console.log(`Date test Finish : ${finish_date.getDate()}-${finish_date.getMonth()}-${finish_date.getFullYear()} ${finish_date.getHours()}-${finish_date.getMinutes()}-${finish_date.getSeconds()}`)
connection_manager.closeConnection();

