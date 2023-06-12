import type {AttributeDefinition} from "@orbit/records";
import {ZodTypeAny} from "zod";

import {getAttributeType} from "./getAttributeType";
import {getValidationOptions} from "./getValidationOptions";
import {ZodAttribute} from "./types";

export const zodToAttributeDefinition = (
    zodSchema: ZodTypeAny,
): AttributeDefinition => {
    if (zodSchema instanceof ZodAttribute) {
        return zodSchema.toAttributeDefinition();
    }
    return {
        type: getAttributeType(zodSchema),
        validation: getValidationOptions(zodSchema),
    };
};
