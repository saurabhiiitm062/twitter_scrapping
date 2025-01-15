const { Builder, By, Key, until } = require("selenium-webdriver");
const { exec } = require("child_process");
const chrome = require("selenium-webdriver/chrome");
const MongoClient = require("mongodb").MongoClient;

require("dotenv").config();

async function scrapeTrends() {
  let driver;
  const mongoUrl = "mongodb://localhost:27017";
  const client = new MongoClient(mongoUrl);
  const options = new chrome.Options();

  const PROXY_USERNAME = process.env.PROXY_USERNAME;
  const PROXY_PASSWORD = process.env.PROXY_PASSWORD;
  const PROXY_PORT = process.env.PROXY_PORT || "31280";
  const PROXY_HOSTS = [
    "us-ca.proxymesh.com",
    "us-wa.proxymesh.com",
    "fr.proxymesh.com",
    "jp.proxymesh.com",
    "au.proxymesh.com",
    "de.proxymesh.com",
    "nl.proxymesh.com",
    "sg.proxymesh.com",
    "us-il.proxymesh.com",
    "us-tx.proxymesh.com",
    "us-dc.proxymesh.com",
    "us-ny.proxymesh.com",
    "uk.proxymesh.com",
    "ch.proxymesh.com",
    "us-fl.proxymesh.com",
    "in.proxymesh.com",
    "open.proxymesh.com",
    "world.proxymesh.com",
    "usisp.proxymesh.com",
  ];

  const randomIndex = Math.floor(Math.random() * PROXY_HOSTS.length);
  const PROXY_HOST = PROXY_HOSTS[randomIndex];

  const proxyURL = `http://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}:${PROXY_PORT}`;
  console.log("Using proxy:", proxyURL);

  // Function to fetch user IP address using the same proxy

  async function getUserIP(proxyUrl) {
    try {
      const [auth, hostPort] = proxyUrl.split("@");
      const [host, port] = hostPort.split(":");
      const [username, password] = auth.replace("http://", "").split(":");

      // Running the curl command to fetch the IP address
      const curlCommand = `curl -x http://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_HOST}:${port} https://api.ipify.org?format=json`;

      return new Promise((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
          if (error) {
            reject(`Error fetching IP address: ${stderr}`);
          } else {
            const ip = JSON.parse(stdout).ip; // Parsing the JSON response to get the IP
            resolve(ip);
          }
        });
      });
    } catch (error) {
      console.error("Failed to fetch IP address:", error.message);
      return "Unknown IP";
    }
  }

  async function loginToTwitter(username, password) {
    await driver.get("https://twitter.com/login");
    await driver.sleep(5000);
    await driver
      .findElement(By.xpath("//input[@autocomplete='username']"))
      .sendKeys(username, Key.RETURN);
    await driver.sleep(3000);
    await driver
      .findElement(By.xpath("//input[@autocomplete='current-password']"))
      .sendKeys(password, Key.RETURN);
    await driver.sleep(5000);
  }

  async function getTrendingTopics() {
    const trends = [];
    const trendXPaths = [
      "/html[1]/body[1]/div[1]/div[1]/div[1]/div[2]/main[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/section[1]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]/div[1]/div[2]/span[1]",
      "/html[1]/body[1]/div[1]/div[1]/div[1]/div[2]/main[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/section[1]/div[1]/div[1]/div[4]/div[1]/div[1]/div[1]/div[1]/div[2]/span[1]",
      "/html[1]/body[1]/div[1]/div[1]/div[1]/div[2]/main[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/section[1]/div[1]/div[1]/div[4]/div[1]/div[1]/div[1]/div[1]/div[2]/span[1]",
      "/html[1]/body[1]/div[1]/div[1]/div[1]/div[2]/main[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/section[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/span[1]/span[1]",
      "/html[1]/body[1]/div[1]/div[1]/div[1]/div[2]/main[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/section[1]/div[1]/div[1]/div[5]/div[1]/div[1]/div[1]/div[1]/div[2]/span[1]/span[1]",
    ];

    try {
      for (let i = 0; i < trendXPaths.length; i++) {
        const trendXPath = trendXPaths[i];
        const trendElement = await driver.wait(
          until.elementLocated(By.xpath(trendXPath)),
          30000
        );
        const trendText = await trendElement.getText();
        trends.push(trendText.trim());
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
    }
    return trends;
  }

  try {
    options.addArguments(`--proxy-server=${PROXY_HOST}:${PROXY_PORT}`);
    options.addArguments("--ignore-certificate-errors");
    options.addArguments("--proxy-bypass-list=*");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await client.connect();

    const ipAddress = await getUserIP(proxyURL);
    const proxyIPAddress = PROXY_HOST;

    await loginToTwitter(process.env.X_USERNAME, process.env.X_PASSWORD);

    await driver.get("https://x.com/explore/tabs/trending");
    await driver.sleep(5000);

    const trends = await getTrendingTopics();
    return { trends, ipAddress, proxyIPAddress };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (driver) {
      await driver.quit();
    }
    await client.close();
  }
}

module.exports = scrapeTrends;
