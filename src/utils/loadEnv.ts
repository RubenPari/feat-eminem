import "dotenv/config";
import path from "path";

const loadEnv = () => {
  const envPath = path.join(__dirname, "../../.env");

  try {
    require("dotenv").config({ path: envPath });
    console.log("Environment variables loaded successfully");
  } catch (e) {
    console.log("Error loading .env file" + e);
  }
}

export default loadEnv;
