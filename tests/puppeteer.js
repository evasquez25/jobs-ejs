const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Job = require("../models/Job");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    //await sleeper(5000)
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });
  after(async function () {
    this.timeout(5000);
    await browser.close();
  });
  describe("got to site", function () {
    it("should have completed a connection", async function () {});
  });
  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async () => {
      this.logonLink = await page.waitForSelector(
        "a ::-p-text(Click this link to logon)",
      );
    });
    it("gets to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });
  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
      await page.waitForSelector("a ::-p-text(change the secret)");
      await page.waitForSelector('a[href="/secretWord"]');
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });

  describe("puppeteer job operations", function () {
    this.timeout(20000);

    it("gets to the jobs list page and finds 20 entries", async () => {
      const { expect } = await import("chai");
      this.jobsLink = await page.waitForSelector(
        'a[href="/jobs"]',
      );
      await this.jobsLink.click();
      await page.waitForNavigation();

      const heading = await page.waitForSelector("h2");
      const headingText = await heading.evaluate((el) => el.textContent);
      expect(headingText).to.include("Jobs List");

      const jobsPageHtml = await page.content();
      const pageParts = jobsPageHtml.split("<tr>");
      expect(pageParts.length).to.equal(21);
    });

    it("gets to the add job form and resolves the fields", async () => {
      const { expect } = await import("chai");
      this.addJobButton = await page.waitForSelector(
        'a[href="/jobs/new"] button',
      );
      await this.addJobButton.click();
      await page.waitForNavigation();

      const formHeading = await page.waitForSelector("h2");
      const formHeadingText = await formHeading.evaluate((el) => el.textContent);
      expect(formHeadingText).to.include("Add Job");

      this.company = await page.waitForSelector('input[name="company"]');
      this.position = await page.waitForSelector('input[name="position"]');
      this.addButton = await page.waitForSelector("button ::-p-text(Add Job)");

      expect(this.company).to.not.be.null;
      expect(this.position).to.not.be.null;
      expect(this.addButton).to.not.be.null;
    });

    it("adds a job and verifies it in the database", async () => {
      const { expect } = await import("chai");
      this.companyValue = "Puppeteer Test Company";
      this.positionValue = "Puppeteer Test Position";

      await this.company.type(this.companyValue);
      await this.position.type(this.positionValue);
      await this.addButton.click();
      await page.waitForNavigation();

      const jobsHeading = await page.waitForSelector("h2");
      const jobsHeadingText = await jobsHeading.evaluate((el) => el.textContent);
      expect(jobsHeadingText).to.include("Jobs List");

      const jobs = await Job.find({ createdBy: testUser._id }).sort({
        createdAt: -1,
      });
      expect(jobs.length).to.equal(21);
      expect(jobs[0].company).to.equal(this.companyValue);
      expect(jobs[0].position).to.equal(this.positionValue);
    });
  });
});
