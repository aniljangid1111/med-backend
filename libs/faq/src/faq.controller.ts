import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  async create(@Body() createFaqDto: CreateFaqDto) {
    const faq = await this.faqService.create(createFaqDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'FAQ created successfully',
      data: faq,
    };
  }

  @Get()
  async findAll() {
    const faqs = await this.faqService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'FAQs fetched successfully',
      data: faqs,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const faq = await this.faqService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'FAQ fetched successfully',
      data: faq,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    const faq = await this.faqService.update(id, updateFaqDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'FAQ updated successfully',
      data: faq,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.faqService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'FAQ deleted successfully',
    };
  }
}
