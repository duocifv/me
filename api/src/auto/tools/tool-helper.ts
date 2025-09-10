// utils/tool-helper.ts
import { tool } from '@langchain/core/tools';

export const createToolAny = (fn: any, fields: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return tool(fn, fields) as any;
};
