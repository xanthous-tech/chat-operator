import { Redis } from 'ioredis';

export default {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || 'chatOperator',

  clients: [
    {
      name: 'wechat',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_WECHAT_DB || 1),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
    {
      name: 'bots',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_BOTS_DB || 2),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
      onClientReady: (client: Redis): void => {
        client.on('error', (error) => console.error(error));
        client.on('close', () => console.error('redis connnection closed'));
      },
    },
    {
      name: 'session',
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_SESSION_DB || 3),
      password: process.env.REDIS_PASSWORD || 'chatOperator',
    },
  ],
};
