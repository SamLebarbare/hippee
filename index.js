const inquirer = require("inquirer");
const watt = require("watt");
const _ = require("highland");
const fs = require("fs");
const lineReader = require("readline").createInterface({
  input: require("fs").createReadStream("./ip2loc.csv")
});

const extract = watt(function*(next) {
  const res = yield _("line", lineReader)
    .map(line => {
      return line.split(",");
    })
    .filter(row => row[2] === '"CH"')
    .take(100)
    .map(row => {
      return {
        from: row[0],
        to: row[1]
      };
    })
    .collect()
    .toCallback(next);
  return res;
});

const run = watt(function*(next) {
  const ip2loc = yield extract();
  console.dir(ip2loc);
});
run();
