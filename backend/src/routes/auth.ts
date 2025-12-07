import { Router } from "express";

// This auth router was intentionally simplified: Clerk handles authentication.
// Keep a minimal router so imports don't break if any remaining code references it.
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth handled by Clerk. No local auth endpoints." });
});

export default router;
