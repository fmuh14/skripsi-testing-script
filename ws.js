import { ConnectionManager } from "./ConnectionManager.js";
const environment = "docker"

let benchmark_obj = {
  address: environment == "docker" ? "192.168.18.104" : "localhost",
  secure: false,
  port: environment == "docker" ? 5000 : 5000,
  request_interval:100,
  connection_interval:10000,
  transport: "websocket"
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

connection_manager.serverCheck().then(() => {
  
})