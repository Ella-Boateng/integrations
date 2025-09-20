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
              platforn: test.projectId,
              batch: data.config?.["metadata"]?.["gitCommit"]?.["hash"],
              file: spec.file,
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

    for (const r of parsed) {
      await connection.execute(
        "INSERT INTO playwright_results (test, browser, status, error, platform, batch, file) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [r.test, r.browser, r.status, r.error, r.platform, r.batch, r.file]
      );
    }

    await connection.end();
    console.log("✅ Results uploaded to MySQL");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
