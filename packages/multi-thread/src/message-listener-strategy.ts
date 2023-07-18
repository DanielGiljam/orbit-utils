import {Orbit} from "@orbit/core";
import {Strategy} from "@orbit/coordinator";
import type {
    Coordinator,
    ActivationOptions,
    StrategyOptions,
} from "@orbit/coordinator";
import type {Source} from "@orbit/data";

import {UnknownException} from "./exception";
import {messageValuePropTypeMap} from "./message";
import type {QueryRequest, UpdateRequest} from "./message";
import {respondThroughMessagePort} from "./respond-through-message-port";

const {assert, globals} = Orbit;

export interface MessageListenerStrategyOptions extends StrategyOptions {
    /**
     * The name of the source which will be acted upon.
     */
    target: string;
}

export class MessageListenerStrategy extends Strategy {
    protected readonly _onMessage = (
        event: ExtendableMessageEvent | MessageEvent,
    ) => {
        if (event.data.isOrbitMultiThreadMessage === true) {
            if ("waitUntil" in event) {
                void event.waitUntil(
                    this._handleMessage(event.data, event.ports[0]),
                );
            } else {
                void this._handleMessage(event.data, event.ports[0]);
            }
        }
    };

    constructor(options: MessageListenerStrategyOptions) {
        assert(
            "A `target` must be specified for a MessageListenerStrategy",
            !!options.target,
        );
        assert(
            "`target` should be a Source name specified as a string",
            typeof options.target === "string",
        );
        options.sources = [options.target];
        options.name = options.name || `onmessage -> ${options.target}`;
        super(options);
    }

    get target(): Source {
        return this._sources[0];
    }

    override async activate(
        coordinator: Coordinator,
        options: ActivationOptions = {},
    ): Promise<void> {
        await super.activate(coordinator, options);
        globals.addEventListener("message", this._onMessage);
    }

    override async deactivate(): Promise<void> {
        await super.deactivate();
        globals.removeEventListener("message", this._onMessage);
    }

    protected async _handleMessage(
        message: QueryRequest | UpdateRequest,
        port: MessagePort,
    ): Promise<void> {
        try {
            respondThroughMessagePort(
                {
                    status: "fulfilled",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value: await (this.target as any)[message.type](
                        message[messageValuePropTypeMap[message.type] as never],
                    ),
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
    }
}
