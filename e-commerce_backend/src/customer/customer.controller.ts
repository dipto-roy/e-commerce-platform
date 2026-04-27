import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CustomerService } from './customer.service';

@ApiTags('Customers')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'Get customer info string' })
  @Get()
  getCustomerInfo(): string {
    return this.customerService.getCustomerInfo();
  }

  @ApiOperation({ summary: 'Get all customer info' })
  @Get('info')
  getInfo(): object[] {
    return this.customerService.getInfo();
  }

  @ApiOperation({ summary: 'Get customer info by ID' })
  @ApiParam({ name: 'id', type: Number })
  @Get('info/:id')
  getInfoById(@Param('id') id: number): object | undefined {
    return this.customerService.getInfoById(Number(id));
  }

  @ApiOperation({ summary: 'Add a new customer' })
  @Post('add')
  addUser(@Body() user: { id: number; name: string }): object {
    return this.customerService.addUser(user);
  }

  @ApiOperation({ summary: 'Update customer by ID' })
  @ApiParam({ name: 'id', type: Number })
  @Put('update/:id')
  updateUser(
    @Param('id') id: number,
    @Body('name') name: string,
  ): object | undefined {
    return this.customerService.updateUser(Number(id), name);
  }

  @ApiOperation({ summary: 'Delete customer by ID' })
  @ApiParam({ name: 'id', type: Number })
  @Delete('delete/:id')
  deleteUser(@Param('id') id: number): boolean {
    return this.customerService.deleteUser(Number(id));
  }
}
