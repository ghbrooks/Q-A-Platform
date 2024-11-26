import express, { Request, Response } from "express";
import { FieldSet, Records } from "airtable";
import bodyParser from "body-parser";
import pino from "express-pino-logger";
import cors from "cors";
import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(pino());

const apiKey = process.env.AIRTABLE_API_KEY as string;
const baseId = process.env.AIRTABLE_BASE_ID as string;

if (!apiKey || !baseId) {
  console.error("Missing Airtable API key or Base ID");
  process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);
const table = base("questions table");
app.get("/record", async (req: Request, res: Response) => {
  try {
    console.log("Fetching tasks from Airtable...");
    const records = await table.select().all();
    console.log("Tasks fetched successfully:", records);
    const tasks = records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.post("/record", async (req: Request, res: Response) => {
  try {
    const { fields } = req.body;
    const createdRecord = await table.create(fields) as Records<FieldSet>;
    res.status(201).json({
      id: createdRecord[0].id,
      ...createdRecord[0].fields,
    });
    res.status(201).json({
      id: createdRecord[0].id,
      ...createdRecord[0].fields,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.put("/record/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fields } = req.body;
    const updatedRecord = await table.update(id, fields);
    res.json({
      id: updatedRecord.id,
      ...updatedRecord.fields,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.delete("/record/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await table.destroy(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

app.listen(3001, () => {
  console.log("Express server is running on localhost:3001");
});
