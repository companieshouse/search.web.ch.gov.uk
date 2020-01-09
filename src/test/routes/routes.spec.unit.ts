import app from '../../app';
import * as request from 'supertest';

jest.mock("../../controllers/search.controller");

describe("Basic URL Tests", () => {

    it("should find the search page url", async () => {
        const response = await request(app)
          .get("/alphabetical-search/");
          expect(response.status).toEqual(200);
    });
});

