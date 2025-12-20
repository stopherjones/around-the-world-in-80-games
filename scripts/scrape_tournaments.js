// ✅ CommonJS version — works on GitHub Actions without config
const { JSDOM } = require("jsdom");
const fs = require("fs");

// ✅ Add all tournament IDs you want to track
const TOURNAMENT_IDS = [
  354697,  // Mr Jack
  354698,  // Next Station: London  
  360285,  // Gift of Tulips 
  360291,  // Thurn and Taxis 
  368884,  // Copenhagen
  368887,  // Fika
  374194,  // Knarr
  378251,  // Saint Petersburg
  380123,  // Herrlof
  387302,  // Akropolis
  387304,  // Santorini
  404118,  // Ponte del Diavolo
  404125,  // Verona Twist
  404206,  // Viticulture
  410031,  // Ticket to Ride: Switzerland
  420784,  // Oriflamme
  420786,  // Carcassonne
  420787,  // Fromage
  420929,  // The Castles of Burgundy
  427916,  // Finca
  427918,  // Alhambra
  427919,  // Azul: Summer Pavilion
  439073,  // Marrakech
  439074,  // Medina
  461495,  // Targi
  461517,  // Caravan
  488440,  // Orapa Mine
  488444,  // Rift Valley Reserve
  488602,  // RallymanGT
  499404,  // Sobek 
  499408,  // Luxor
  499409,  // Imhotep
  499398,  // Nile
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
