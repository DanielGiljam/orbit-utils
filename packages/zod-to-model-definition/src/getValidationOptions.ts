import type {ModelDefinition} from "@orbit/records";
import {ZodTypeAny, ZodArray} from "zod";

import {unwrapType} from "./unwrapType";

type ValidationOptions = Required<
    Required<ModelDefinition>[keyof ModelDefinition][string]["validation"]
>;

export const getValidationOptions = (
    type: ZodTypeAny,
    includeArrayValidationOptions = false,
): ValidationOptions => {
    const validationOptions: ValidationOptions = {
        required: !type.isOptional(),
        notNull: !type.isNullable(),
    };
    if (includeArrayValidationOptions) {
        type = unwrapType(type);
        if (type instanceof ZodArray) {
            validationOptions["minItems"] = type._def.minLength;
            validationOptions["maxItems"] = type._def.maxLength;
        }
    }
    return validationOptions;
};
