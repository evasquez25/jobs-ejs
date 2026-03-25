const { app } = require("../app");
const Job = require("../models/Job");
const User = require("../models/User");
const get_chai = require("../utils/get_chai");
const { seed_db, testUserPassword, factory } = require("../utils/seed_db");

describe("testing job CRUD operations", function () {
  before(async function () {
    const { expect, request } = await get_chai();

    this.test_user = await seed_db();
    this.agent = request.agent(app);

    const logonResponse = await this.agent
      .post("/sessions/logon")
      .type("form")
      .redirects(0)
      .send({
        email: this.test_user.email,
        password: testUserPassword,
      });

    expect(logonResponse).to.have.status(302);
    expect(logonResponse.headers.location).to.equal("/");
  });

  after(async function () {
    if (this.agent) {
      this.agent.close();
    }
    await Job.deleteMany({});
    await User.deleteMany({});
  });

  it("should get the job list with 20 seeded jobs", async function () {
    const { expect } = await get_chai();

    const res = await this.agent.get("/jobs");

    expect(res).to.have.status(200);
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21);
  });

  it("should add a job entry", async function () {
    const { expect } = await get_chai();

    const newJobPage = await this.agent.get("/jobs/new");
    expect(newJobPage).to.have.status(200);

    const textNoLineEnd = newJobPage.text.replaceAll("\n", "");
    const csrfToken = /name="_csrf" value="(.*?)"/.exec(textNoLineEnd);
    expect(csrfToken).to.not.be.null;

    const jobData = await factory.build("job");

    const createResponse = await this.agent
      .post("/jobs")
      .type("form")
      .redirects(0)
      .send({
        company: jobData.company,
        position: jobData.position,
        status: jobData.status,
        _csrf: csrfToken[1],
      });

    expect(createResponse).to.have.status(302);
    expect(createResponse.headers.location).to.equal("/jobs");

    const jobs = await Job.find({ createdBy: this.test_user._id });
    expect(jobs.length).to.equal(21);
  });
});
