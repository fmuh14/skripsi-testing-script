const environment = "local"

export let benchmark_obj = {
  address: environment == "docker" ? "192.168.18.104" : "127.0.0.1",
  request_interval:100,
  connection_interval:10000,
  transport: "webtransport",
  port: 5000,
  secure: false
}

if (benchmark_obj.transport == "webtransport") {
  benchmark_obj.port = 5001
  benchmark_obj.secure = true
}

export let connection_obj = {
  connection_time: 0,
  times: [],
  clients: []
}


export let connection_progress_obj = {
  counter: 0,
  total: 0,
  message: "Connection Starting.."
}

export let benchmark_progress_obj = {
  counter: 0,
  total: 0,
  message: "Benchmark Starting.."
}

console.log(benchmark_obj)