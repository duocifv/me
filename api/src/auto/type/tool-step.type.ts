export interface ToolStep {
  tool: 'search' | 'ragSearch' | 'checkStock' | 'getPrice';
  input?: string;
  input_from_previous?: boolean;
}
