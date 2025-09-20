const fs = require("fs");
const core = require("@actions/core");
const mysql = require("mysql2/promise");

async function run() {
  try {
    const resultsFile = core.getInput("results-file");
    const host = core.getInput("db-host");
    const user = core.getInput("db-user");
    const pass = core.getInput("db-pass");
    const db = core.getInput("db-name");

    const data = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    console.log("data",JSON.stringify(data));
    const parsed = [];

    function walkSuite(suite, browser) {
      if (suite.specs) {
        suite.specs.forEach((spec) => {
          spec.tests.forEach((test) => {
            parsed.push({
              platform: test.projectId ?? null,
              batch: process.env.GITHUB_RUN_ID, //data.config?.metadata?.gitCommit?.hash ?? null,
              file: spec.file ?? null,
              test: spec.title,
              browser: browser || suite.title,
              status: test.results[0].status,
              error: test.results[0].error ? test.results[0].error.message : null,
            });
          });
        });
      }
      if (suite.suites) {
        suite.suites.forEach((s) => walkSuite(s, browser || suite.title));
      }
    }

    data.suites.forEach((suite) => walkSuite(suite));

    console.log("Parsed results:", parsed);

    const connection = await mysql.createConnection({
      host,
      user,
      password: pass,
      database: db,
      port: 4085,
      "ssl": { rejectUnauthorized: true } 
    });


    //create the batch
    await connection.execute("INSERT INTO playwright_batches(hash) VALUES(?)", [process.env.GITHUB_RUN_ID]);

    for (const r of parsed) {
      await connection.execute(
        "INSERT INTO playwright_results (test, browser, status, error, platform, batch, file) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [safe(r.test), safe(r.browser), safe(r.status), safe(r.error), safe(r.platform), safe(r.batch), safe(r.file)]
      );
    }

    await connection.end();
    console.log("✅ Results uploaded to MySQL");
  } catch (error) {
    core.setFailed(error.message);
  }
}

function safe(value) {
  return value === undefined ? null : value;
}


run();
