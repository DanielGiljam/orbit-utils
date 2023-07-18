import type {FulfilledResponse, RejectedResponse} from "./message";

export const respondThroughMessagePort = <T = unknown>(
    message:
        | Omit<FulfilledResponse<T>, "isOrbitMultiThreadMessage" | "type">
        | Omit<RejectedResponse, "isOrbitMultiThreadMessage" | "type">,
    port: MessagePort,
) =>
    port.postMessage({
        isOrbitMultiThreadMessage: true,
        type: "response",
        ...message,
    });
