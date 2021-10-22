const { client, getAllUsers, createUser, updateUser } = require("./index");

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
            password varchar(255) NOT NULL,
            name varchar(255) NOT NULL,
            location varchar(255) NOT NULL,
            active BOOLEAN DEFAULT true
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
      name: "Albert",
      location: "USA",
    });

    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Sandra",
      location: "UK",
    });

    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Cindy",
      location: "Hong Kong",
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

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("List of users:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

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
