# `@orbit-utils/zod-to-model-definition`

Define your [`RecordSchema`](https://orbitjs.com/docs/modeling-data#schema) using [Zod](https://zod.dev/).

Before:

```ts
const planetModelDefinition = {
    attributes: {
        name: {type: "string"},
        classification: {type: "string"},
        atmosphere: {type: "boolean"},
        mass: {type: "number"},
    },
    relationships: {
        solarSystem: {kind: "hasOne", type: "solarSystem", inverse: "planets"},
        moons: {kind: "hasMany", type: "moon", inverse: "planet"},
    },
};
```

After:

```ts
import {m, zodToModelDefinition} from "@orbit-utils/zod-to-model-definition";
import {z} from "zod";

const planetZodSchema = z.object({
    type: z.literal("planet"),
    id: z.string().optional(),
    attributes: z.object({
        name: z.string(),
        classification: z.enum(["terrestrial", "gaseous"]),
        atmosphere: z.boolean(),
        mass: z.number().positive().finite(),
    }),
    relationships: z.object({
        solarSystem: m.relationship("hasOne", "solarSystem").inverse("planets"),
        moons: m.relationship("hasMany", "moon").inverse("planet"),
    }),
});
const planetModelDefinition = zodToModelDefinition(planetZodSchema);
```

## Usage

Install using your preferred Node.js package manager. For example:

```sh
pnpm add @orbit-utils/zod-to-model-definition
```

Import and enjoy!

```ts
import {zodToModelDefinition} from "@orbit-utils/zod-to-model-definition";
```

For facilitating special model definition attributes (such as `inverse`, `dependent: "delete"` and `meta`) in your Zod schema, the library provides custom `ZodType`s through `m`:

```ts
import {m} from "@orbit-utils/zod-to-model-definition";

m.relationship("hasOne", "solarSystem").inverse("planets");
m.relationship("hasMany", "moon").inverse("planet");
m.attribute(z.number().positive().finite()).definitionMeta({unit: "kg"});
```

## Advantages of using Zod to define your `RecordSchema`

-   You can infer TypeScript types from your Zod schema.
    ```ts
    type Planet = z.infer<typeof planetZodSchema>;
    // same as…
    interface Planet extends UninitializedRecord {
        type: "planet";
        ...
    }
    // …except you don't have to maintain separate interface definitions
    ```
-   Zod allows for a more granular schema definition (more granular types, more granular validation).
    ```ts
    classification: {
        type: "string";
    }
    vs.z.enum(["terrestrial", "gaseous"]);
    mass: {
        type: "number";
    }
    vs.z.number().positive().finite();
    ```
    -   You can configure Orbit to use Zod's validation instead of its own with [`validateFor`](https://orbitjs.com/docs/api/records/interfaces/RecordSourceSettings#validatorfor).

## Additional features

-   Maps [`.optional()`](https://zod.dev/?id=optional) to [`validation.required: false`](https://orbitjs.com/docs/api/records/interfaces/FieldValidationOptions#required) and [`.nullable()`](https://zod.dev/?id=nullable) to [`validation.notNull: false`](https://orbitjs.com/docs/api/records/interfaces/AttributeDefinition#validation).

## API reference

### `zodToModelDefinition`

```ts
import type {ModelDefinition} from "@orbit/records";
import type {AnyZodObject} from "zod";

export function zodToModelDefinition(zodSchema: AnyZodObject): ModelDefinition;
```

### `ZodKey`

Extends [`ZodType`](https://github.com/colinhacks/zod/blob/v3.21.4/src/types.ts#L154).

Zod schema counterpart for [`KeyDefinition`](https://orbitjs.com/docs/api/records/interfaces/KeyDefinition).

Can be created by calling `m.key`.

```ts
import type {ZodType} from "zod";

export function key(zodType?: ZodType<string>): ZodKey;
```

#### `.definitionMeta`

```ts
ZodKey.definitionMeta: (definitionMeta: {[key: string]: unknown}) => ZodKey
```

### `ZodAttribute`

Extends [`ZodType`](https://github.com/colinhacks/zod/blob/v3.21.4/src/types.ts#L154).

Zod schema counterpart for [`AttributeDefinition`](https://orbitjs.com/docs/api/records/interfaces/AttributeDefinition).

Can be created by calling `m.attribute`.

```ts
import type {ZodTypeAny} from "zod";

export function attribute(zodType?: ZodTypeAny): ZodAttribute;
```

#### `.definitionMeta`

```ts
ZodAttribute.definitionMeta: (definitionMeta: {[key: string]: unknown}) => ZodAttribute
```

#### `.serialization`

```ts
ZodAttribute.serialization: (serialization: {[key: string]: unknown}) => ZodAttribute
```

#### `.deserialization`

```ts
ZodAttribute.deserialization: (deserialization: {[key: string]: unknown}) => ZodAttribute
```

### `ZodRelationship`

Extends [`ZodType`](https://github.com/colinhacks/zod/blob/v3.21.4/src/types.ts#L154).

Zod schema counterpart for [`RelationshipDefinition`](https://orbitjs.com/docs/api/records/modules#relationshipdefinition).

Can be created by calling `m.relationship`.

```ts
import type {ZodTypeAny} from "zod";

export function relationship(
    kind: "hasOne" | "hasMany",
    type?: string | string[],
): ZodRelationship;
```

#### `.definitionMeta`

```ts
ZodRelationship.definitionMeta: (definitionMeta: {[key: string]: unknown}) => ZodRelationship
```

#### `.inverse`

```ts
ZodRelationship.inverse: (relationshipName: string) => ZodRelationship
```

#### `.dependentRemove`

```ts
ZodRelationship.dependentRemove: () => ZodRelationship
```

#### `.links`

Schema for the `links` object that can appear on your record. (See [`RecordRelationship`](https://orbitjs.com/docs/api/records/modules#recordrelationship).)

```ts
import type {Link} from "@orbit/records";
import type {ZodType} from "zod";

ZodRelationship.links: (schema: ZodType<{[key: string]: Link} | undefined>) => ZodRelationship
```

#### `.meta`

Schema for the `meta` object that can appear on your record. (See [`RecordRelationship`](https://orbitjs.com/docs/api/records/modules#recordrelationship).)

```ts
import type {ZodType} from "zod";

ZodRelationship.meta: (schema: ZodType<{[key: string]: unknown} | undefined>) => ZodRelationship
```
