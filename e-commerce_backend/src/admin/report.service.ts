import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { OrderStatus, PaymentStatus } from '../order/entities/order.enums';
import { User } from '../users/entities/unified-user.entity';
import { Role } from '../users/entities/role.enum';
import { Product } from '../product/entities/product.entity';
import { Payment } from '../order/entities/payment.entity';
import {
  GenerateReportDto,
  ReportType,
  ReportFormat,
} from './dto/generate-report.dto';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async generateReport(dto: GenerateReportDto): Promise<Buffer> {
    // Fetch data based on report type
    const data = await this.fetchReportData(
      dto.type,
      dto.startDate,
      dto.endDate,
    );

    // Generate file based on format
    switch (dto.format) {
      case ReportFormat.PDF:
        return await this.generatePDFReport(data, dto.type);
      case ReportFormat.EXCEL:
        return await this.generateExcelReport(data, dto.type);
      case ReportFormat.CSV:
        return this.generateCSVReport(data, dto.type);
      default:
        throw new BadRequestException('Invalid report format');
    }
  }

  private async fetchReportData(
    type: ReportType,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    switch (type) {
      case ReportType.SALES:
        return await this.fetchSalesData(dateFilter);
      case ReportType.USERS:
        return await this.fetchUsersData(dateFilter);
      case ReportType.PRODUCTS:
        return await this.fetchProductsData(dateFilter);
      case ReportType.ORDERS:
        return await this.fetchOrdersData(dateFilter);
      case ReportType.REVENUE:
        return await this.fetchRevenueData(dateFilter);
      case ReportType.INVENTORY:
        return await this.fetchInventoryData(dateFilter);
      default:
        throw new BadRequestException('Invalid report type');
    }
  }

  private buildDateFilter(startDate?: string, endDate?: string): any {
    if (!startDate && !endDate) return {};

    if (startDate && endDate) {
      return Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      return MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      return LessThanOrEqual(new Date(endDate));
    }
    return {};
  }

  // ==================== DATA FETCHING METHODS ====================

  private async fetchSalesData(dateFilter: any): Promise<any> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('orderEntity')
      .leftJoinAndSelect('orderEntity.buyer', 'buyer')
      .leftJoinAndSelect('orderEntity.orderItems', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('orderEntity.payment', 'payment');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ placedAt: dateFilter });
    }

    const orders = await queryBuilder.getMany();

    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
      },
      orders: orders.map((order) => ({
        orderId: order.id,
        date: order.placedAt,
        buyer: order.buyer
          ? order.buyer.fullName || order.buyer.username
          : 'N/A',
        items: order.orderItems?.length || 0,
        total: order.totalAmount,
        status: order.status,
        paymentStatus: order.payment?.status || order.paymentStatus,
      })),
    };
  }

  private async fetchUsersData(dateFilter: any): Promise<any> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ createdAt: dateFilter });
    }

    const users = await queryBuilder.getMany();

    const buyers = users.filter((u) => u.role === Role.USER);
    const sellers = users.filter((u) => u.role === Role.SELLER);
    const admins = users.filter((u) => u.role === Role.ADMIN);

    return {
      summary: {
        totalUsers: users.length,
        buyers: buyers.length,
        sellers: sellers.length,
        admins: admins.length,
      },
      users: users.map((user) => ({
        id: user.id,
        name: user.fullName || user.username,
        email: user.email,
        role: user.role,
        verified: user.isVerified,
        createdAt: user.createdAt,
      })),
    };
  }

  private async fetchProductsData(dateFilter: any): Promise<any> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ createdAt: dateFilter });
    }

    const products = await queryBuilder.getMany();

    const totalProducts = products.length;
    const inStock = products.filter((p) => p.stockQuantity > 0).length;
    const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.price) * p.stockQuantity,
      0,
    );

    return {
      summary: {
        totalProducts,
        inStock,
        outOfStock,
        totalValue,
      },
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category || 'N/A',
        seller: product.seller
          ? product.seller.fullName || product.seller.username
          : 'N/A',
        price: product.price,
        stock: product.stockQuantity,
        status: product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
      })),
    };
  }

  private async fetchOrdersData(dateFilter: any): Promise<any> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('orderEntity')
      .leftJoinAndSelect('orderEntity.buyer', 'buyer');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ placedAt: dateFilter });
    }

    const orders = await queryBuilder.getMany();

    const pending = orders.filter(
      (o) => o.status === OrderStatus.PENDING,
    ).length;
    const confirmed = orders.filter(
      (o) => o.status === OrderStatus.CONFIRMED,
    ).length;
    const shipped = orders.filter(
      (o) => o.status === OrderStatus.SHIPPED,
    ).length;
    const delivered = orders.filter(
      (o) => o.status === OrderStatus.DELIVERED,
    ).length;
    const cancelled = orders.filter(
      (o) => o.status === OrderStatus.CANCELLED,
    ).length;

    return {
      summary: {
        totalOrders: orders.length,
        pending,
        confirmed,
        shipped,
        delivered,
        cancelled,
      },
      orders: orders.map((order) => ({
        orderId: order.id,
        date: order.placedAt,
        buyer: order.buyer
          ? order.buyer.fullName || order.buyer.username
          : 'N/A',
        total: order.totalAmount,
        status: order.status,
      })),
    };
  }

  private async fetchRevenueData(dateFilter: any): Promise<any> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'orderEntity');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ createdAt: dateFilter });
    }

    const payments = await queryBuilder.getMany();

    const totalRevenue = payments
      .filter((p) => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingRevenue = payments
      .filter((p) => p.status === PaymentStatus.PENDING)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const failedRevenue = payments
      .filter((p) => p.status === PaymentStatus.FAILED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      summary: {
        totalRevenue,
        pendingRevenue,
        failedRevenue,
        totalTransactions: payments.length,
      },
      payments: payments.map((payment) => ({
        transactionId: payment.providerPaymentId || payment.id.toString(),
        date: payment.createdAt,
        orderId: payment.order?.id || payment.orderId,
        amount: payment.amount,
        provider: payment.provider,
        paymentMethod: payment.paymentMethod?.type || 'N/A',
        status: payment.status,
      })),
    };
  }

  private async fetchInventoryData(dateFilter: any): Promise<any> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller');

    if (Object.keys(dateFilter).length > 0) {
      queryBuilder.where({ createdAt: dateFilter });
    }

    const products = await queryBuilder.getMany();

    const lowStockThreshold = 10;
    const lowStock = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold,
    );
    const outOfStock = products.filter((p) => p.stockQuantity === 0);
    const inStock = products.filter((p) => p.stockQuantity > lowStockThreshold);

    return {
      summary: {
        totalProducts: products.length,
        inStock: inStock.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
      },
      inventory: products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category || 'N/A',
        seller: product.seller
          ? product.seller.fullName || product.seller.username
          : 'N/A',
        stock: product.stockQuantity,
        status:
          product.stockQuantity === 0
            ? 'Out of Stock'
            : product.stockQuantity <= lowStockThreshold
              ? 'Low Stock'
              : 'In Stock',
      })),
    };
  }

  // ==================== PDF GENERATION ====================

  private async generatePDFReport(
    data: any,
    type: ReportType,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text(`${this.getReportTitle(type)}`, { align: 'center' });
      doc
        .fontSize(10)
        .text(`Generated on: ${new Date().toLocaleString()}`, {
          align: 'center',
        });
      doc.moveDown(2);

      // Summary Section
      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      Object.entries(data.summary).forEach(([key, value]) => {
        doc.text(`${this.formatLabel(key)}: ${this.formatValue(value)}`);
      });

      doc.moveDown(2);

      // Data Table
      doc.fontSize(14).text('Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(9);

      const dataKey = this.getDataKey(type);
      const items = data[dataKey] || [];

      if (items.length > 0) {
        const headers = Object.keys(items[0]);
        const columnWidth = (doc.page.width - 100) / headers.length;

        // Table Headers
        let xPos = 50;
        headers.forEach((header) => {
          doc.text(this.formatLabel(header), xPos, doc.y, {
            width: columnWidth,
            continued: false,
          });
          xPos += columnWidth;
        });

        doc.moveDown(0.5);

        // Table Rows (limit to avoid huge PDFs)
        items.slice(0, 100).forEach((item: any) => {
          xPos = 50;
          headers.forEach((header) => {
            const value = item[header];
            doc.text(String(this.formatValue(value)), xPos, doc.y, {
              width: columnWidth,
              continued: false,
            });
            xPos += columnWidth;
          });
          doc.moveDown(0.3);
        });

        if (items.length > 100) {
          doc.moveDown(1);
          doc.text(`... and ${items.length - 100} more items`, {
            align: 'center',
          });
        }
      } else {
        doc.text('No data available for the selected period.');
      }

      doc.end();
    });
  }

  // ==================== EXCEL GENERATION ====================

  private async generateExcelReport(
    data: any,
    type: ReportType,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.getReportTitle(type));

    // Add title
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = this.getReportTitle(type);
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Add generation date
    worksheet.mergeCells('A2:F2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };

    let currentRow = 4;

    // Summary Section
    worksheet.getCell(`A${currentRow}`).value = 'Summary';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    Object.entries(data.summary).forEach(([key, value]) => {
      worksheet.getCell(`A${currentRow}`).value = this.formatLabel(key);
      worksheet.getCell(`B${currentRow}`).value = this.formatValue(value);
      currentRow++;
    });

    currentRow += 2;

    // Data Table
    worksheet.getCell(`A${currentRow}`).value = 'Details';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    const dataKey = this.getDataKey(type);
    const items = data[dataKey] || [];

    if (items.length > 0) {
      const headers = Object.keys(items[0]);

      // Add headers
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(currentRow, index + 1);
        cell.value = this.formatLabel(header);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };
      });
      currentRow++;

      // Add data rows
      items.forEach((item: any) => {
        headers.forEach((header, index) => {
          worksheet.getCell(currentRow, index + 1).value = this.formatValue(
            item[header],
          );
        });
        currentRow++;
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });
    } else {
      worksheet.getCell(`A${currentRow}`).value =
        'No data available for the selected period.';
    }

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  // ==================== CSV GENERATION ====================

  private generateCSVReport(data: any, type: ReportType): Buffer {
    let csv = `${this.getReportTitle(type)}\n`;
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Summary
    csv += 'Summary\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `${this.formatLabel(key)},${this.formatValue(value)}\n`;
    });
    csv += '\n';

    // Data
    csv += 'Details\n';
    const dataKey = this.getDataKey(type);
    const items = data[dataKey] || [];

    if (items.length > 0) {
      const headers = Object.keys(items[0]);
      csv += headers.map(this.formatLabel).join(',') + '\n';

      items.forEach((item: any) => {
        csv +=
          headers
            .map((h) => this.escapeCSV(this.formatValue(item[h])))
            .join(',') + '\n';
      });
    } else {
      csv += 'No data available for the selected period.\n';
    }

    return Buffer.from(csv, 'utf-8');
  }

  // ==================== HELPER METHODS ====================

  private getReportTitle(type: ReportType): string {
    const titles = {
      [ReportType.SALES]: 'Sales Report',
      [ReportType.USERS]: 'Users Report',
      [ReportType.PRODUCTS]: 'Products Report',
      [ReportType.ORDERS]: 'Orders Report',
      [ReportType.REVENUE]: 'Revenue Report',
      [ReportType.INVENTORY]: 'Inventory Report',
    };
    return titles[type] || 'Report';
  }

  private getDataKey(type: ReportType): string {
    const keys = {
      [ReportType.SALES]: 'orders',
      [ReportType.USERS]: 'users',
      [ReportType.PRODUCTS]: 'products',
      [ReportType.ORDERS]: 'orders',
      [ReportType.REVENUE]: 'payments',
      [ReportType.INVENTORY]: 'inventory',
    };
    return keys[type] || 'data';
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
