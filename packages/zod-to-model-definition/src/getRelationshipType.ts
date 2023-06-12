import {ZodTypeAny, ZodArray, ZodObject, ZodLiteral, ZodEnum} from "zod";

import {unwrapType} from "./unwrapType";

export const getRelationshipType = (
    type: ZodTypeAny,
): string | string[] | undefined => {
    type = unwrapType(type);
    if (type instanceof ZodArray) {
        type = type.element as ZodTypeAny;
    }
    if (type instanceof ZodObject) {
        const finalType = type.shape.type as ZodTypeAny | undefined;
        if (finalType != null) {
            if (finalType instanceof ZodEnum) {
                return finalType.options;
            }
            if (finalType instanceof ZodLiteral) {
                const literalValue = finalType.value;
                if (typeof literalValue === "string") {
                    return literalValue;
                }
                throw new TypeError(
                    `Expected literal value to be of type string, but got ${typeof literalValue}.`,
                );
            }
            throw new TypeError(
                `Expected property \`type\` of unwrapped relationship data type to be instance of ZodLiteral or ZodEnum, but got ${type.constructor.name}.`,
            );
        }
        return undefined;
    }
    throw new TypeError(
        `Expected unwrapped relationship data type to be instance of ZodObject, but got ${type.constructor.name}.`,
    );
};
