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
import { BlogService } from '@blog/blog';
import { CreateArticleDto } from '@blog/blog/dto/create-article.dto';
import { UpdateArticleDto } from '@blog/blog/dto/update-article.dto';

@Controller(['blog', 'blogs'])
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.blogService.create(createArticleDto);
  }

  @Get()
  async findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.blogService.update(id, updateArticleDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.blogService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }
}
