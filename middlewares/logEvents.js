import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { format } from "date-fns";
import { fileURLToPath } from "url";
import { v4 } from "uuid";
const uuid = v4;

//Filename and dirname configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Function for logging events

export const logEvents = async (message, logFile) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFile),
      logItem
    );
  } catch (error) {
    console.log(error.message);
  }
};

// Logger Middleware

export const logger = (req, res, next) => {
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`;
  const logFile = "reqLog.txt";
  logEvents(message, logFile);
  next();
};
