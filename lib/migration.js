import { Migrator } from "mgdb-migrator";

// DO NOT WORK : db.collection is not a function

class DBMigrator {
  constructor() {
    this.migrator = new Migrator({
      log: true,
      logger: (level, message) => {
        console.info(`[${level}] ${message}`);
      },
      logIfLatest: false,
      collectionName: "migrations",
      db: process.env.MONGO_URI
    });
  }

  async init() {
    await this.migrator.config().catch(console.error);

    console.log("Config ok");

    this.migrator.add({
      version: 1,
      name: "Test",
      up: async function () {
        console.log(">>test");
      },
      down: async function () {}
    });

    this.migrator.migrateTo("latest");
  }
}

export default new DBMigrator();
