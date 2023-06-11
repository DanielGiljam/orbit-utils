// Credit: https://github.com/type-challenges/type-challenges/issues/22792

export type IsUnion<T, Copy = T> = [T] extends [never]
    ? false
    : T extends never
    ? false
    : [Copy] extends [T]
    ? false
    : true;
