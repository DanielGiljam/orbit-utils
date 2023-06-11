import {
    ZodTypeAny,
    ZodArray,
    ZodBoolean,
    ZodDate,
    ZodNumber,
    ZodObject,
    ZodString,
} from "zod";

export const getAttributeType = (type: ZodTypeAny): string | undefined => {
    if (type instanceof ZodArray) {
        return "array";
    }
    if (type instanceof ZodBoolean) {
        return "boolean";
    }
    if (type instanceof ZodDate) {
        return "datetime";
    }
    if (type instanceof ZodDate) {
        return "datetime";
    }
    if (type instanceof ZodNumber) {
        return "number";
    }
    if (type instanceof ZodObject) {
        return "object";
    }
    if (type instanceof ZodString) {
        return "string";
    }
    return undefined;
};
