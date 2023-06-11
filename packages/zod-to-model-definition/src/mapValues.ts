/**
 * Similar to Lodash's `mapValues` function, but with better types and
 * specifically tailored to this library's use cases.
 *
 * @param object The object to iterate over.
 * @param mapFn The function invoked per iteration.
 * @returns Returns the new mapped object.
 */
export const mapValues = <
    TObject extends {[key: string]: unknown},
    TMapFn extends (
        value: TObject[keyof TObject],
        key: keyof TObject,
        object: TObject,
    ) => unknown,
>(
    object: TObject,
    mapFn: TMapFn,
) =>
    Object.fromEntries(
        Object.entries(object).map(([key, value]) => [
            key,
            mapFn(value as never, key, object),
        ]),
    ) as {[K in keyof TObject]: ReturnType<TMapFn>};
