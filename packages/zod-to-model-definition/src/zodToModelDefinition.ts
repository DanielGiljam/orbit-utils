import {ModelDefinition} from "@orbit/records";
import {AnyZodObject, ZodObject, ZodRawShape} from "zod";

import {mapValues} from "./mapValues";
import {zodToAttributeDefinition} from "./zodToAttributeDefinition";
import {zodToKeyDefinition} from "./zodToKeyDefinition";
import {zodToRelationshipDefinition} from "./zodToRelationshipDefinition";

const modelDefinitionResolverMap = {
    keys: zodToKeyDefinition,
    attributes: zodToAttributeDefinition,
    relationships: zodToRelationshipDefinition,
} as const;

export const zodToModelDefinition = (zodSchema: AnyZodObject) =>
    mapValues(modelDefinitionResolverMap, (resolver, key) => {
        const innerSchema = zodSchema.shape[key];
        if (innerSchema == null) {
            return undefined;
        }
        if (innerSchema instanceof ZodObject) {
            return mapValues(innerSchema.shape as ZodRawShape, resolver);
        } else {
            throw new TypeError(
                `Expected zodSchema.shape.${key} to be a ZodObject, but got ${innerSchema.constructor.name}.`,
            );
        }
    }) as ModelDefinition;
