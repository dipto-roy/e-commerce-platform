import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Order } from '../../order/entities/order.entity';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created invoice directory: ${this.uploadDir}`);
    }
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber(orderId: number): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `INV-${year}${month}-${String(orderId).padStart(6, '0')}`;
  }

  /**
   * Generate PDF invoice for an order
   */
  async generateInvoice(order: Order): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const invoiceNumber = this.generateInvoiceNumber(order.id);
        const fileName = `${invoiceNumber}.pdf`;
        const filePath = path.join(this.uploadDir, fileName);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc
          .fontSize(20)
          .text('INVOICE', 50, 50, { align: 'center' })
          .moveDown();

        // Company/Store Info
        doc
          .fontSize(10)
          .text('E-Commerce Platform', 50, 100)
          .text('123 Business Street', 50, 115)
          .text('City, Country', 50, 130)
          .text('Email: support@ecommerce.com', 50, 145)
          .text('Phone: +1 234 567 890', 50, 160);

        // Invoice Details (Right side)
        doc
          .fontSize(10)
          .text(`Invoice Number: ${invoiceNumber}`, 350, 100)
          .text(`Order ID: #${order.id}`, 350, 115)
          .text(
            `Date: ${new Date(order.placedAt).toLocaleDateString()}`,
            350,
            130,
          )
          .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 350, 145)
          .text(`Payment Status: ${order.paymentStatus}`, 350, 160);

        // Customer Info
        doc
          .moveDown(3)
          .fontSize(12)
          .text('Bill To:', 50, 200)
          .fontSize(10)
          .text(`${order.buyer?.username || 'Customer'}`, 50, 220)
          .text(`${order.buyer?.email || 'N/A'}`, 50, 235)
          .text(`${order.shippingAddress}`, 50, 250, { width: 200 });

        // Line separator
        doc
          .moveTo(50, 290)
          .lineTo(550, 290)
          .stroke();

        // Table Headers
        const tableTop = 310;
        doc
          .fontSize(10)
          .text('Item', 50, tableTop)
          .text('Quantity', 300, tableTop)
          .text('Unit Price', 380, tableTop)
          .text('Total', 480, tableTop);

        // Table rows
        let yPosition = tableTop + 20;
        order.orderItems.forEach((item) => {
          doc
            .fontSize(9)
            .text(item.product?.name || item.productNameSnapshot, 50, yPosition, { width: 230 })
            .text(String(item.quantity), 300, yPosition)
            .text(
              `$${Number(item.unitPriceSnapshot).toFixed(2)}`,
              380,
              yPosition,
            )
            .text(
              `$${(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}`,
              480,
              yPosition,
            );

          yPosition += 25;
        });

        // Line separator
        doc
          .moveTo(50, yPosition + 10)
          .lineTo(550, yPosition + 10)
          .stroke();

        // Totals
        yPosition += 30;
        doc
          .fontSize(10)
          .text('Subtotal:', 380, yPosition)
          .text(`$${Number(order.totalAmount).toFixed(2)}`, 480, yPosition);

        yPosition += 20;
        doc
          .text('Shipping:', 380, yPosition)
          .text('$0.00', 480, yPosition);

        yPosition += 20;
        doc
          .fontSize(12)
          .text('Total:', 380, yPosition)
          .text(`$${Number(order.totalAmount).toFixed(2)}`, 480, yPosition);

        // Footer
        doc
          .fontSize(8)
          .text(
            'Thank you for your business!',
            50,
            700,
            { align: 'center', width: 500 },
          )
          .text(
            'For support, contact us at support@ecommerce.com',
            50,
            715,
            { align: 'center', width: 500 },
          );

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Invoice generated: ${fileName}`);
          resolve(fileName);
        });

        stream.on('error', (error) => {
          this.logger.error(`Failed to generate invoice: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        this.logger.error(`Invoice generation error: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Get invoice file path
   */
  getInvoicePath(fileName: string): string {
    return path.join(this.uploadDir, fileName);
  }

  /**
   * Check if invoice exists
   */
  invoiceExists(fileName: string): boolean {
    const filePath = this.getInvoicePath(fileName);
    return fs.existsSync(filePath);
  }

  /**
   * Delete invoice file
   */
  async deleteInvoice(fileName: string): Promise<boolean> {
    try {
      const filePath = this.getInvoicePath(fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Invoice deleted: ${fileName}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete invoice: ${error.message}`);
      return false;
    }
  }
}
