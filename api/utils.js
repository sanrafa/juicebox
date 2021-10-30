const express = require("express");

function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action.",
    });
  }

  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user[0].active) {
    next({
      name: "InactiveUserError",
      message: "You must have an active account to perform this action.",
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
