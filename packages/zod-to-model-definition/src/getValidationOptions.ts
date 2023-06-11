import type {ModelDefinition} from "@orbit/records";
import {ZodTypeAny, ZodArray} from "zod";

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
    if (includeArrayValidationOptions && type instanceof ZodArray) {
        validationOptions["minItems"] = type._def.minLength;
        validationOptions["maxItems"] = type._def.maxLength;
    }
    return validationOptions;
};
