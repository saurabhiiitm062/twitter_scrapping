const scrapeTrends = require("../services/twitterScrapper");
const Trend = require("../models/Trends");
const { v4: uuidv4 } = require("uuid");

exports.scrapeTrendsController = async (req, res) => {
  try {
    console.log("Starting scrape for Twitter trends...");
    // Scrape the data
    const savedData = await scrapeTrends();
    console.log(savedData, "saved data");

    // Format trends as an array of strings with "nameoftrend" prefix
    const formattedTrends = savedData.trends.map((trend, index) => {
      return `nameoftrend${index + 1}: ${trend}`;
    });

    // Save the trends and IP address to MongoDB using Mongoose
    const trendData = await Trend.create({
      runId: uuidv4(),
      trends: formattedTrends,
      ipAddress: savedData.ipAddress,
      proxyIPAddress: savedData.proxyIPAddress,
      datetime: new Date(),
    });

    console.log("Trends saved to MongoDB!", trendData);

    res.status(200).json({
      success: true,
      message: "Trending topics scraped and saved successfully",
      data: trendData,
    });
  } catch (error) {
    console.error("Error during trend scraping:", error);
    res.status(500).json({
      success: false,
      message: "Failed to scrape trending topics",
      error: error.message,
    });
  }
};
