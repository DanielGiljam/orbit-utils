import type {RelationshipDefinition} from "@orbit/records";
import {ZodTypeAny} from "zod";

import {ZodRelationship} from "./types";

export const zodToRelationshipDefinition = (
    zodSchema: ZodTypeAny,
): RelationshipDefinition => {
    if (zodSchema instanceof ZodRelationship) {
        return zodSchema.toRelationshipDefinition();
    }
    throw new Error("Implementation missing!");
};
