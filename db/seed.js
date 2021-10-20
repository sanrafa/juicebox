const { client, getAllUsers, createUser } = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS users;
        `);

    console.log("Tables dropped!");
  } catch (err) {
    console.error("Error dropping tables--");
    throw err;
  }
}

async function createTables() {
  try {
    console.log("Building tables...");

    await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
        );
        `);

    console.log("Tables created!");
  } catch (err) {
    console.error("Error building tables--");
    throw err;
  }
}

async function createInitialUsers() {
  try {
    console.log("Creating users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });

    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
    });

    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
    });

    console.log("Done creating users!");
  } catch (err) {
    console.error("Error creating users--");
    throw err;
  }
}

async function rebuildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
  } catch (err) {
    throw err;
  }
}

async function testDB() {
  try {
    console.log("Now testing database...");

    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished testing database!");
  } catch (err) {
    console.error("Error testing database!");
    throw err;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
