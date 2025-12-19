import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs";

const TOURNAMENT_IDS = [
  354697
  // Add more IDs here
];

async function scrapeTournament(id) {
  const url = `https://boardgamearena.com/tournament?id=${id}`;
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const finished = doc.querySelector(".tournament_finished");
  const resultsTable = doc.querySelector(".tournament_results");

  // Completed tournament
  if (finished || resultsTable) {
    const rows = [...doc.querySelectorAll(".tournament_results tr")].map(tr =>
      [...tr.querySelectorAll("td")].map(td => td.textContent.trim())
    );

    return {
      id,
      status: "completed",
      standings: rows
    };
  }

  // Ongoing tournament
  const roundEl = doc.querySelector(".tournament_round");
  const round = roundEl ? roundEl.textContent.trim() : null;

  return {
    id,
    status: "ongoing",
    round
  };
}

async function main() {
  const results = {};

  for (const id of TOURNAMENT_IDS) {
    try {
      results[id] = await scrapeTournament(id);
    } catch (err) {
      results[id] = { id, status: "error", error: err.message };
    }
  }

  fs.writeFileSync("data/tournaments.json", JSON.stringify(results, null, 2));
}

main();
