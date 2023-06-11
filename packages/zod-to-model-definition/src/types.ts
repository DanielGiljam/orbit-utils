import type {
    AttributeDefinition,
    KeyDefinition,
    RelationshipDefinition,
} from "@orbit/records";
import {
    ParseInput,
    ParseReturnType,
    ZodAny,
    ZodArray,
    ZodEnum,
    ZodLiteral,
    ZodNullable,
    ZodObject,
    ZodString,
    ZodType,
    ZodTypeAny,
    ZodTypeDef,
} from "zod";

import {getAttributeType} from "./getAttributeType";
import {getValidationOptions} from "./getValidationOptions";
import {UnionToTuple} from "./UnionToTuple";

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////        ZodKey         //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodKeyDef<T extends ZodType<string | null | undefined>>
    extends ZodTypeDef {
    innerType: T;
    meta?: {[key: string]: unknown};
    typeName: ZodThirdPartyTypeKind.ZodKey;
}

export class ZodKey<
    T extends ZodType<string | null | undefined>,
> extends ZodType<T["_output"], ZodKeyDef<T>, T["_input"]> {
    override _parse(input: ParseInput): ParseReturnType<this["_output"]> {
        return this._def.innerType._parse(input);
    }

    meta(meta: {[key: string]: unknown}) {
        return new ZodKey({
            ...this._def,
            meta,
        });
    }

    unwrap() {
        return this._def.innerType;
    }

    toKeyDefinition(): KeyDefinition {
        return {
            validation: getValidationOptions(this._def.innerType),
            meta: this._def.meta,
        };
    }

    static create = <T extends ZodType<string | null | undefined>>(
        type?: T,
    ): ZodKey<T> => {
        return new ZodKey({
            innerType: type ?? ZodString.create().optional().nullable(),
            typeName: ZodThirdPartyTypeKind.ZodKey,
        }) as ZodKey<T>;
    };
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////     ZodAttribute      //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export interface ZodAttributeDef<T extends ZodTypeAny> extends ZodTypeDef {
    innerType: T;
    meta?: {[key: string]: unknown};
    serialization?: {[key: string]: unknown};
    deserialization?: {[key: string]: unknown};
    typeName: ZodThirdPartyTypeKind.ZodAttribute;
}

export class ZodAttribute<T extends ZodTypeAny> extends ZodType<
    T["_output"],
    ZodAttributeDef<T>,
    T["_input"]
> {
    override _parse(input: ParseInput): ParseReturnType<this["_output"]> {
        return this._def.innerType._parse(input);
    }

    meta(meta: {[key: string]: unknown}) {
        return new ZodAttribute({
            ...this._def,
            meta,
        });
    }

    serialization(serialization: {[key: string]: unknown}) {
        return new ZodAttribute({
            ...this._def,
            serialization,
        });
    }

    deserialization(deserialization: {[key: string]: unknown}) {
        return new ZodAttribute({
            ...this._def,
            deserialization,
        });
    }

    unwrap() {
        return this._def.innerType;
    }

    toAttributeDefinition(): AttributeDefinition {
        return {
            type: getAttributeType(this._def.innerType),
            validation: getValidationOptions(this._def.innerType),
            meta: this._def.meta,
            serialization: this._def.serialization,
            deserialization: this._def.deserialization,
        };
    }

    static create = <T extends ZodTypeAny>(type?: T): ZodAttribute<T> => {
        return new ZodAttribute({
            innerType: type ?? ZodAny.create(),
            typeName: ZodThirdPartyTypeKind.ZodAttribute,
        }) as ZodAttribute<T>;
    };
}

///////////////////////////////////////////
///////////////////////////////////////////
//////////                       //////////
//////////    ZodRelationship    //////////
//////////                       //////////
///////////////////////////////////////////
///////////////////////////////////////////
export type RelationshipKind = RelationshipDefinition["kind"];

export type ZodRecordType<T extends string> =
    // check if T is "just a string"
    [T | ""] extends [T]
        ? ZodString
        : // check if T is a string literal
        [T] extends UnionToTuple<T>
        ? ZodLiteral<T>
        : // ensure that UnionToTuple<T> meets the generic constraints of ZodEnum
        // (it always does, but the compiler doesn't know that)
        UnionToTuple<T> extends [string, ...string[]]
        ? ZodEnum<UnionToTuple<T>>
        : // never never happens
          never;

