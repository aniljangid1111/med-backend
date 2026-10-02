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
import { FaqService } from '@faq/faq';
import { CreateFaqDto } from '@faq/faq/dto/create-faq.dto';
import { UpdateFaqDto } from '@faq/faq/dto/update-faq.dto';

@Controller(['faq', 'faqs'])
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  async create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  async findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqService.update(id, updateFaqDto);
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
