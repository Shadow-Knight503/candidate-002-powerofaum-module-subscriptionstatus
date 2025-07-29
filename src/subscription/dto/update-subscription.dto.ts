import { IsIn, IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['monthly_spiritual', 'annual_spiritual', 'free'])
  newPlan: string;

  @IsString()
  @IsISO8601()
  effectiveDate: string;
}