export type ZodRecordIdentity<T extends string> = ZodObject<{
    type: ZodRecordType<T>;
    id: ZodString;
}>;

export const createZodObjectWithShapeOfRecordIdentity = <
    T extends string | [string, ...string[]] | undefined,
>(
    type?: T,
) =>
    ZodObject.create({
        type:
            type == null
                ? ZodString.create()
                : Array.isArray(type)
                ? ZodEnum.create(type)
                : ZodLiteral.create(type),
        id: ZodString.create(),
    });

export type ZodRelationshipInnerType<
    TKind extends RelationshipKind = RelationshipKind,
    TType extends string = string,
> = ZodObject<{
    data: TKind extends "hasOne"
        ? ZodNullable<ZodRecordIdentity<TType>>
        : ZodArray<ZodRecordIdentity<TType>>;
}>;

export const createZodObjectWithShapeOfRecordRelationship = <
    TKind extends RelationshipKind,
    TType extends string | [string, ...string[]] | undefined,
>(
    kind: TKind,
    type?: TType,
) =>
    ZodObject.create({
        data:
            kind === "hasOne"
                ? ZodNullable.create(
                      createZodObjectWithShapeOfRecordIdentity(type),
                  )
                : ZodArray.create(
                      createZodObjectWithShapeOfRecordIdentity(type),
                  ),
    });

export interface ZodRelationshipDef<T extends ZodRelationshipInnerType>
    extends ZodTypeDef {
    innerType: T;
    kind: T extends ZodRelationshipInnerType<infer TKind> ? TKind : never;
    type?: T extends ZodRelationshipInnerType<infer _, infer TType>
        ? TType | [TType, ...TType[]] | undefined
        : never;
    inverse?: string;
    dependent?: "remove";
    meta?: {[key: string]: unknown};
    typeName: ZodThirdPartyTypeKind.ZodRelationship;
}

export class ZodRelationship<
    T extends ZodRelationshipInnerType,
> extends ZodType<T["_output"], ZodRelationshipDef<T>, T["_input"]> {
    override _parse(input: ParseInput): ParseReturnType<this["_output"]> {
        return this._def.innerType._parse(input);
    }

    meta(meta: {[key: string]: unknown}) {
        return new ZodRelationship({
            ...this._def,
            meta,
        });
    }

    inverse(relationshipName: string) {
        return new ZodRelationship({
            ...this._def,
            inverse: relationshipName,
        });
    }

    dependentRemove() {
        return new ZodRelationship({
            ...this._def,
            dependent: "remove",
        });
    }

    unwrap() {
        return this._def.innerType;
    }

    toRelationshipDefinition(): RelationshipDefinition {
        return {
            kind: this._def.kind,
            type: this._def.type,
            inverse: this._def.inverse,
            dependent: this._def.dependent,
            validation: getValidationOptions(this._def.innerType.shape.data),
            meta: this._def.meta,
        };
    }

    static create = <T extends ZodRelationshipInnerType>(
        kind: T extends ZodRelationshipInnerType<infer TKind> ? TKind : never,
        type?: T extends ZodRelationshipInnerType<infer _, infer TType>
            ? TType | [TType, ...TType[]] | undefined
            : never,
    ): ZodRelationship<T> => {
        return new ZodRelationship({
            innerType: createZodObjectWithShapeOfRecordRelationship(
                kind,
                type,
            ) as T,
            kind,
            type,
            typeName: ZodThirdPartyTypeKind.ZodRelationship,
        }) as ZodRelationship<T>;
    };
}

export enum ZodThirdPartyTypeKind {
    ZodKey = "ZodKey",
    ZodAttribute = "ZodAttribute",
    ZodRelationship = "ZodRelationship",
}

const zodKeyType = ZodKey.create;
const zodAttributeType = ZodAttribute.create;
const zodRelationshipType = ZodRelationship.create;

export {
    zodKeyType as key,
    zodAttributeType as attribute,
    zodRelationshipType as relationship,
};
