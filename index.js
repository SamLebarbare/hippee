const inquirer = require("inquirer");
const watt = require("watt");
const _ = require("highland");
const fs = require("fs");
const lineReader = require("readline").createInterface({
  input: require("fs").createReadStream("./ip2loc.csv")
});

const long2ip = ip =>
  [ip >>> 24, (ip >>> 16) & 0xff, (ip >>> 8) & 0xff, ip & 0xff].join(".");

const extract = watt(function*(next) {
  const res = yield _("line", lineReader)
    .map(line => {
      return line.split(",");
    })
    .filter(row => row[2] === '"CH"')
    .take(2)
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
    .collect()
    .toCallback(next);
  return res;
});

const run = watt(function*(next) {
  const ip2loc = yield extract();
  console.dir(ip2loc);
});
run();
