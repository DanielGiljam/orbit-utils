import {Exception, Orbit} from "@orbit/core";
import {queryable, updatable} from "@orbit/data";
import type {FullResponse, RequestOptions} from "@orbit/data";
import {RecordSource} from "@orbit/records";
import type {
    RecordOperation,
    RecordQuery,
    RecordQueryable,
    RecordQueryBuilder,
    RecordQueryResult,
    RecordSourceQueryOptions,
    RecordSourceSettings,
    RecordTransform,
    RecordTransformBuilder,
    RecordTransformResult,
    RecordUpdatable,
} from "@orbit/records";

import {serviceWorkerClientSyncBroadcastChannelName} from "./constants";
import {getServiceWorker} from "./get-service-worker";
import {requestWithPostMessage} from "./request-with-post-message";

const {assert, globals} = Orbit;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceWorkerSourceSettings<
    QO extends RequestOptions = RecordSourceQueryOptions,
    TO extends RequestOptions = RequestOptions,
    QB = RecordQueryBuilder,
    TB = RecordTransformBuilder,
> extends RecordSourceSettings<QO, TO, QB, TB> {
    getServiceWorkerTimeout?: number;
    requestWithPostMessageTimeout?: number;
}

const recipientName = "service worker";

export interface ServiceWorkerSource<
    QO extends RequestOptions = RecordSourceQueryOptions,
    TO extends RequestOptions = RequestOptions,
    QB = RecordQueryBuilder,
    TB = RecordTransformBuilder,
    QRD = unknown,
    TRD = unknown,
> extends RecordSource<QO, TO, QB, TB>,
        RecordQueryable<QRD, QB, QO>,
        RecordUpdatable<TRD, TB, TO> {}

/**
 Source for relaying requests to and staying in sync with a ClientStrategy in a service worker.

 @class ServiceWorkerSource
 @extends Source
 */
@queryable
@updatable
export class ServiceWorkerSource<
        QO extends RequestOptions = RecordSourceQueryOptions,
        TO extends RequestOptions = RequestOptions,
        QB = RecordQueryBuilder,
        TB = RecordTransformBuilder,
        QRD = unknown,
        TRD = unknown,
    >
    extends RecordSource<QO, TO, QB, TB>
    implements RecordQueryable<QRD, QB, QO>, RecordUpdatable<TRD, TB, TO>
{
    protected readonly _sw: {
        ref: ServiceWorker | null;
        onControllerChange: () => void;
    } = {
        ref: globals.navigator.serviceWorker.controller,
        onControllerChange: () => {
            if (globals.navigator.serviceWorker.controller != null) {
                this._sw.ref = globals.navigator.serviceWorker.controller;
            }
        },
    };
    protected readonly _bc: {
        ref: BroadcastChannel | null;
        onMessage: (event: MessageEvent) => void;
    } = {
        ref: null,
        onMessage: (event: MessageEvent) => {
            const transform = event.data as RecordTransform;
            if (!this.transformLog.contains(transform.id)) {
                void this.transformed([transform]);
            }
        },
    };
    protected readonly _getServiceWorkerTimeout: number | undefined;
    protected readonly _requestWithPostMessageTimeout: number | undefined;

    constructor(settings: ServiceWorkerSourceSettings<QO, TO, QB, TB>) {
        assert(
            "This is not a web browser main thread!",
            typeof window !== "undefined",
        );
        assert(
            "Your browser does not support Service Worker!",
            "serviceWorker" in globals.navigator,
        );
        assert(
            "Your browser does not support BroadcastChannel API!",
            typeof BroadcastChannel === "function",
        );

        settings.name = settings.name ?? "serviceWorker";

        super(settings);

        this._getServiceWorkerTimeout = settings.getServiceWorkerTimeout;
        this._requestWithPostMessageTimeout =
            settings.requestWithPostMessageTimeout;
    }

    protected get _serviceWorker() {
        if (this._sw.ref == null) {
            throw new Exception("Invariant: service worker is null.");
        }
        return this._sw.ref;
    }

    protected get _broadcastChannel() {
        if (this._bc.ref == null) {
            throw new Exception("Invariant: broadcast channel is null.");
        }
        return this._bc.ref;
    }

    override async activate(): Promise<void> {
        this._sw.ref = await getServiceWorker(this._getServiceWorkerTimeout);
        globals.navigator.serviceWorker.addEventListener(
            "controllerchange",
            this._sw.onControllerChange,
        );
        const broadcastChannel = (this._bc.ref = new BroadcastChannel(
            serviceWorkerClientSyncBroadcastChannelName,
        ));
        broadcastChannel.addEventListener("message", this._bc.onMessage);
        await super.activate();
    }

    override async deactivate(): Promise<void> {
        await super.deactivate();
        this._broadcastChannel.close();
        globals.navigator.serviceWorker.removeEventListener(
            "controllerchange",
            this._sw.onControllerChange,
        );
    }

    /////////////////////////////////////////////////////////////////////////////
    // Queryable interface implementation
    /////////////////////////////////////////////////////////////////////////////

    async _query(
        query: RecordQuery,
    ): Promise<FullResponse<RecordQueryResult, QRD, RecordOperation>> {
        return await requestWithPostMessage(
            {
                type: "query",
                query,
            },
            this._serviceWorker,
            recipientName,
            this._requestWithPostMessageTimeout,
        );
    }

    /////////////////////////////////////////////////////////////////////////////
    // Updatable interface implementation
    /////////////////////////////////////////////////////////////////////////////

    async _update(
        transform: RecordTransform,
    ): Promise<FullResponse<RecordTransformResult, TRD, RecordOperation>> {
        return await requestWithPostMessage(
            {
                type: "update",
                transform,
            },
            this._serviceWorker,
            recipientName,
            this._requestWithPostMessageTimeout,
        );
    }
}
