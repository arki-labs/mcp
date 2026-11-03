import { z } from 'zod';
/**
 * The policy a contract procedure carries in `meta.mcp`, checked when a router is turned into
 * tools. The type test in `policy.test-d.ts` locks this schema to `McpMeta` in both directions.
 */
export declare const mcpPolicySchema: z.ZodDiscriminatedUnion<[z.ZodReadonly<z.ZodObject<{
    description: z.ZodString;
    access: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"user">, z.ZodObject<{
        roles: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
        scopes: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>]>;
    name: z.ZodOptional<z.ZodCustom<`${Lowercase<string>}_${string}`, `${Lowercase<string>}_${string}`>>;
    idempotent: z.ZodOptional<z.ZodBoolean>;
    openWorld: z.ZodOptional<z.ZodBoolean>;
    budget: z.ZodOptional<z.ZodReadonly<z.ZodObject<{
        maxChars: z.ZodNumber;
    }, z.core.$strip>>>;
    remediation: z.ZodOptional<z.ZodReadonly<z.ZodRecord<z.ZodString, z.ZodString>>>;
    hidden: z.ZodOptional<z.ZodLiteral<true>>;
    effect: z.ZodLiteral<"read">;
}, z.core.$strip>>, z.ZodReadonly<z.ZodObject<{
    description: z.ZodString;
    access: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"user">, z.ZodObject<{
        roles: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
        scopes: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>]>;
    name: z.ZodOptional<z.ZodCustom<`${Lowercase<string>}_${string}`, `${Lowercase<string>}_${string}`>>;
    idempotent: z.ZodOptional<z.ZodBoolean>;
    openWorld: z.ZodOptional<z.ZodBoolean>;
    budget: z.ZodOptional<z.ZodReadonly<z.ZodObject<{
        maxChars: z.ZodNumber;
    }, z.core.$strip>>>;
    remediation: z.ZodOptional<z.ZodReadonly<z.ZodRecord<z.ZodString, z.ZodString>>>;
    hidden: z.ZodOptional<z.ZodLiteral<true>>;
    effect: z.ZodLiteral<"write">;
}, z.core.$strip>>, z.ZodReadonly<z.ZodObject<{
    description: z.ZodString;
    access: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"user">, z.ZodObject<{
        roles: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
        scopes: z.ZodOptional<z.ZodReadonly<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>]>;
    name: z.ZodOptional<z.ZodCustom<`${Lowercase<string>}_${string}`, `${Lowercase<string>}_${string}`>>;
    idempotent: z.ZodOptional<z.ZodBoolean>;
    openWorld: z.ZodOptional<z.ZodBoolean>;
    budget: z.ZodOptional<z.ZodReadonly<z.ZodObject<{
        maxChars: z.ZodNumber;
    }, z.core.$strip>>>;
    remediation: z.ZodOptional<z.ZodReadonly<z.ZodRecord<z.ZodString, z.ZodString>>>;
    hidden: z.ZodOptional<z.ZodLiteral<true>>;
    effect: z.ZodLiteral<"destructive">;
    confirm: z.ZodUnion<readonly [z.ZodLiteral<"elicit">, z.ZodReadonly<z.ZodObject<{
        none: z.ZodString;
    }, z.core.$strip>>]>;
}, z.core.$strip>>], "effect">;
//# sourceMappingURL=policy.d.ts.map