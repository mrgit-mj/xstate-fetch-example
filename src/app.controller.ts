import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AutomationService } from './automation.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly automationService: AutomationService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('trigger-automation')
  async triggerAutomation(@Body() user: any) {
    return this.automationService.runAutomation();
  }
}