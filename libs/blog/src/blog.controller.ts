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
import { BlogService } from './blog.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    const article = await this.blogService.create(createArticleDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Article created successfully',
      data: article,
    };
  }

  @Get()
  async findAll() {
    const articles = await this.blogService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Articles fetched successfully',
      data: articles,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const article = await this.blogService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article fetched successfully',
      data: article,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.blogService.update(id, updateArticleDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Article updated successfully',
      data: article,
    };
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
