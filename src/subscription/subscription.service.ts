import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { Subscription } from './interfaces/subscription.interface';
import * as path from 'path';
import * as fs from 'fs/promises';
import { addDays, formatISO } from 'date-fns';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  private mockSubscriptions: Record<string, Subscription> = {};
  private readonly IS_VERCEL_ENV =
    process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  private readonly DATA_FILE_PATH = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'data',
    'subscription.json',
  );

  async onModuleInit() {
    if (!this.IS_VERCEL_ENV) {
      await this.loadSubscriptionFromFile();
    } else {
      console.log(
        'Running on Vercel. Initializing with default in-memory mock data.',
      );
      this.mockSubscriptions = {
        USER_001: {
          userId: 'USER_001',
          plan: 'annual_spiritual',
          status: 'active',
          expiresAt: formatISO(addDays(new Date(), 365)) + 'Z',
        },
        USER_002: {
          userId: 'USER_002',
          plan: 'free',
          status: 'inactive',
          expiresAt: formatISO(addDays(new Date(), 30)) + 'Z',
        },
        USER_003: {
          userId: 'USER_003',
          plan: 'monthly_spiritual',
          status: 'active',
          expiresAt: formatISO(addDays(new Date(), 30)) + 'Z',
        },
      };
    }
  }

  private async loadSubscriptionFromFile() {
    try {
      const data = await fs.readFile(this.DATA_FILE_PATH, 'utf8');
      this.mockSubscriptions = JSON.parse(data);
      console.log('Subscriptions loaded from file: ' + this.DATA_FILE_PATH);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn(
          `Could not find Subscription file: ${this.DATA_FILE_PATH} - ${__dirname}`,
        );
        console.warn('Initialising with a empty set');
        this.mockSubscriptions = {};
        await this.saveSubscriptionsToFile();
      } else {
        console.error('Error loading subscriptions from file: ' + err);
        throw new InternalServerErrorException(
          'Failed to load initial subscriptions',
        );
      }
    }
  }

  private async saveSubscriptionsToFile(): Promise<void> {
    if (this.IS_VERCEL_ENV) {
      console.log(
        'Skipping file save: Running on Vercel (read-only file system). Data will be temporary.',
      );
      return;
    }

    try {
      const dir = path.dirname(this.DATA_FILE_PATH);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        this.DATA_FILE_PATH,
        JSON.stringify(this.mockSubscriptions, null, 2),
        'utf-8',
      );
      console.log('Subscriptions saved to file: ' + this.DATA_FILE_PATH);
    } catch (err) {
      console.error('Error saving subscriptions to file: ' + err);
      throw new InternalServerErrorException(
        `Failed to save subscriptions, ${err}`,
      );
    }
  }

  getSubscriptionsStatus(userId: string): Subscription | null {
    const subscription = this.mockSubscriptions[userId];
    if (!subscription) {
      return null;
    }
    return subscription;
  }

  async updateSubscriptionStatus(
    updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const { userId, newPlan, effectiveDate } = updateDto;

    if (!this.mockSubscriptions[userId]) {
      this.mockSubscriptions[userId] = {
        userId: userId,
        plan: 'free',
        status: 'inactive',
        expiresAt: formatISO(addDays(new Date(), 30)) + 'Z',
      };
    }
    const mon: string = 'monthly_spiritual',
      ann: string = 'annual_spiritual';
    const status: 'active' | 'inactive' =
      newPlan === mon || newPlan === ann ? 'active' : 'inactive';

    this.mockSubscriptions[userId].plan = newPlan;
    this.mockSubscriptions[userId].status = status;
    this.mockSubscriptions[userId].effectiveDate = effectiveDate;

    await this.saveSubscriptionsToFile();

    const responseSubscription: Subscription = {
      userId: this.mockSubscriptions[userId].userId,
      plan: this.mockSubscriptions[userId].plan,
      status: this.mockSubscriptions[userId].status,
      effectiveDate: this.mockSubscriptions[userId].effectiveDate,
    };

    return responseSubscription;
  }
}
