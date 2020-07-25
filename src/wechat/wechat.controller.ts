import { Controller, Get, Param, Post, Body, Res, Query, Header, Logger, NotFoundException } from '@nestjs/common';

import { WechatService } from './wechat.service';
import { Wechat3rdPartyService } from './3rdparty.service';

@Controller('wechat')
export class WechatController {
  private readonly logger = new Logger(WechatController.name);
  constructor(private readonly wechatService: WechatService, private readonly wx3pService: Wechat3rdPartyService) {}

  @Get('/:appNamespace')
  async validate(
    @Param('appNamespace') appNamespace: string,
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
  ): Promise<string> {
    // 若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败
    const validated = await this.wechatService.validateWechatServer(appNamespace, signature, timestamp, nonce);

    if (!validated) {
      throw new NotFoundException();
    }

    return echostr;
  }

  @Post('/:appNamespace')
  async getMessage(@Param('appNamespace') appNamespace: string, @Body('xml') body: any): Promise<string> {
    let payload = body;

    if (payload.Encrypt) {
      this.logger.debug('incoming message encrypted, decrypting');
      payload = await this.wechatService.decodeEncryptedXmlMessage(appNamespace, body.Encrypt);
    }

    this.logger.log(payload);
    this.wechatService.getSubject(appNamespace).next({ ...payload, appNamespace });

    return 'success';
  }

  @Post('3rdparty/webhook')
  async thirdPartyWebhook(@Body('xml') body: any): Promise<string> {
    let payload = body;

    if (payload.Encrypt) {
      this.logger.debug('incoming message encrypted, decrypting');
      payload = await this.wx3pService.decodeEncryptedXmlMessage(body.Encrypt);
    }

    this.logger.log(payload);

    if (payload.InfoType === 'component_verify_ticket') {
      this.logger.debug('storing component verify ticket');
      await this.wx3pService.storeComponentVerifyTicket(payload.ComponentVerifyTicket);
    }

    return 'success';
  }
}