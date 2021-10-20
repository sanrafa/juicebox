const { client } = require("./index");

async function testDB() {
  try {
    client.connect();
    const { rows } = await client.query(`
            SELECT * FROM users;
        `);
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
}

testDB();
