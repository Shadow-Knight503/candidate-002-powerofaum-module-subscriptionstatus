import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Response } from 'express';

@Controller('api')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscription-status')
  getSubscriptionStatus(@Query('userId') userId: string, @Res() res: Response) {
    if (!userId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: 'userId parameter not found' });
    }

    const subscription =
      this.subscriptionService.getSubscriptionsStatus(userId);
    if (!subscription) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: `Subscription not found for userId: ${userId}`,
      });
    }

    return res
      .status(HttpStatus.OK)
      .json({ success: true, subscription: subscription });
  }

  @Post('update-subscription')
  async updateSubcription(
    @Body() updateDto: UpdateSubscriptionDto,
    @Res() res: Response,
  ) {
    const updatedSubscription =
      await this.subscriptionService.updateSubscriptionStatus(updateDto);
    return res
      .status(HttpStatus.OK)
      .json({ success: true, subscription: updatedSubscription });
  }
}
