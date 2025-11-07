import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserRepository } from "../../../domain/repositories/UserRepository";

export const makeUserRouter = (userRepo: UserRepository) => {
  const router = Router();
  const controller = new UserController(userRepo);
  router.post("/users", controller.create);
  router.get("/users", controller.list);
  return router;
};



