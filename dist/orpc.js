import { ORPCError } from '@orpc/client';
import { getEventIteratorSchemaDetails, isContractProcedure } from '@orpc/contract';
import { defineFailure, isFailure, UnexpectedDefect } from '@arki/failure';
import { reviveRpcError, RPC_FAILURE_DEFINITION, rpcFailureDefinitions } from '@arki/failure/orpc';
import { getLogger } from '@arki/log';
import { parse } from '@arki/schema';
import { mcpPolicySchema } from './policy.js';
import { toolResult } from './result.js';
/** Access refused. @fix Supply the required principal, roles and scopes. @verify bun run test -- src/orpc.test.ts */
export const Forbidden = defineFailure('mcp.forbidden', {
    status: 403,
    message: 'This principal cannot call the tool.',
    remediation: 'Use a principal with the required access.',
});
/** Approval absent. @fix Verify approval through the host authority. @verify bun run test -- src/orpc.test.ts */
export const ApprovalRequired = defineFailure('mcp.approval_required', {
    status: 403,
    message: 'The tool requires approval.',
    remediation: 'Obtain approval through the host and retry.',
});
/** Native input validation refused the call. @fix Correct the tool arguments. @verify bun run test -- src/orpc.test.ts */
export const InvalidInput = defineFailure('mcp.invalid_input', {
    status: 400,
    message: 'The tool arguments are invalid.',
    remediation: 'Correct the arguments and retry.',
});
/** Invocation cancelled. @fix Start a new invocation when still needed. @verify bun run test -- src/orpc.test.ts */
export const Cancelled = defineFailure('mcp.cancelled', {
    status: 499,
    message: 'The tool call was cancelled.',
    remediation: 'Start a new call if the result is still needed.',
});
/** Enable with `DEBUG=arki:mcp`. */
const debugMcp = getLogger('arki:mcp');
export const ADAPTER_FAILURES = [Forbidden, ApprovalRequired, InvalidInput, Cancelled, UnexpectedDefect];
export function fromRpc(entry, options) {
    const tools = {};
    const prefix = (options.prefix ?? entry.feature).replaceAll('.', '_').replaceAll('#', '_').toLowerCase();
    const visit = (router, path) => {
        for (const [key, value] of Object.entries(router)) {
            const here = [...path, key];
            if (options.mountedPaths?.some(mount => mount.every((part, index) => here[index] === part)))
                continue;
            if (!isContractProcedure(value)) {
                if (typeof value === 'object' && value !== null)
                    visit(value, here);
                continue;
            }
            const def = value['~orpc'];
            const declared = def.meta.mcp;
            if (declared === undefined)
                continue;
            // A wrong policy is a declaration bug, found while the tools are built (boot), never per call.
            const policy = parse(mcpPolicySchema, declared);
            if (isFailure(policy))
                throw new TypeError(`Invalid MCP policy at ${here.join('.')}`);
            if (policy.hidden)
                continue;
            for (const [code, source] of Object.entries(def.errorMap)) {
                const item = source;
                if (typeof item !== 'object' || item === null || !(RPC_FAILURE_DEFINITION in item)) {
                    throw new TypeError(`MCP tool ${here.join('.')}: error ${code} requires a canonical failure definition.`);
                }
                const definition = item[RPC_FAILURE_DEFINITION];
                if (typeof definition !== 'function' || !('code' in definition) || definition.code !== code) {
                    throw new TypeError(`MCP tool ${here.join('.')}: error ${code} has a mismatched canonical failure definition.`);
                }
            }
            if (getEventIteratorSchemaDetails(def.outputSchema))
                throw new TypeError('Streaming MCP tools are not supported.');
            const name = policy.name ?? `${prefix}_${key.replaceAll(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`;
            if (Object.hasOwn(tools, name))
                throw new TypeError(`Duplicate MCP tool: ${name}`);
            const run = async (input, call) => {
                try {
                    if (!allowed(policy, call))
                        return denied(name, Forbidden());
                    if (cancelled(call))
                        return denied(name, Cancelled());
                    if (policy.effect === 'destructive' &&
                        policy.confirm === 'elicit' &&
                        (call.approve === undefined ||
                            !(await call.approve({ name, input, principal: call.principal, signal: call.signal })))) {
                        return denied(name, ApprovalRequired());
                    }
                    // The typed gateway client owns validation, transforms and authorization.
                    if (cancelled(call))
                        return Cancelled();
                    let client = options.client(call);
                    let receiver;
                    for (const part of here) {
                        if ((typeof client !== 'object' && typeof client !== 'function') || client === null)
                            return UnexpectedDefect();
                        receiver = client;
                        client = Reflect.get(client, part);
                    }
                    if (typeof client !== 'function')
                        return UnexpectedDefect();
                    const output = await Reflect.apply(client, receiver, [
                        def.inputSchema === undefined ? undefined : input,
                        { signal: call.signal },
                    ]);
                    return output;
                }
                catch (error) {
                    if (cancelled(call))
                        return Cancelled();
                    const definitions = rpcFailureDefinitions(def.errorMap);
                    if (error instanceof ORPCError && definitions.some(definition => definition.code === error.code)) {
                        const failure = reviveRpcError(error, definitions);
                        if (failure !== undefined)
                            return failure;
                    }
                    if (error instanceof ORPCError) {
                        if (error.code === 'FORBIDDEN' || error.code === 'UNAUTHORIZED')
                            return Forbidden();
                        if (error.code === 'BAD_REQUEST')
                            return InvalidInput();
                    }
                    return UnexpectedDefect({ cause: error });
                }
            };
            Object.defineProperty(tools, name, {
                enumerable: true,
                value: {
                    name,
                    description: policy.description,
                    meta: policy,
                    input: def.inputSchema,
                    output: def.outputSchema,
                    errorMap: def.errorMap,
                    annotations: {
                        readOnlyHint: policy.effect === 'read',
                        destructiveHint: policy.effect === 'destructive',
                        idempotentHint: policy.idempotent ?? false,
                        openWorldHint: policy.openWorld ?? false,
                    },
                    run,
                    invoke: async (input, call) => toolResult(await run(input, call), Math.min(policy.budget?.maxChars ?? call.budget.maxChars, call.budget.maxChars)),
                },
            });
        }
    };
    visit(entry.contract, []);
    return tools;
}
function allowed(policy, call) {
    if (policy.access === 'public')
        return true;
    if (call.principal === null)
        return false;
    if (policy.access === 'user')
        return true;
    return ((policy.access.roles?.every(role => call.principal?.roles.includes(role)) ?? true) &&
        (policy.access.scopes?.every(scope => call.scopes?.includes(scope)) ?? true));
}
/** A call refused before it reached the gateway: leave a debug trace, since no downstream span exists for it. */
function denied(tool, failure) {
    debugMcp.debug('tool {tool} refused: {code}', { tool, code: failure.code });
    return failure;
}
function cancelled(call) {
    return call.signal.aborted;
}
export { ResultTooLarge, InvalidResult } from './result.js';
//# sourceMappingURL=orpc.js.map