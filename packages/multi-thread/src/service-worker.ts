export const getServiceWorker = (timeout = 10000) =>
    new Promise<ServiceWorker>((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            navigator.serviceWorker.removeEventListener(
                "controllerchange",
                onControllerChange,
            );
            reject(
                new Error(
                    `Getting service worker timed out. It took longer than ${timeout}ms.`,
                ),
            );
        }, timeout);
        const onControllerChange = () => {
            if (navigator.serviceWorker.controller != null) {
                clearTimeout(timeoutHandle);
                navigator.serviceWorker.removeEventListener(
                    "controllerchange",
                    onControllerChange,
                );
                resolve(navigator.serviceWorker.controller);
            }
        };
        navigator.serviceWorker.addEventListener(
            "controllerchange",
            onControllerChange,
        );
        onControllerChange();
    });
