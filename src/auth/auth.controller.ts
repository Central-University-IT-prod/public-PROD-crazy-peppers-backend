import {
  BadRequestException,
  Body,
  Controller,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { PublicRoute } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @PublicRoute()
  @Post('login')
  async login(@Body(ValidationPipe) dto: AuthDto) {
    const result = await this.authService.login(dto);
    if (result) return result;
    throw new BadRequestException('Неправильный логин или пароль');
  }
}
