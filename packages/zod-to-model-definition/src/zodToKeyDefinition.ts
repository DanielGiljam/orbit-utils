import type {KeyDefinition} from "@orbit/records";
import {ZodString, ZodTypeAny} from "zod";

import {ZodKey} from "./types";

export const zodToKeyDefinition = (zodSchema: ZodTypeAny): KeyDefinition => {
    if (zodSchema instanceof ZodKey) {
        return zodSchema.toKeyDefinition();
    }
    if (zodSchema instanceof ZodString) {
        return {};
    } else {
        throw new TypeError(
            `Expected key schema to be instance of ZodString, but got ${zodSchema.constructor.name}.`,
        );
    }
};
