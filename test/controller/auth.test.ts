import request from "supertest";
import connection from "../../src/connection";
const app = require("../../src/app");

let Cookies;
let server;

beforeAll(async () => {
	await connection.create();

	const mod = await require("../../src/app");
	server = (mod as any).default;
});

afterAll(async () => {
	await connection.close();
});

describe("Test auth controller", () => {
	it("Register an account", async (done) => {
		const res = await request(server)
			.post("/auth")
			.send({ email: "testuser2@aimbase.fun", password: "test1234" });
		expect(res.status).toEqual(201);
		done();
	});
});

/**
 * TODO:
 * Test for all controllers
 */
