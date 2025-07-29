import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionModule } from './subscription/subscription.module';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';

@Module({
  imports: [SubscriptionModule],
  controllers: [AppController, SubscriptionController],
  providers: [AppService, SubscriptionService],
})
export class AppModule {}
