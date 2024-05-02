import { io } from "socket.io-client";

export class ConnectionWS {

  constructor(benchmark_obj,connection_progress_obj,benchmark_progress_obj) {

    this.client = null;

    this.times = [];

    this.connection_fails = 0;
    this.connection_errors = 0;
    this.connection_success = 0;

    this.last_count = new Array(20);

    this.benchmark_obj = benchmark_obj;
    this.connection_progress_obj = connection_progress_obj;
    this.benchmark_progress_obj = benchmark_progress_obj;

    this.protocol = benchmark_obj.secure ? "https" : "http";
    this.payload = {_id: "65bd882c0dd2643abfc438bf"};
    this.messagePayload = {"sender":{"_id":"65bd882c0dd2643abfc438aa","name":"TestUser","email":"TestUser1@example.com"},"content":"test","chat":{"_id":"65d8395a383d7adf6d7c90cd","chatName":"personal","isGroupChat":false,"users":[{"_id":"65bd882c0dd2643abfc438aa","name":"TestUser","email":"TestUser1@example.com"},{"_id":"65c05a8d3bd6f438de621669","name":"TestUser2","email":"TestUser2@example.com"}],"createdAt":"2024-02-23T06:21:14.681Z","updatedAt":"2024-03-16T08:08:19.030Z","__v":0,"latestMessage":"65f55373f45b8fe6d7e6a0ca"},"_id":"65fbb9ef1de8c54bcfdd58ed","createdAt":"2024-03-21T04:39:11.198Z","updatedAt":"2024-03-21T04:39:11.198Z","__v":0}
    this.forceDisconnect = true;

    // redefine the push function for the last_count array to shift the data with each entry
    this.last_count.push = function (){
      if (this.length >= 20) {
          this.shift();
      }
      return Array.prototype.push.apply(this, arguments);
    };
  }

  connect() {
    return new Promise((resolve, reject) => {
      const self = this;
      this.client = io(`${self.protocol}://${self.benchmark_obj.address}:${this.benchmark_obj.port}`,
      {
        transports: ["websocket"],
      });

      this.client.on("connect", () => {
        self.client.emit("setup",self.payload);
        self.connection_progress_obj.counter++;
        resolve();
      });

      this.client.on("disconnect", () => {
        if (self.forceDisconnect) {
          self.connection_errors++;
          self.connection_progress_obj.counter--;
        }
      })
    })
  };

  sendRequest() {
    const self =this;
    this.count = 0;
    this.times = [];

    return new Promise((resolve,reject) => {
      for (let i = 0; i < this.benchmark_obj.request_interval; i++) {
        if (self.client !== undefined) {
            const data = JSON.parse(JSON.stringify(self.messagePayload));
            data["c"] = i;
            this.times[i] = {'start':Date.now()};
            self.client.emit("test",data,(data) => {
              if (data == data) {
                if (this.times[data["c"]] !== undefined) {
                  if (self.times[data['c']]['received'] === undefined
                      && self.times[data['c']]['finish'] === undefined) {
                      
                      // store the corresponding timestamps in the times array
                      this.times[data['c']]['received'] = data['ts'];
                      this.times[data['c']]['finish'] = Date.now();
                      
                      // increment the successful request counters by 1
                      self.benchmark_progress_obj.counter++;
                      this.count++;
                  }
                }
              } else {
                resolve("error here 1")
              }

              if (i === self.benchmark_obj.request_interval - 1) {
                const self = this;
                var timer = 0;

                const finishCount = setInterval(function () {

                  // The function should resolve if:
                  // 1. There are no requests with a "finish" index which is undefined
                  let readyToResolve = self.times.every(function (time, message_index) {
                      return time['finish'] !== undefined;
                  });


                  // 2. The count tracker of successful requests is equal to the number of requests sent
                  // 3. The number of successful requests is the same as the number of successful requests from
                  //    20 seconds ago AND more than 90% of requests were successful or the request process has
                  //    been running for 5 minutes
                  if ( readyToResolve
                      || ((self.count / self.benchmark_obj.request_interval) === 1)
                      || (self.count === self.last_count[0]
                          && (((self.count / self.benchmark_obj.request_interval) > .9)
                              || (timer++ >= 100)
                      ))) {

                      // stop checking if the request process has finished, and resolve with the times array
                      clearInterval(finishCount);
                      resolve(self.times);
                  }

                  // Track the count of successful request.
                  // The array stores the last 20 checks (20 seconds).
                  // If the number of successful requests is not changing, we can assume no more
                  // will be coming in.
                  self.last_count.push(self.count);

              }, 1000);
              }
            })
        } else {
          resolve("error here 2")
        }
      }
    })
  }

  disconnect() {
    if (this.client) {
      this.forceDisconnect = false;
      this.client.disconnect();
    }
  }
}