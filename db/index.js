const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(`
        SELECT id, username, name, location, active
        FROM users; 
    `);
  return rows;
}

async function getAllPosts() {
  const { rows } = await client.query(`
    SELECT id, "authorId", title, content
    FROM posts;
  `);
  return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users (username, password, name, location)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [username, password, name, location]
    );
    return user;
  } catch (err) {
    throw err;
  }
}

async function createPost({ authorId, title, content }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts ("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
      [authorId, title, content]
    );
    return post;
  } catch (err) {
    throw err;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, idx) => `"${key}"=$${idx + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *; 
    `,
      Object.values(fields)
    );

    return user;
  } catch (err) {
    throw err;
  }
}

async function updatePost(id, { title, content, active }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      UPDATE posts
      SET "title"=$1, "content"=$2, "active"=$3
      WHERE id=${id}
      RETURNING *; 
    `,
      [title, content, active]
    );

    return post;
  } catch (err) {
    throw err;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${userId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users
      WHERE id=${userId};
    `);

    if (!rows) {
      return null;
    } else {
      delete rows.password;
      const posts = await getPostsByUser(userId);
      rows.posts = posts;
      return rows;
    }
  } catch (err) {
    throw err;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
};
