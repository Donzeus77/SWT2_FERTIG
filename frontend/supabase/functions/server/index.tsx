import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as menu from "./menu.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5482ab2e/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize menu data on first request
let menuInitialized = false;
app.use("*", async (c, next) => {
  if (!menuInitialized) {
    try {
      await menu.initializeMenuData();
      menuInitialized = true;
      console.log("Menu data initialized successfully");
    } catch (error) {
      console.log(`Error initializing menu data: ${error}`);
    }
  }
  await next();
});

// Menu endpoints
app.get("/make-server-5482ab2e/menu/:date", async (c) => {
  try {
    const date = c.req.param("date");
    const menuData = await menu.getMenuByDate(date);

    if (!menuData) {
      return c.json({ error: "Menu not found for this date" }, 404);
    }

    return c.json(menuData);
  } catch (error) {
    console.log(`Error fetching menu: ${error}`);
    return c.json({ error: "Failed to fetch menu data" }, 500);
  }
});

app.get("/make-server-5482ab2e/menu", async (c) => {
  try {
    const menus = await menu.getAllMenus();
    return c.json(menus);
  } catch (error) {
    console.log(`Error fetching all menus: ${error}`);
    return c.json({ error: "Failed to fetch menus" }, 500);
  }
});

Deno.serve(app.fetch);