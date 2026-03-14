// import dotenv from "dotenv";
// dotenv.config();

// import connectDB from "./db/index.js";
// import { app } from "./app.js";

// connectDB()
//   .then(() => {
//     const PORT = process.env.PORT || 8000;

//     const server = app.listen(PORT, () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//       console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
//     });

//     // Graceful shutdown
//     process.on("SIGTERM", () => {
//       console.log("SIGTERM received. Shutting down gracefully...");
//       server.close(() => {
//         console.log("Server closed.");
//         process.exit(0);
//       });
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
//   });

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Load .env only in development (on Render, env vars are injected directly)
try {
  const dotenv = await import("dotenv");
  dotenv.config();
} catch {
  // dotenv not available — env vars already set (production)
}

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
