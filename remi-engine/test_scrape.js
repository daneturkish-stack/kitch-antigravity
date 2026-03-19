const { 
  fetchPageContent, 
  transcribeVideoFromUrl, 
  searchForCreatorRecipe, 
  fetchRecipeFromWebsite 
} = require('./index.js');
require('dotenv').config();

async function testScrapeLogic() {
  const url = "https://www.instagram.com/reel/DVqz6PrCPMu/";
  console.log("--- STARTING TEST SCRAPE ---");
  
  // 1. Fetch Page Content
  const pageData = await fetchPageContent(url);
  console.log("Page Data extracted:", {
    title: pageData.text.match(/^Title: (.*)/m)?.[1],
    pageTitle: pageData.text.match(/^Page Title: (.*)/m)?.[1],
    hasVideo: !!pageData.videoUrl,
    videoUrl: pageData.videoUrl ? pageData.videoUrl.substring(0, 50) + "..." : "none",
    textLength: pageData.text?.length,
    textSnippet: pageData.text?.substring(0, 200)
  });

  // 2. Transcription (if video found)
  let transcript = null;
  if (pageData.videoUrl) {
    console.log("Attempting transcription...");
    transcript = await transcribeVideoFromUrl(pageData.videoUrl);
    console.log("Transcript snippet:", transcript ? transcript.substring(0, 100) + "..." : "FAILED");
  }

  // 3. Search Fallback
  let webContent = null;
  const postTitle = pageData.text?.match(/Title: (.*)/)?.[1] || pageData.text?.match(/Page Title: (.*)/)?.[1] || "";
  const cleanTitle = postTitle.replace(/Instagram|Reel|Video|Post/gi, '').trim();
  
  // Extract handle from snippet
  const handleMatch = pageData.text?.match(/comments - ([^ ]+) on/);
  const handle = handleMatch ? `@${handleMatch[1]}` : "@thehappypear";

  if (cleanTitle) {
    console.log(`Searching for: "${cleanTitle}" by ${handle}`);
    const searchResult = await searchForCreatorRecipe(cleanTitle, handle);
    if (searchResult) {
      console.log("Found search result:", searchResult.url);
      webContent = await fetchRecipeFromWebsite(searchResult.url);
      console.log("Web Content snippet:", webContent ? webContent.substring(0, 100) + "..." : "FAILED");
    }
  }

  console.log("--- TEST COMPLETE ---");
}

testScrapeLogic();
