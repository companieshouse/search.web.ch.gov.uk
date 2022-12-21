import chai from "chai";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { mapPageHeader } from "../../src/utils/page.header.utils";
import { PageHeader } from "../../src/model/PageHeader";

describe("mapPageHeader", () => {
    it("should populate the header fields correctly", async () => {
        testMapPageHeader("demo@ch.gov.uk", 0);
        testMapPageHeader("demo@ch.gov.uk", 1);
        testMapPageHeader("demo2@ch.gov.uk", 0);
        testMapPageHeader("demo3@ch.gov.uk", 1);
    });
});

const testMapPageHeader = (emailAddress: string, isSignedIn: number) => {
    const mockRequest = generateMockRequest(emailAddress, isSignedIn);

    const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
    chai.expect(returnedPageHeader.isSignedIn).to.equal(isSignedIn === 1);
    chai.expect(returnedPageHeader.userEmailAddress).to.equal(emailAddress);
};

const generateMockRequest = (emailAddress: string, isSignedIn: number):Request => {
    const mockRequest = {} as Request;
    mockRequest.session = new Session(
        {
            signin_info: {
                user_profile: {
                    email: emailAddress
                },
                signed_in: isSignedIn
            }
        }
    );
    return mockRequest;
};
