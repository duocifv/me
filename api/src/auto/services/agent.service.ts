// ai/agent.service.ts
import { Injectable } from '@nestjs/common';
import { MCPService } from './mcp.service';
import { RAGService } from './rag.service';

export interface Agent {
  name: string;
  role: string;
  act: (input: string) => Promise<any>;
}

export class SimpleAgent implements Agent {
  constructor(
    public name: string,
    public role: string,
    private fn: (input: string) => Promise<any> | any,
  ) {}

  act(input: string) {
    return this.fn(input);
  }
}

@Injectable()
export class AgentService {
  private agents: Agent[];

  // map từ tên sản phẩm sang productId của DummyJSON
  private productMap: Record<string, number> = {
    mascara: 1,
    lipstick: 2,
    'lash-princess': 1,
    // có thể thêm nhiều sản phẩm khác
  };

  constructor(
    private readonly mcp: MCPService,
    private readonly rag: RAGService,
  ) {
    // Khởi tạo các agent
    this.agents = [
      new SimpleAgent('SalesAgent', 'Tư vấn bán hàng', async (q: string) => {
        return await this.rag.search(q); // trả về array products
      }),
      new SimpleAgent(
        'InventoryAgent',
        'Kiểm tra kho và giá',
        async (id: any) => {
          if (!id) return { stock: null, price: null };

          const stock = await this.mcp.checkStock(id);
          const price = await this.mcp.getPrice(id);
          return { stock: stock.stock, price: price.price };
        },
      ),
      new SimpleAgent(
        'ReviewAgent',
        'Lấy đánh giá sản phẩm',
        async (id: any) => {
          // const id = this.productMap[itemName];
          if (!id) return [];
          const product = await this.rag.getById(id);
          return product?.reviews ?? [];
        },
      ),
    ];
  }

  async collaborate(inputs: Record<string, any>) {
    console.log('collaborate inputs', inputs);
    const results = await Promise.all(
      Object.entries(inputs).map(async ([agentName, param]) => {
        // tìm agent từ danh sách

        const agent = this.agents.find(
          (a) => a.name.toLowerCase() === agentName.toLowerCase(),
        );
        if (!agent) return { agent: agentName, result: null };
        console.log('this.agents', agent);
        console.log('this.param', param);
        // nếu param là mảng, gọi từng phần tử
        if (Array.isArray(param)) {
          const result = await Promise.all(param.map((p) => agent.act(p)));
          console.log('result-->', result);
          return { agent: agentName, result };
        }

        const result = await agent.act(param);
        // console.log('this.result', result);
        return { agent: agentName, result };
      }),
    );

    return results;
  }
}
