import type {RecordQuery, RecordTransform} from "@orbit/records";

export interface Message {
    isOrbitMultiThreadMessage: true;
    type: "query" | "update" | "response" | "transform";
}

export interface QueryRequest extends Message {
    type: "query";
    query: RecordQuery;
}

export interface UpdateRequest extends Message {
    type: "update";
    transform: RecordTransform;
}

export const messageValuePropTypeMap = {
    query: "query",
    update: "transform",
} as const;

export interface ResponseMessage extends Message {
    type: "response";
    status: "fulfilled" | "rejected";
}

export interface FulfilledResponse<T> extends ResponseMessage {
    status: "fulfilled";
    value: T;
}

export interface RejectedResponse extends ResponseMessage {
    status: "rejected";
    reason: Error;
}

export interface TransformMessage extends Message {
    type: "transform";
    transform: RecordTransform;
}
