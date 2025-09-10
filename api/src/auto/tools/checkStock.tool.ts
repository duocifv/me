import axios from 'axios';
import { createToolAny } from './tool-helper';

const API_URL = 'https://dummyjson.com/products';

export type CheckStockResult = { itemId: number; stock: number | null };
export const checkStockTool = createToolAny(
  async ({ id }: { id: number }): Promise<CheckStockResult> => {
    const res = await axios.get(`${API_URL}/${id}`);
    return { itemId: id, stock: res.data?.stock ?? null };
  },
  {
    name: 'check_stock',
    description: 'Check stock for an item by its numeric ID',
  },
);
