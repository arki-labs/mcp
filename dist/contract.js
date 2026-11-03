import { ContractProcedure } from '@orpc/contract';
/** Copy the contract definition, retaining its schemas, errors and existing policy metadata. */
export function asTool(procedure, mcp) {
    const def = procedure['~orpc'];
    return new ContractProcedure({ ...def, meta: { ...def.meta, mcp } });
}
//# sourceMappingURL=contract.js.map