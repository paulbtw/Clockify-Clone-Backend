import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
	dotenv.config({ path: ".env" });
}

export const ENVIRONMENT = process.env.NODE_ENV;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const SESSION_MAX_AGE = process.env.SESSION_MAX_AGE || "86400";
export const SECRET = process.env.SECRET;
export const PORT = process.env.PORT || 5000

const prod = ENVIRONMENT === "production";
export const POSTGRES_DB_URL = prod
	? process.env.POSTGRES_DB_URL
	: process.env.POSTGRES_DB_URL_TEST;

if (!SESSION_SECRET) {
	console.log("No client secret. Set SESSION_SECRET environment variable.");
	process.exit(1);
}

if (!SECRET) {
	console.log("No client secret. Set SECRET environment variable.");
	process.exit(1);
}

if (!POSTGRES_DB_URL) {
	if (prod) {
		console.log(
			"No postgres connection string. Set POSTGRES_DB_URL environment variable."
		);
	} else {
		console.log(
			"No postgres connection string. Set POSTGRES_DB_URL_TEST environment variable."
		);
	}
	process.exit(1);
}
