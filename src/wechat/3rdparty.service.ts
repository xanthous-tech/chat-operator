import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { parse as xmlParse } from 'fast-xml-parser';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

import { WXMsgCrypto } from './wechat.crypto';
import { Wechat3rdPartyCredentials } from './models';

const COMPONENT_VERIFY_TICKET = 'wechat:component:verify_ticket';

@Injectable()
export class Wechat3rdPartyService {
  private logger = new Logger(Wechat3rdPartyService.name);

  private credentials: Wechat3rdPartyCredentials;
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
    this.credentials = this.configService.get('wx3p') as Wechat3rdPartyCredentials;
    this.redisClient = this.redisService.getClient('wechat');
  }

  public async decodeEncryptedXmlMessage(encrypted: string): Promise<any> {
    const { appId, token, aesKey } = this.credentials;
    const crypto = new WXMsgCrypto(appId, token, aesKey);
    return xmlParse(crypto.decrypt(encrypted).message).xml;
  }

  public async storeComponentVerifyTicket(ticket?: string): Promise<void> {
    if (!ticket) {
      this.logger.warn('no ticket');
      return;
    }

    // setting it to 30 mins for now
    await this.redisClient.set(COMPONENT_VERIFY_TICKET, ticket, 'ex', 1800);
  }

  // private async clearAccessTokens(): Promise<any> {
  //   return this.redisClient.del(COMPONENT_VERIFY_TICKET);
  // }
}
