import type {AttributeDefinition} from "@orbit/records";
import {ZodTypeAny} from "zod";

import {ZodAttribute} from "./types";

export const zodToAttributeDefinition = (
    zodSchema: ZodTypeAny,
): AttributeDefinition => {
    if (zodSchema instanceof ZodAttribute) {
        return zodSchema.toAttributeDefinition();
    }
    throw new Error("Implementation missing!");
};
