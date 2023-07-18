import {MessageException} from "./exception";
import type {QueryRequest, UpdateRequest} from "./message";

export const requestWithPostMessage = <T = unknown>(
    message:
        | Omit<QueryRequest, "isOrbitMultiThreadMessage">
        | Omit<UpdateRequest, "isOrbitMultiThreadMessage">,
    recipient: Pick<MessagePort, "postMessage">,
    recipientName = "recipient",
    timeout = 10000,
) =>
    new Promise<T>((resolve, reject) => {
        const {port1, port2} = new MessageChannel();
        const timeoutHandle = setTimeout(() => {
            port1.close();
            reject(
                new MessageException(
                    `Message timed out. Response took longer than ${timeout}ms.`,
                ),
            );
        }, timeout);
        port1.addEventListener("message", (event) => {
            clearTimeout(timeoutHandle);
            port1.close();
            if (event.data.isOrbitMultiThreadMessage === true) {
                if (event.data.status === "fulfilled") {
                    resolve(event.data.value);
                    return;
                } else if (event.data.status === "rejected") {
                    reject(
                        new MessageException(
                            `Error response from ${recipientName}: ${event.data.reason.message}.`,
                            event.data,
                        ),
                    );
                    return;
                }
            }
            reject(
                new MessageException(
                    `Unexpected response from ${recipientName}.`,
                    event.data,
                ),
            );
        });
        recipient.postMessage({isOrbitMultiThreadMessage: true, ...message}, [
            port2,
        ]);
    });
