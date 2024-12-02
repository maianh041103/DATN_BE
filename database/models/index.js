"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const config = require("config");
const dbConfig = config.get("mp");
const db = {};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port || 3306,
    dialect: dbConfig.dialect,
    logging: false,
    freezeTableName: false,
    operatorsAliases: Sequelize.Op,
    define: {
      underscored: false,
      charset: "utf8mb4",
      timestamps: true,
      deletedAt: "deletedAt",
      paranoid: false,
    },
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      typeCast: function (field, next) {
        // for reading from database
        if (field.type === "DATETIME") {
          return field.string();
        }
        return next();
      },
    },
    // quoteIdentifiers: false,
    timezone: "+07:00",
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

fs.readdirSync(`${__dirname}/mp_models`)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(`${__dirname}/mp_models`, file))(
      sequelize,
      Sequelize
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
  .authenticate()
  .then(function (err) {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
