import { ConnectionWS } from "./ConnectionWS.js";
import { ConnectionWT } from "./ConnectionWT.js";

export class ConnectionManager {
  constructor(benchmark_obj,connection_obj,connection_progress_obj,benchmark_progress_obj) {
    this.connected = new Array(benchmark_obj.connection_interval);

    this.benchmark_obj = benchmark_obj;
    this.connection_obj = connection_obj;
    this.connection_progress_obj = connection_progress_obj;
    this.benchmark_progress_obj = benchmark_progress_obj;
  }

  createConnections() {
    this.connected[this.benchmark_obj.connection_interval - 1] = undefined;

    return new Promise((resolve, reject) => {

      let connection_start = Date.now();

      for (let i = 0; i < this.benchmark_obj.connection_interval; i++) {
        this.connection_obj.clients[i] = this.benchmark_obj.transport === "websocket" ? new ConnectionWS(this.benchmark_obj,this.connection_progress_obj,this.benchmark_progress_obj) : 
        new ConnectionWT(this.benchmark_obj,this.connection_progress_obj,this.benchmark_progress_obj);
        this.connection_obj.clients[i].connect().then(() => {
          this.connected[i] = 1;

          if (!this.connected.includes(undefined)) {
            this.connection_obj.connection_time = Date.now() - connection_start;
            resolve();
          }
        })
      }
    })
  }

  createConnectionsPerRound(round) {
    //calculate the number of existing connections
    let existing_client_count = this.benchmark_obj.connection_interval * round;

    //calculate the total number of connections that should exist after the connection process is finished
    let new_client_count = this.benchmark_obj.connection_interval * (round + 1) - 1;

    //create undefined values in the connected array for each expected new connection
    this.connected[new_client_count] = undefined;

    return new Promise((resolve, reject) => {

        //start the connection process
        let connection_start = Date.now();

        //loop for the number of new connections that should be made
        for (let i = 0; i < this.benchmark_obj.connection_interval; i++) {
            //create a new connection
            this.connection_obj.clients[existing_client_count + i] = this.benchmark_obj.transport === "websocket" ? new ConnectionWS(this.benchmark_obj,this.connection_progress_obj,this.benchmark_progress_obj) : 
            new ConnectionWT(this.benchmark_obj,this.connection_progress_obj,this.benchmark_progress_obj);
            this.connection_obj.clients[existing_client_count + i].connect().then(() => {

                //set the client number in the connected array as true
                this.connected[existing_client_count + i] = 1;

                //if all clients in the connected array have connected, end connection process and resolve
                if (!this.connected.includes(undefined)) {
                    this.connection_obj.connection_time = Date.now() - connection_start;
                    
                    resolve(Date.now() - connection_start);
                }
            });
        }
    });
}


  sendRequests() {
    // clear the times array which contains the previous rounds data
    this.connection_obj.times = new Array(this.benchmark_obj.connection_interval);

    return new Promise((resolve, reject) => {

        //loop through the clients array in the connection object, and start the request process
        for (let i = 0; i < this.connection_obj.clients.length; i++) {
            this.connection_obj.clients[i].sendRequest().then((time) => {
                this.connection_obj.times[i] = time;

                // resolve after all requests have been completed/timeout
                if (!this.connection_obj.times.includes(undefined)) {
                    resolve();
                }
            });
        }
    });
  }

  closeConnection() {
    for (let i = 0; i < this.connection_obj.clients.length; i++) {
      this.connection_obj.clients[i].disconnect();
    }
  }

  serverCheck() {
    const connection = this.benchmark_obj.transport === "websocket" ? 
        new ConnectionWS(this.benchmark_obj, this.connection_progress_obj, this.benchmark_progress_obj) : 
        new ConnectionWT(this.benchmark_obj, this.connection_progress_obj, this.benchmark_progress_obj);

    // Set up a promise that resolves when the connection is successful
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Connection timed out after 5 seconds'));
            connection.disconnect(); // Close the connection
        }, 5000); // 5000 milliseconds = 5 seconds
        
        connection.connect()
            .then(() => {
                clearTimeout(timeout); // Clear the timeout since the connection is successful
                console.log(this.benchmark_obj.transport, "server running!");
                connection.disconnect();
                resolve(); // Resolve the promise
            })
            .catch(error => {
                clearTimeout(timeout); // Clear the timeout on error
                reject(error); // Reject the promise with the error
            });
    });
}

}

