import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: any) {
    return this.authService.refresh(dto);
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: any) {
    // Requires refreshToken in the body to revoke the session
    return this.authService.logout(dto.refreshToken);
  }

  @Get('session')
  getSession(@Req() req: any) {
    // Returns user info, role, and a flat list of string permissions
    return this.authService.getSession(req.user.id);
  }
}