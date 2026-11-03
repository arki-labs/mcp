import type { AnyContractRouter, ContractProcedure, ContractRouterClient, ErrorMap, InferSchemaInput, InferSchemaOutput } from '@orpc/contract';
import type { Failure, RevivalFailure } from '@arki/failure';
import { RPC_FAILURE_DEFINITION } from '@arki/failure/orpc';
import type { McpMeta } from './contract.js';
import type { McpTool, ToolCall } from './tool.js';
/** Access refused. @fix Supply the required principal, roles and scopes. @verify bun run test -- src/orpc.test.ts */
export declare const Forbidden: import("@arki/failure").FailureDefinition<"mcp.forbidden", undefined>;
/** Approval absent. @fix Verify approval through the host authority. @verify bun run test -- src/orpc.test.ts */
export declare const ApprovalRequired: import("@arki/failure").FailureDefinition<"mcp.approval_required", undefined>;
/** Native input validation refused the call. @fix Correct the tool arguments. @verify bun run test -- src/orpc.test.ts */
export declare const InvalidInput: import("@arki/failure").FailureDefinition<"mcp.invalid_input", undefined>;
/** Invocation cancelled. @fix Start a new invocation when still needed. @verify bun run test -- src/orpc.test.ts */
export declare const Cancelled: import("@arki/failure").FailureDefinition<"mcp.cancelled", undefined>;
export declare const ADAPTER_FAILURES: readonly [import("@arki/failure").FailureDefinition<"mcp.forbidden", undefined>, import("@arki/failure").FailureDefinition<"mcp.approval_required", undefined>, import("@arki/failure").FailureDefinition<"mcp.invalid_input", undefined>, import("@arki/failure").FailureDefinition<"mcp.cancelled", undefined>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>];
type AdapterFailure = ReturnType<(typeof ADAPTER_FAILURES)[number]> | RevivalFailure;
export type Snake<Name extends string> = Name extends `${infer First}${infer Rest}` ? `${First extends Lowercase<First> ? First : `_${Lowercase<First>}`}${Snake<Rest>}` : '';
type NormalizePrefix<Name extends string> = Name extends `${infer Before}.${infer After}` ? NormalizePrefix<`${Before}_${After}`> : Name extends `${infer Before}#${infer After}` ? NormalizePrefix<`${Before}_${After}`> : Lowercase<Name>;
type ToolKey<Prefix extends string, Key extends string, M extends McpMeta> = M extends {
    name: infer Name extends string;
} ? Name : `${NormalizePrefix<Prefix>}_${Snake<Key>}`;
type MapFailure<E extends ErrorMap> = E[keyof E] extends infer Entry ? Entry extends {
    readonly [RPC_FAILURE_DEFINITION]: infer Definition;
} ? Definition extends (...args: never[]) => infer F ? F extends Failure ? F : never : never : never : never;
type LeafTools<Prefix extends string, Key extends string, Value> = Value extends ContractProcedure<infer I, infer O, infer E, infer M> ? M extends {
    mcp: infer Policy extends McpMeta;
} ? Policy extends {
    hidden: true;
} ? Record<never, never> : Record<ToolKey<Prefix, Key, Policy>, McpTool<InferSchemaInput<I>, InferSchemaOutput<O>, MapFailure<E> | AdapterFailure>> : Record<never, never> : Value extends object ? RpcTools<Prefix, Value> : Record<never, never>;
type Intersect<Union> = (Union extends unknown ? (value: Union) => void : never) extends (value: infer Value) => void ? Value : never;
export type RpcTools<Prefix extends string, Contract extends object> = Intersect<{
    [Key in keyof Contract & string]: LeafTools<Prefix, Key, Contract[Key]>;
}[keyof Contract & string]>;
type NoncanonicalErrors<E extends ErrorMap> = {
    [Code in keyof E]: E[Code] extends {
        readonly [RPC_FAILURE_DEFINITION]: infer Definition;
    } ? Definition extends ((...args: never[]) => Failure) & {
        readonly code: Code;
    } ? never : Code : Code;
}[keyof E];
type NoncanonicalLeaves<C extends object> = {
    [Key in keyof C]: C[Key] extends ContractProcedure<infer _I, infer _O, infer E, infer M> ? M extends {
        mcp: infer Policy extends McpMeta;
    } ? Policy extends {
        hidden: true;
    } ? never : NoncanonicalErrors<E> extends never ? never : Key : never : C[Key] extends object ? NoncanonicalLeaves<C[Key]> extends never ? never : Key : never;
}[keyof C];
type CanonicalErrorsGuard<C extends object> = NoncanonicalLeaves<C> extends never ? unknown : {
    readonly 'MCP: executable errors require canonical failure definitions': NoncanonicalLeaves<C>;
};
type Options<C extends AnyContractRouter> = {
    readonly prefix?: string;
    /** Invoke the gateway client, preserving root and procedure middleware. */
    readonly client: (call: ToolCall) => ContractRouterClient<C>;
    /** Child router mounts are owned by the child's adapter. */
    readonly mountedPaths?: readonly (readonly string[])[];
};
export declare function fromRpc<const Feature extends string, C extends AnyContractRouter>(entry: {
    readonly feature: Feature;
    readonly contract: C;
    readonly router: unknown;
} & CanonicalErrorsGuard<NoInfer<C>>, options: Options<NoInfer<C>> & {
    readonly prefix?: undefined;
}): RpcTools<Feature, C>;
export declare function fromRpc<const Prefix extends string, C extends AnyContractRouter>(entry: {
    readonly feature: string;
    readonly contract: C;
    readonly router: unknown;
} & CanonicalErrorsGuard<NoInfer<C>>, options: Options<NoInfer<C>> & {
    readonly prefix: Prefix;
}): RpcTools<Prefix, C>;
export { ResultTooLarge, InvalidResult } from './result.js';
//# sourceMappingURL=orpc.d.ts.map