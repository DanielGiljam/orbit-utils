import {
    ZodBranded,
    ZodCatch,
    ZodDefault,
    ZodEffects,
    ZodLazy,
    ZodNullable,
    ZodOptional,
    ZodPipeline,
    ZodTypeAny,
} from "zod";

// TODO: write this function better

export const unwrapType = (type: ZodTypeAny): ZodTypeAny => {
    let unwrappedType = type;
    while (
        unwrappedType instanceof ZodOptional ||
        unwrappedType instanceof ZodNullable ||
        unwrappedType instanceof ZodBranded ||
        unwrappedType instanceof ZodLazy ||
        unwrappedType instanceof ZodEffects ||
        unwrappedType instanceof ZodDefault ||
        unwrappedType instanceof ZodCatch ||
        unwrappedType instanceof ZodPipeline
    ) {
        unwrappedType =
            unwrappedType instanceof ZodPipeline
                ? unwrappedType._def.out
                : unwrappedType instanceof ZodCatch
                ? unwrappedType.removeCatch()
                : unwrappedType instanceof ZodDefault
                ? unwrappedType.removeDefault()
                : unwrappedType instanceof ZodEffects
                ? unwrappedType.sourceType()
                : unwrappedType instanceof ZodLazy
                ? unwrappedType.schema
                : unwrappedType.unwrap();
    }
    return unwrappedType;
};
