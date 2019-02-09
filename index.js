const inquirer = require("inquirer");
const watt = require("watt");
const _ = require("highland");
const fs = require("fs");

const long2ip = ip =>
  [ip >>> 24, (ip >>> 16) & 0xff, (ip >>> 8) & 0xff, ip & 0xff].join(".");

const run = watt(function*(country, perSec, next) {
  yield _(fs.createReadStream("./ip2loc.csv"))
    .split()
    .map(line => {
      return line.split(",");
    })
    .filter(row => row[2] === `"${country}"`)
    .map(row => {
      return {
        from: +row[0].replace(/"/g, ""),
        to: +row[1].replace(/"/g, "")
      };
    })
    .reduce([], (ips, range) => {
      for (let lip = range.from; lip < range.to; lip++) {
        const ip = long2ip(lip);
        if (ip.endsWith("0") || ip.endsWith("255")) {
          continue;
        }
        ips.push(ip);
      }
      return ips;
    })
    .flatten()
    .ratelimit(perSec, 1000)
    .tap(ip => console.log(ip))
    .done(next);
});

const app = watt(function*(next) {
  console.log(`.__    .__                             `);
  console.log(`|  |__ |__|_____ ______   ____   ____  `);
  console.log(`|   Y  \\  |  |_> >  |_> >  ___/\\  ___/ `);
  console.log(`|___|  /__|   __/|   __/ \\___  >\\___  >`);
  console.log(`     \\/   |__|   |__|        \\/     \\/ `);
  yield run("CH", 10);
  console.log("end");
});
app();
