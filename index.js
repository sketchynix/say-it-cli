#!/usr/bin/env node

const program = require("commander");
const http = require("http");
const request = require("superagent");

program
  .option("-t, --text <text>", "The text to speech voice")
  .option("-g, --gender <gender>", "The gender of the voice")
  .option("-l, --list", "List all the available sounds to play")
  .option("-s, --sound <sound>", "The name of the sound to play")
  .option("-u, --upload <upload>", "Upload an mp3 file to the sound collection")
  .parse(process.argv);

const BASE_URL = process.env.SAY_IT_SERVER_URL || "http://172.16.1.50:3000";

let url = BASE_URL;

if (program.sound) {
  url += "/?file=" + program.sound + ".mp3";
} else if (program.text) {
  url += "/?speak=" + encodeURIComponent(program.text);

  if (program.gender) {
    url += "&gender=" + program.gender;
  }
} else if (program.list) {
  url += "/list";
} else if (program.upload) {
  url += "/upload";
  request
    .post(url)
    .attach("file", program.upload)
    .end(function(err, res) {
      if (err) {
        console.log("Error while uploading file: " + err.toString());
      } else {
        console.log("File uploaded: %s", program.upload);
      }
      process.exit();
    });
} else {
  console.log("Unknown / missing arguments");
  process.exit();
}

if (!program.upload) {
  http
    .get(url, response => {
      let data = "";

      // A chunk of data has been recieved.
      response.on("data", chunk => {
        data += chunk;
      });
      // The whole response has been received. Print out the result.
      response.on("end", () => {
        console.log(data);
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });
}
