import type { CallToolResult } from '@modelcontextprotocol/server';
/** Response exceeds its budget. @fix Request a smaller page. @verify bun run test -- src/orpc.test.ts */
export declare const ResultTooLarge: import("@arki/failure").FailureDefinition<"mcp.result_too_large", undefined>;
/** Response is not JSON. @fix Return a serializable contract output. @verify bun run test -- src/orpc.test.ts */
export declare const InvalidResult: import("@arki/failure").FailureDefinition<"mcp.internal", undefined>;
/** MCP has its own envelope; failures remain model-visible errors. */
export declare function toolResult(value: unknown, maxChars: number): CallToolResult;
//# sourceMappingURL=result.d.ts.map