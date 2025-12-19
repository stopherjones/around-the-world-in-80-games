// ✅ CommonJS version — works on GitHub Actions without config
const { JSDOM } = require("jsdom");
const fs = require("fs");

// ✅ Add all tournament IDs you want to track
const TOURNAMENT_IDS = [
  354697, // UK example
  // Add more IDs here
];

// ✅ Fetch + parse a single tournament
async function scrapeTournament(id) {
  const url = `https://boardgamearena.com/tournament?id=${id}`;
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // ✅ Detect completed tournaments
  const finishedBanner = doc.querySelector(".tournament_finished");
  const resultsTable = doc.querySelector(".tournament_results");

  if (finishedBanner || resultsTable) {
    const rows = [...doc.querySelectorAll(".tournament_results tr")].map(tr =>
      [...tr.querySelectorAll("td")].map(td => td.textContent.trim())
    );

    return {
      id,
      status: "completed",
      standings: rows
    };
  }

  // ✅ Detect ongoing tournaments
  const roundEl = doc.querySelector(".tournament_round");
  const round = roundEl ? roundEl.textContent.trim() : null;

  return {
    id,
    status: "ongoing",
    round
  };
}

// ✅ Main runner — scrapes all tournaments safely
async function main() {
  const results = {};

  for (const id of TOURNAMENT_IDS) {
    try {
      console.log(`Scraping tournament ${id}...`);
      results[id] = await scrapeTournament(id);
    } catch (err) {
      console.error(`Error scraping ${id}:`, err.message);
      results[id] = { id, status: "error", error: err.message };
    }
  }

  // ✅ Ensure data folder exists
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  fs.writeFileSync("data/tournaments.json", JSON.stringify(results, null, 2));
  console.log("✅ tournaments.json updated");
}

// ✅ Prevent GitHub Action from failing
main().catch(err => {
  console.error("Scraper failed:", err);
  process.exit(0);
});
