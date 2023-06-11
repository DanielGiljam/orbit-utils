// Credit: https://github.com/type-challenges/type-challenges/issues/25070

type UnionToIntersection<T> = (T extends T ? (arg: T) => 0 : never) extends (
    arg: infer I,
) => 0
    ? I
    : never;

type LastInUnion<U> = UnionToIntersection<
    U extends U ? (arg: U) => 0 : never
> extends (arg: infer Last) => 0
    ? Last
    : never;

export type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
    ? []
    : [...UnionToTuple<Exclude<U, Last>>, Last];
