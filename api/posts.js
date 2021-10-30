const express = require("express");
const postsRouter = express.Router();

const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
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
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      if (post.active) {
        return true;
      } else if (req.user && post.author.id === req.user[0].id) {
        return true;
      } else {
        return false;
      }
    });

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);
    console.log(originalPost);
    console.log(req.user.id);

    if (originalPost.author.id === req.user[0].id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user[0].id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a post that is not yours.",
            }
          : {
              name: "PostNotFoundError",
              message: "That post doesn't exist.",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
