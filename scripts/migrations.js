// requiring path and fs modules
const path = require("path");
const fs = require("fs");
const Migration = require("../api/models/Migration");

module.exports = {
  friendlyName: "Run migration",

  description: "",

  fn: async function () {
    sails.log("Running custom shell script... (`sails run migration`)");
    // 1. api/migrations wahan se saari files le k ayegi ....
    // 2. migrations mai wahan se b saari fiels le k aonga ...
    // 3. dono array ka diff nikalonga or dykhonga konsi file db mai nahi hai...
    // 4. jo file nahi hai uska content get kronga or rawQuery run kronga...
    // 5. jis file ki rawQuery successfully run hojayegi usko db mai save krwa donga...
    // joining path of directory
    const directoryPath = path.join(__dirname, "../api/migrations");
    // passsing directoryPath and callback function
    try {
      const migration = fs.readdirSync(directoryPath);
      const migrated = await sails.models.migration.find({ select: ["path"] });
      const unmigrated = migration.filter((data) =>
        _.isUndefined(_.find(migrated, (o) => o.path == data))
      );
      const failedMigrations = [];
      const successMigrations = [];

      for (let i = 0; i < unmigrated.length; i++) {
        const f = unmigrated[i];
        const query = fs.readFileSync(directoryPath + "/" + f, "utf8");
        // Send it to the database.
        sails.log.debug("Migration is running: ", f);
        sails.log.debug("Running query ", query);
        try {
          const rawResult = await sails.models.migration
            .getDatastore()
            .sendNativeQuery(query);

          if (rawResult) {
            await sails.models.migration.create({ path: f });
            successMigrations.push(f);
          }
        } catch (e) {
          sails.log.error("Error caught while running " + f + " ||| ", e);
          failedMigrations.push(f);
        }
        sails.log.debug("=====================================");
      }
      if (unmigrated.length < 1) {
        sails.log.debug("No migration found");
      } else {
        sails.log.debug("Migration ran for these files: ", unmigrated);
        sails.log.debug(
          "Migration ran SUCCESSFULLY for these files: ",
          successMigrations
        );
      }
      sails.log.debug("These migrations failed: ", failedMigrations);
      return true;
    } catch (e) {
      sails.log.error("Error running migration", e);
      return false;
    }
  },
};
