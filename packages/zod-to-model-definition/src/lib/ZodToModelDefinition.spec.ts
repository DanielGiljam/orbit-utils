import {zodToModelDefinition} from "./ZodToModelDefinition";

describe("zodToModelDefinition", () => {
    it("should work", () => {
        expect(zodToModelDefinition()).toEqual("zod-to-model-definition");
    });
});
