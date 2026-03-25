const Job = require("../models/Job");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
require("dotenv").config();

const testUserPassword = faker.internet.password();

const buildJob = (overrides = {}) => ({
  company: faker.company.name().slice(0, 50),
  position: faker.person.jobTitle().slice(0,100),
  status:
    ["Interview", "Declined", "Pending"][Math.floor(3 * Math.random())], // random one of these
  ...overrides,
});

const buildUser = (overrides = {}) => ({
  name: faker.person.fullName().slice(0, 50),
  email: faker.internet.email(),
  password: faker.internet.password(),
  ...overrides,
});

const factory = {
  async build(name, overrides = {}) {
    if (name === "job") {
      return buildJob(overrides);
    }
    if (name === "user") {
      return buildUser(overrides);
    }
    throw new Error(`Unknown factory: ${name}`);
  },

  async create(name, overrides = {}) {
    if (name === "job") {
      return Job.create(buildJob(overrides));
    }
    if (name === "user") {
      return User.create(buildUser(overrides));
    }
    throw new Error(`Unknown factory: ${name}`);
  },

  async createMany(name, count, overrides = {}) {
    const docs = [];
    for (let i = 0; i < count; i += 1) {
      docs.push(await this.create(name, overrides));
    }
    return docs;
  },
};

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Job.deleteMany({}); // deletes all job records
    await User.deleteMany({}); // and all the users
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("job", 20, { createdBy: testUser._id }); // put 20 job entries in the database.
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
