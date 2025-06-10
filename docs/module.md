📁 Cấu trúc
.
├── nest/ # NestJS backend
│ ├── src/
│ │ ├── app.module.ts
│ │ ├── app.controller.ts
│ │ └── main.ts
│ └── package.json
├── next/ # Next.js frontend
│ ├── pages/
│ │ ├── index.tsx
│ │ └── temperature/[id].tsx
│ └── package.json
├── server.ts # khởi tạo Express + Nest + Next
└── package.json # workspace root

---

1. server.ts

---

// server.ts
import express from 'express';
import next from 'next';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './nest/src/app.module';

async function bootstrap() {
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: './next' });
const handle = nextApp.getRequestHandler();

await nextApp.prepare();

// khởi tạo Express làm host
const server = express();

// gắn NestJS lên server
const nestApp = await NestFactory.create(
AppModule,
new ExpressAdapter(server),
);
await nestApp.init();

// tất cả route còn lại (ngoại trừ /api/_) sẽ về Next.js
server.all('_', (req, res) => handle(req, res));

const PORT = +process.env.PORT! || 3000;
server.listen(PORT, () => {
console.log(`🚀 Fullstack running on http://localhost:${PORT}`);
});
}

bootstrap();

2. NestJS backend (nest/src)
   app.controller.ts

---

import { Controller, Get, Param } from '@nestjs/common';

@Controller('api/temperature')
export class AppController {
private readonly data = {
'1': { id: '1', value: 26.5 },
'2': { id: '2', value: 27.1 },
};

@Get()
findAll() {
return Object.values(this.data);
}

@Get(':id')
findOne(@Param('id') id: string) {
return this.data[id] || { error: 'Not found' };
}
}

## app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
imports: [],
controllers: [AppController],
})
export class AppModule {}

3. Next.js frontend (next/pages)

---

## pages/index.tsx

import Link from 'next/link';
import { GetServerSideProps } from 'next';

type Temp = { id: string; value: number };

export default function Home({ temps }: { temps: Temp[] }) {
return (
<main style={{ padding: 20 }}>
<h1>Danh sách cảm biến</h1>
<ul>
{temps.map(({ id, value }) => (
<li key={id}>
Sensor {id}: {value}°C —{' '}
<Link href={`/temperature/${id}`}>chi tiết</Link>
</li>
))}
</ul>
</main>
);
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
const res = await fetch(
`${process.env.HOST || 'http://localhost:3000'}/api/temperature`,
);

const temps: Temp[] = await res.json();
return { props: { temps } };
};

pages/temperature/[id].tsx

import { GetServerSideProps } from 'next';

type Props = { id: string; value: number };

export default function Detail({ id, value }: Props) {
return (
<main style={{ padding: 20 }}>
<h1>Chi tiết Sensor {id}</h1>
<p>Nhiệt độ: {value}°C</p>
<a href="/">← Quay về danh sách</a>
</main>
);
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
const id = params!.id as string;
const res = await fetch(
`${process.env.HOST || 'http://localhost:3000'}/api/temperature/${id}`,
);
const data = await res.json();
return {
props: { id, value: data.value ?? null },
};
};

4. Root package.json (workspace)

---

{
"name": "fullstack-module",
"private": true,
"workspaces": ["nest", "next"],
"scripts": {
"dev": "ts-node server.ts",
"build": "cd next && npm run build && cd .. && tsc -p nest/tsconfig.json"
},
"dependencies": {
"express": "^4.18.2",
"next": "^14.0.0",
"react": "^18.0.0",
"react-dom": "^18.0.0",
"@nestjs/common": "^10.0.0",
"@nestjs/core": "^10.0.0",
"@nestjs/platform-express": "^10.0.0"
},
"devDependencies": {
"ts-node": "^10.9.1",
"typescript": "^5.1.3"
}
}

#include <Wire.h>
#include <PCF8574.h>

// Khởi tạo PCF8574: địa chỉ I2C và chân SDA/SCL
PCF8574 pcf8574(0x20, 12, 13); // 0x20 là địa chỉ mặc định

void setup() {
Serial.begin(115200);
Serial.println("Bắt đầu test PCF8574...");

pcf8574.begin();
pcf8574.pinMode(P0, OUTPUT); // dùng P0 làm output test đèn
}

void loop() {
pcf8574.digitalWrite(P0, HIGH);
Serial.println("P0 HIGH");
delay(1000);
pcf8574.digitalWrite(P0, LOW);
Serial.println("P0 LOW");
delay(1000);
}
