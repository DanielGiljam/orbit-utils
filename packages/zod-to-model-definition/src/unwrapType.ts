import {ZodBranded, ZodNullable, ZodOptional, ZodTypeAny} from "zod";

export const unwrapType = (type: ZodTypeAny): ZodTypeAny => {
    let unwrappedType = type;
    while (
        unwrappedType instanceof ZodOptional ||
        unwrappedType instanceof ZodNullable ||
        unwrappedType instanceof ZodBranded
    ) {
        unwrappedType = unwrappedType.unwrap();
    }
    return unwrappedType;
};
