import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { fetch, Headers, Request, Response } from 'undici';

// 👇 Gán global sau khi đã import
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
global.TextEncoder = TextEncoder as typeof global.TextEncoder;

// 👇 Thêm dòng này để fix lỗi fetch
global.fetch = fetch as any;
global.Headers = Headers as any;
global.Request = Request as any;
global.Response = Response as any;
