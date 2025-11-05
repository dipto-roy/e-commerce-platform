import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MaillerService } from '../mailler/mailler.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/unified-user.entity';
import { Role } from '../users/entities/role.enum';
import { Product } from '../product/entities/product.entity';
import { TrendPeriod, TrendDataPoint } from './dto/dashboard-trends.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly maillerService: MaillerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Example method
  getAdminInfo(): string {
    return 'This will return admin information';
  }

  getAdminNameandId(name: string, id: number): object {
    return { name: name, id: id };
  }

  addAdmin(admindata: object): object {
    return admindata;
  }

  deleteAdmin(id: number): object {
    // delete the admin user by id
    return { message: `Admin with id ${id} deleted.` };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateAdmin(id: number, updateData: any): object {
    return { message: `Admin with id ${id} updated.` };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patchAdmin(id: number, updateData: any): object {
    return { message: `Admin with id ${id} patched.` };
  }

  // Seller verification methods
  async getPendingSellers() {
    return await this.usersService.findPendingSellers();
  }

  async getVerifiedSellers() {
    return await this.usersService.findVerifiedSellers();
  }

  async verifySeller(sellerId: number) {
    return await this.usersService.verifySeller(sellerId);
  }

  async rejectSeller(sellerId: number, deleteAccount: boolean = false) {
    return await this.usersService.rejectSeller(sellerId, deleteAccount);
  }

  // Email functionality
  async sendEmailToUsers(
    subject: string,
    message: string,
    recipients: string[],
  ) {
    const results = [];

    for (const email of recipients) {
      try {
        await this.maillerService.sendSimpleEmail(email, subject, message);
        results.push({ email, status: 'sent', success: true });
      } catch (error) {
        results.push({
          email,
          status: 'failed',
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: 'Email sending completed',
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
      results,
    };
  }

  async sendBulkEmail(
    subject: string,
    message: string,
    recipientType: 'all' | 'users' | 'sellers',
  ) {
    let users: User[] = [];

    // Get recipients based on type
    if (recipientType === 'all') {
      users = await this.userRepository.find({
        where: { isActive: true },
        select: ['email', 'username'],
      });
    } else if (recipientType === 'users') {
      users = await this.userRepository.find({
        where: { role: Role.USER, isActive: true },
        select: ['email', 'username'],
      });
    } else if (recipientType === 'sellers') {
      users = await this.userRepository.find({
        where: { role: Role.SELLER, isActive: true, isVerified: true },
        select: ['email', 'username'],
      });
    }

    if (users.length === 0) {
      return {
        message: 'No recipients found',
        totalSent: 0,
        totalFailed: 0,
        results: [],
      };
    }

    const results = [];

    for (const user of users) {
      try {
        await this.maillerService.sendSimpleEmail(user.email, subject, message);
        results.push({
          email: user.email,
          username: user.username,
          status: 'sent',
          success: true,
        });
      } catch (error) {
        results.push({
          email: user.email,
          username: user.username,
          status: 'failed',
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: 'Bulk email sending completed',
      recipientType,
      totalRecipients: users.length,
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
      results,
    };
  }

  // Get email history (mock implementation - you can extend this with actual database storage)
  async getEmailHistory() {
    // This is a placeholder. In production, you would store email history in a database
    return {
      message: 'Email history feature coming soon',
      history: [],
    };
  }

  /**
   * Get dashboard trends data for charts
   * Returns historical data for users, sellers, and products
   */
  async getDashboardTrends(
    period: TrendPeriod = TrendPeriod.SEVEN_DAYS,
  ): Promise<{
    data: TrendDataPoint[];
    period: string;
    startDate: string;
    endDate: string;
  }> {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // End of today

      const startDate = new Date();
      let daysCount = 7;

      // Calculate start date based on period
      switch (period) {
        case TrendPeriod.SEVEN_DAYS:
          startDate.setDate(endDate.getDate() - 6); // 7 days including today
          daysCount = 7;
          break;
        case TrendPeriod.THIRTY_DAYS:
          startDate.setDate(endDate.getDate() - 29); // 30 days including today
          daysCount = 30;
          break;
        case TrendPeriod.THREE_MONTHS:
          startDate.setMonth(endDate.getMonth() - 3);
          daysCount = 90;
          break;
        case TrendPeriod.ONE_YEAR:
          startDate.setFullYear(endDate.getFullYear() - 1);
          daysCount = 365;
          break;
      }

      startDate.setHours(0, 0, 0, 0); // Start of day

      this.logger.log(
        `Fetching trends from ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );

      // Generate date array
      const dates: Date[] = [];
      for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }

      // Fetch data for each date (cumulative counts up to that date)
      const trendData: TrendDataPoint[] = await Promise.all(
        dates.map(async (date) => {
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          // Count users created up to this date (cumulative)
          const users = await this.userRepository.count({
            where: {
              createdAt: Between(new Date('2020-01-01'), endOfDay),
            },
          });

          // Count active/verified sellers created up to this date (cumulative)
          // Note: Sellers are users with role='SELLER' in the unified user table
          const sellers = await this.userRepository.count({
            where: {
              createdAt: Between(new Date('2020-01-01'), endOfDay),
              role: Role.SELLER,
              isVerified: true, // Count only verified sellers
            },
          });

          // Count products created up to this date (cumulative)
          const products = await this.productRepository.count({
            where: {
              createdAt: Between(new Date('2020-01-01'), endOfDay),
            },
          });

          return {
            date: this.formatDate(date),
            users,
            sellers,
            products,
          };
        }),
      );

      return {
        data: trendData,
        period,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching dashboard trends: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Format date to YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
