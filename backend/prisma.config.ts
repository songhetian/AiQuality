import 'dotenv/config';
import * as path from 'path';
import { defineConfig } from 'prisma/config';
import { resolveDatabaseUrl } from './database-url';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
  });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolveDatabaseUrl(process.env),
  },
});
