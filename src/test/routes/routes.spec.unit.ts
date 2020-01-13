import app from '../../app';
import * as request from 'supertest';

jest.mock("../../controllers/search.controller");

describe("Basic URL Tests", () => {

    it("should find the search page url", async () => {
        const response = await request(app)
            .get("/");
        expect(response.status).toEqual(200);
    });

    it("should return 404 if page doesnt exist", async() => {
        const response = await request(app)
            .get("/gibberish")
        expect(response.status).toEqual(404);
    });

});
