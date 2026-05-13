import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'SocietyPilot API',
      version: '2.0',
      status: 'ok',
      docs: '/v1/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
