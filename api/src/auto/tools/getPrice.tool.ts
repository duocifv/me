import axios from 'axios';
import { DynamicTool } from '@langchain/core/tools';

const API_URL = 'https://dummyjson.com/products';

export const getPriceTool = new DynamicTool({
  name: 'get_price',
  description: 'Get price for an item by its numeric ID',
  func: async (input: string) => {
    try {
      const id = Number(input);
      if (Number.isNaN(id)) {
        return JSON.stringify({ itemId: input, price: null });
      }
      const res = await axios.get(`${API_URL}/${id}`);
      const data = res.data;
      return JSON.stringify({ itemId: id, price: data.price });
    } catch (err) {
      console.error(err);
      return JSON.stringify({ itemId: input, price: null });
    }
  },
});
