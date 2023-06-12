import {z} from "zod";

import {m} from "./index";
import {zodToModelDefinition} from "./zodToModelDefinition";

// TODO: test Orbit.js assumptions
// E.g.
// - AttributeDefinition.type can be undefined
// - RelationshipDefinition.type can be undefined
// - RelationshipDefinition.kind can be string[] while at the same time
//   have `inverse` defined and/or `dependent: "remove"` defined
// - RecordHasManyRelationship.data is in practice never undefined
// - RecordHasOneRelationship.data is in practice never undefined, but it can be null
// - RecordHasOneRelationship.data can be undefined if the relationship is optional
// - All relationships always appear on a record, no matter the validation options
//   (`required: true`, `notNull: true`) or if no relationships have been specified
//   for that particular record

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
        expect(zodToModelDefinition(planetZodSchema)).toMatchObject({
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
