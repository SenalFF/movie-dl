import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

// Movie search endpoint
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Missing ?q= parameter" });
    }

    // Step 1: Search SinhalaSub
    const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl);
    const searchHtml = await searchRes.text();
    const $ = cheerio.load(searchHtml);

    // Step 2: First result
    const firstResult = $(".post-title a").attr("href");
    if (!firstResult) {
      return res.json({ error: "No results found" });
    }

    // Step 3: Go to movie page
    const movieRes = await fetch(firstResult);
    const movieHtml = await movieRes.text();
    const $$ = cheerio.load(movieHtml);

    // Step 4: Get download link
    const downloadUrl = $$(".maxbutton-1").attr("href");

    res.json({
      query,
      movie_url: firstResult,
      download_url: downloadUrl || "No download link found"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});
