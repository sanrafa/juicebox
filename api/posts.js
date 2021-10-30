const express = require("express");
const postsRouter = express.Router();

const { getAllPosts, createPost } = require("../db");
const { requireUser } = require("./utils");

postsRouter.use((res, req, next) => {
  console.log("A request is being made to /posts");

  next();
});

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  console.log(req.body);
  console.log("Requested by user: ", req.user);

  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData.authorId = req.user[0].id;
    postData.title = title;
    postData.content = content;

    console.log(postData);

    const post = await createPost(postData);

    if (post) {
      res.send({ post });
    } else {
      next({
        name: "CreatePostError",
        message: "Your post could not be created. Please try again later.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postsRouter;
