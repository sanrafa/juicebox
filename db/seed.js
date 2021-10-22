const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  createPostTag,
  addTagsToPost,
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS posts;
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

    await client.query(`
          CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title varchar(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
          );
    `);

    await client.query(`
          CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL
          );
    `);

    await client.query(`
          CREATE TABLE post_tags(
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE("postId", "tagId")
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

async function createInitialPosts() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
    });

    await createPost({
      authorId: sandra.id,
      title: "1st Post",
      content: "My first post, I guess.",
    });

    await createPost({
      authorId: glamgal.id,
      title: "My first post",
      content: "I really have no idea what to write.",
    });
  } catch (err) {
    throw err;
  }
}

async function createInitialTags() {
  try {
    console.log("Creating tags...");

    const [happy, sad, inspo, catman] = await createTags([
      "#happy",
      "#worst-day-ever",
      "#youcandoanything",
      "#catmandoeverything",
    ]);

    const [post1, post2, post3] = await getAllPosts();

    await addTagsToPost(post1.id, [happy, inspo]);
    await addTagsToPost(post2.id, [sad, inspo]);
    await addTagsToPost(post3.id, [happy, catman, inspo]);

    console.log("Tags created!");
  } catch (err) {
    console.log("Error creating tags--");
    throw err;
  }
}

async function rebuildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
    await createInitialTags();
  } catch (err) {
    throw err;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
