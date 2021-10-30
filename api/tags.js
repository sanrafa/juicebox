const express = require("express");
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next();
});

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;

  try {
    const postsWithTag = await getPostsByTagName(tagName);
    const activePosts = postsWithTag.filter((post) => {
      if (post.active && post.author.active) {
        return true;
      } else if (req.user && post.author.id === req.user[0].id) {
        return true;
      } else {
        return false;
      }
    });
    res.send({ posts: activePosts });
  } catch ({ name, message }) {
    next({
      name: "ErrorFetchingPostsByTagName",
      message: "Could not fetch posts by tag name.",
    });
  }
});

module.exports = tagsRouter;
