const jwt = require("jsonwebtoken");

const express = require("express");
const usersRouter = express.Router();

const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
  updateUser,
} = require("../db");
const { requireUser, requireActiveUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password.",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect.",
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "That username already exists.",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "Thanks for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete(
  "/:userId",
  requireUser,
  requireActiveUser,
  async (req, res, next) => {
    try {
      const user = await getUserById(req.params.userId); //USE user[0] to access user obj

      if (user && user[0].id === req.user[0].id && user[0].active) {
        const updatedUser = await updateUser(user[0].id, { active: false });

        res.send({
          message: "Your account is deactivated.",
          user: updatedUser,
        });
      } else if (!user[0].active) {
        next({
          name: "InactiveUserError",
          message: "This account is already deactivated.",
        });
      } else {
        next(
          user
            ? {
                name: "UnauthorizedUserError",
                message: "You cannot deactivate an account that is not yours.",
              }
            : {
                name: "UserNotFoundError",
                message: "Could not find user by that id.",
              }
        );
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId); //USE user[0] to access user obj

    if (user && user[0].id === req.user[0].id && !user[0].active) {
      const updatedUser = await updateUser(user[0].id, { active: true });

      res.send({
        message: "Your account is reactivated.",
        user: updatedUser,
      });
    } else if (user[0].active) {
      next({
        name: "ActiveUserError",
        message: "This account is already activated.",
      });
    } else {
      next(
        user
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot reactivate an account that is not yours.",
            }
          : {
              name: "UserNotFoundError",
              message: "Could not find user by that id.",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

module.exports = usersRouter;
