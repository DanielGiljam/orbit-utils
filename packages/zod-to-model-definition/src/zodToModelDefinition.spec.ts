import {z} from "zod";

import {m} from "./index";
import {zodToModelDefinition} from "./zodToModelDefinition";

describe("zodToModelDefinition", () => {
    it("should work", () => {
        const planetZodSchema = z.object({
            type: z.literal("planet"),
            id: z.string().optional(),
            attributes: z.object({
                name: z.string(),
                classification: z.enum(["terrestrial", "gaseous"]),
                atmosphere: z.boolean(),
                mass: z.number().positive().finite(),
            }),
            relationships: z.object({
                solarSystem: m
                    .relationship("hasOne", "solarSystem")
                    .inverse("planets"),
                moons: m.relationship("hasMany", "moon").inverse("planet"),
            }),
        });
        expect(zodToModelDefinition(planetZodSchema)).toEqual({
            attributes: {
                name: {type: "string"},
                classification: {type: "string"},
                atmosphere: {type: "boolean"},
                mass: {type: "number"},
            },
            relationships: {
                solarSystem: {
                    kind: "hasOne",
                    type: "solarSystem",
                    inverse: "planets",
                },
                moons: {kind: "hasMany", type: "moon", inverse: "planet"},
            },
        });
    });
});
