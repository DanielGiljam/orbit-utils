import {
    ZodTypeAny,
    ZodArray,
    ZodBoolean,
    ZodDate,
    ZodNumber,
    ZodObject,
    ZodString,
    ZodEnum,
    ZodBigInt,
    ZodTuple,
    ZodRecord,
    ZodMap,
    ZodSet,
    ZodNaN,
} from "zod";

import {unwrapType} from "./unwrapType";

// TODO: document how this type resolving works

export const getAttributeType = (type: ZodTypeAny): string | undefined => {
    type = unwrapType(type);
    if (type instanceof ZodArray || type instanceof ZodTuple) {
        return "array";
    }
    if (type instanceof ZodBoolean) {
        return "boolean";
    }
    if (type instanceof ZodDate) {
        return "datetime";
    }
    if (
        type instanceof ZodNumber ||
        // TODO: can BigInt be treated as number?
        type instanceof ZodBigInt ||
        type instanceof ZodNaN
    ) {
        return "number";
    }
    if (
        type instanceof ZodObject ||
        type instanceof ZodRecord ||
        type instanceof ZodMap ||
        type instanceof ZodSet
    ) {
        // TODO: perhaps add warning about using Map and Set? (That it probably won't serialize as expected.)
        return "object";
    }
    if (type instanceof ZodString || type instanceof ZodEnum) {
        return "string";
    }
    // TODO: perhaps add warning about using Symbol, Promise, native enum and/or Function?
    // That it probably won't serialize as expected and that the attribute definition type
    // will be `undefined`. Perhaps also check union, discriminated union and intersection types
    // for these types in order to warn?
    return undefined;
};
