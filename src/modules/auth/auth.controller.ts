import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login via email/password to receive an API token' })
  login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }
}
