import {ZodTypeAny, ZodArray} from "zod";

import {RelationshipKind} from "./types";
import {unwrapType} from "./unwrapType";

export const getRelationshipKind = (type: ZodTypeAny): RelationshipKind => {
    type = unwrapType(type);
    if (type instanceof ZodArray) {
        return "hasMany";
    } else {
        return "hasOne";
    }
};
