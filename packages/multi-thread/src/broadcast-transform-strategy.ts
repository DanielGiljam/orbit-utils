import {Orbit} from "@orbit/core";
import {Strategy} from "@orbit/coordinator";
import type {
    Coordinator,
    ActivationOptions,
    StrategyOptions,
} from "@orbit/coordinator";
import type {Source} from "@orbit/data";
import type {RecordTransform} from "@orbit/records";

const {assert} = Orbit;

export interface BroadcastTransformStrategyOptions extends StrategyOptions {
    /**
     * The name of the source to be observed.
     */
    source: string;
    /**
     * The name of the broadcast channel.
     */
    broadcastChannelName: string;
}

export class BroadcastTransformStrategy extends Strategy {
    protected _broadcastChannel: BroadcastChannel | undefined;
    protected readonly _broadcastChannelName: string;
    protected readonly _onTransform = (transform: RecordTransform) =>
        this._broadcastChannel!.postMessage(transform);

    constructor(options: BroadcastTransformStrategyOptions) {
        assert(
            "Your browser does not support BroadcastChannel API!",
            typeof BroadcastChannel === "function",
        );
        assert(
            "A `source` must be specified for a BroadcastTransformStrategy",
            !!options.source,
        );
        assert(
            "`source` should be a Source name specified as a string",
            typeof options.source === "string",
        );
        assert(
            "The name of the BroadcastChannel must be specified for a BroadcastTransformStrategy",
            !!options.broadcastChannelName,
        );
        assert(
            "The name of the BroadcastChannel should be specified as a string",
            typeof options.broadcastChannelName === "string",
        );
        options.sources = [options.source];
        options.name =
            options.name || `${options.source}:transform -> broadcast`;
        super(options);
        this._broadcastChannelName = options.broadcastChannelName;
    }

    get source(): Source {
        return this._sources[0];
    }

    override async activate(
        coordinator: Coordinator,
        options: ActivationOptions = {},
    ): Promise<void> {
        await super.activate(coordinator, options);
        this._broadcastChannel = new BroadcastChannel(
            this._broadcastChannelName,
        );
        this.source.on("transform", this._onTransform);
    }

    override async deactivate(): Promise<void> {
        this.source.off("transform", this._onTransform);
        this._broadcastChannel?.close();
        await super.deactivate();
    }
}
