import Coordinator from "@orbit/coordinator";

import {UnknownException} from "./exception";
import {messageValuePropTypeMap} from "./message";
import type {QueryRequest, UpdateRequest} from "./message";
import {respondThroughMessagePort} from "./respond-through-message-port";

declare global {
    interface ServiceWorkerGlobalScope {
        coordinator: Coordinator | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

export interface SetupMessageListenerParameters {
    /**
     * Function which creates a new `Coordinator` instance
     * along with new instances of all the things it "coordinates".
     */
    createCoordinator: () => Promise<Coordinator>;
    /**
     * The name of the source which will be acted upon.
     */
    target: string;
}

export const setupMessageListener = ({
    createCoordinator,
    target,
}: SetupMessageListenerParameters) => {
    const getCoordinator = async () => {
        const coordinator = (self.coordinator ??= await createCoordinator());
        await coordinator.activated;
        return coordinator;
    };
    const handleMessage = async (
        message: QueryRequest | UpdateRequest,
        port: MessagePort,
    ) => {
        try {
            const coordinator = await getCoordinator();
            respondThroughMessagePort(
                {
                    status: "fulfilled",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value: await (coordinator.getSource(target) as any)[
                        message.type
                    ](message[messageValuePropTypeMap[message.type] as never]),
                },
                port,
            );
        } catch (error) {
            respondThroughMessagePort(
                {
                    status: "rejected",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    reason:
                        error instanceof Error
                            ? error
                            : new UnknownException(error),
                },
                port,
            );
        }
    };
    self.addEventListener("message", (event) => {
        if (event.data.isOrbitMultiThreadMessage === true) {
            void event.waitUntil(handleMessage(event.data, event.ports[0]));
        }
    });
};
