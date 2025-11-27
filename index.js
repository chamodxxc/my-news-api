import axios from "axios";
import * as cheerio from "cheerio";

export default {
  async fetch(request, env) {
    try {
      const baseUrl = "https://sinhala.newsfirst.lk";

      // Latest news page
      const { data } = await axios.get(`${baseUrl}/latest-news`);
      const $ = cheerio.load(data);

      // Get latest article URL
      let latestUrl = $('.ng-star-inserted > div > div > a').attr('href');
      if (!latestUrl) {
        return new Response(
          JSON.stringify({ error: true, message: "No news found" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      latestUrl = baseUrl + latestUrl;

      // Fetch latest news article page
      const latestGet = await axios.get(latestUrl);
      const $2 = cheerio.load(latestGet.data);

      // Scrape details
      const title = $2(".ng-star-inserted > h1").text().trim();
      const image = $2("#post_img").attr('src');
      const date = $2(".author_main > span").text().trim();
      let desc = $2('#testId')
        .html()
        ?.replace(/<p\s*\/?>/gi, '\n\n')
        .replace(/\n{2,}/g, '\n\n')
        .replace(/<[^>]+>/g, '')
        .trim() || "";

      // Prepare JSON
      const news = { title, image, date, desc, url: latestUrl };

      return new Response(JSON.stringify(news), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: true, message: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
