// ✅ CommonJS version — works on GitHub Actions without config
const { JSDOM } = require("jsdom");
const fs = require("fs");

// ✅ Add all tournament IDs you want to track
const TOURNAMENT_IDS = [
  354697,
  354698,
  360285,
  360291, 
  368884,
  368887,
  374194,
  374197,
  378251,
  380123,
  387302,
  387304,
  404118,
  404124,
  404125,
  404206,
  410031,
  420784,
  420786,
  420787,
  420929,
  427916,
  427918,
  427919,
  439073,
  439074,
  461495,
  461517,
  488440,
  488444,
  488602,
  499404,
  499408,
  499409,
  // Add more IDs here
];

// ✅ Fetch + parse a single tournament
async function scrapeTournament(id) {
  const url = `https://boardgamearena.com/tournament?id=${id}`;
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const pageText = doc.body.textContent.toLowerCase();

  const isCompleted = pageText.includes("this tournament has ended");
  const isOngoing = pageText.includes("this tournament is in progress");

// ✅ Completed tournament
if (isCompleted) {
  const playerBlocks = [
    ...doc.querySelectorAll(".tournaments-results-players__player")
  ];

  // Change 5 → 4 if you want top 4
  const top4 = playerBlocks.slice(0, 4).map(block => {
    const nameEl = block.querySelector(".tournaments-results-players__name");
    const rankEl = block.querySelector(".tournaments-results-players__rank");

    return {
      rank: rankEl ? rankEl.textContent.trim() : null,
      name: nameEl ? nameEl.textContent.trim() : null
    };
  });

  return {
    id,
    status: "completed",
    top4
  };
}



  // ✅ Ongoing tournament
  if (isOngoing) {
    const roundEl = doc.querySelector(".tournament_round");
    const round = roundEl ? roundEl.textContent.trim() : null;

    return {
      id,
      status: "ongoing",
      round
    };
  }

  // ✅ Fallback (rare)
  return {
    id,
    status: "unknown"
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
