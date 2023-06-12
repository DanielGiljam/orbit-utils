import type {RelationshipDefinition} from "@orbit/records";
import {ZodObject, ZodTypeAny} from "zod";

import {getRelationshipKind} from "./getRelationshipKind";
import {getRelationshipType} from "./getRelationshipType";
import {getValidationOptions} from "./getValidationOptions";
import {ZodRelationship} from "./types";

export const zodToRelationshipDefinition = (
    zodSchema: ZodTypeAny,
): RelationshipDefinition => {
    if (zodSchema instanceof ZodRelationship) {
        return zodSchema.toRelationshipDefinition();
    }
    if (zodSchema instanceof ZodObject) {
        const data = zodSchema.shape.data as ZodTypeAny | undefined;
        if (data != null) {
            return {
                kind: getRelationshipKind(data),
                type: getRelationshipType(data),
                validation: getValidationOptions(data),
            };
        } else {
            throw new TypeError(
                `Expected relationship data type to be defined.`,
            );
        }
    } else {
        throw new TypeError(
            `Expected relationship schema to be instance of ZodObject, but got ${zodSchema.constructor.name}.`,
        );
    }
};
