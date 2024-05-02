import { ConnectionManager } from "./ConnectionManager.js";
import { writeFileSync, mkdirSync, existsSync } from 'fs';
const environment = "docker"

let benchmark_obj = {
  address: environment == "docker" ? "192.168.18.104" : "127.0.0.1",
  secure: false,
  port: environment == "docker" ? 5001 : 5001,
  request_interval:10,
  connection_interval:1000,
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

function ensureDirectoryExists(directory) {
  if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
      console.log(`Directory '${directory}' created!`);
  } else {
      console.log(`Directory '${directory}' already exists.`);
  }
}

function arrayToCSV(array, filename) {
  const csvData = array.map(item => [item].join('\n')).join('\n');
  ensureDirectoryExists(`result/second_test/wt_${benchmark_obj.connection_interval}`);
  writeFileSync(filename, csvData);
}


const connection_manager = new ConnectionManager(benchmark_obj,connection_obj,connection_progress_obj,benchmark_progress_obj);

connection_manager.createConnections().then(() => {
  const date = new Date();
  console.log(`Date test taken : ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`)
  connection_manager.sendRequests().then(() => {
    console.log(`Time taken to enstablish ${benchmark_obj.connection_interval} connection: ${connection_obj.connection_time}`);
    console.log(`Total connection : ${connection_progress_obj.counter}`);
    // console.log(connection_obj.times);
    const latencyArray = connection_obj.times.map(subArray =>
      subArray.map(({ start, finish }) => finish - start)
    );
    const flatLatencyArray = latencyArray.flat();
    const minimal = Math.min(...flatLatencyArray);
    const maximal = Math.max(...flatLatencyArray);
    const sum = flatLatencyArray.reduce((acc, curr) => acc + curr, 0);
    const average = sum / flatLatencyArray.length;

    // P90
    const sortedArray = flatLatencyArray.sort((a, b) => a - b);
    // Calculate the index of the 90th percentile
    const percentileIndex = Math.floor(0.9 * (sortedArray.length - 1));
    // Find the value at the 90th percentile index
    const p90 = sortedArray[percentileIndex];
    
    console.log(`Total Request: ${flatLatencyArray.length}`)
    console.log(`Request Success: ${flatLatencyArray.length / (benchmark_obj.connection_interval * benchmark_obj.request_interval) * 100}%`);
    console.log(`Minimal Latency: ${minimal}`);
    console.log(`Maximal Latency: ${maximal}`);
    console.log(`Average Latency: ${average}`);
    console.log(`P90 Latency: ${p90}`);
    const date = new Date();
    console.log(`Date test Finish : ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`)
    connection_manager.closeConnection();
    
    // Menyimpan array ke file CSV
    const filename = `result/second_test/wt_${benchmark_obj.connection_interval}/test_wt_${benchmark_obj.connection_interval}_raw_response_time_output_${Date.now()}.csv`
    arrayToCSV(flatLatencyArray, filename);
    console.log("Data saved to", filename);
    console.log("\n");
  })
});


