import express from "express";
import cors from "cors";
import boardRoutes from "./routes/board.routes.js";
import listRoutes from "./routes/list.routes.js";
import cardRoutes from "./routes/card.routes.js";
import cardDetailsRoutes from "./routes/cardDetails.routes.js";
import metaRoutes from "./routes/meta.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/boards", boardRoutes);
app.use("/lists", listRoutes);
app.use("/cards", cardRoutes);
app.use("/card-details", cardDetailsRoutes);
app.use("/meta", metaRoutes);
export default app;
