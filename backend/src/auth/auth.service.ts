import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: any) {
    const user = (await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    })) as any;

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account.');
    }

    // FIX 1: Changed user.password to user.passwordHash
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.id, email: user.email, roleId: user.roleId };

    // FIX 2: Explicitly pass secrets from ConfigService to match JwtStrategy
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret';

    const accessToken = this.jwtService.sign(payload, { 
      secret: accessSecret, 
      expiresIn: '15m' 
    });
    
    const refreshToken = this.jwtService.sign(payload, { 
      secret: refreshSecret, 
      expiresIn: '7d' 
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name,
      },
    };
  }

  async refresh(dto: any) {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh_secret';
      const payload = this.jwtService.verify(dto.refreshToken, { secret: refreshSecret });
      
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user || !user.isActive) {
        throw new ForbiddenException('Access denied.');
      }

      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'access_secret';

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, roleId: user.roleId },
        { secret: accessSecret, expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(refreshToken: string) {
    return { message: 'Logged out successfully' };
  }

  async getSession(userId: string) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    })) as any;

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const permissions = user.role?.permissions
      ? user.role.permissions.map((rp: any) => rp.permission?.name)
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      permissions,
    };
  }
}