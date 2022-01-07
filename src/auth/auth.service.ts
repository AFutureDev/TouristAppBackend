import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginInput, RegisterInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { AccessToken } from './entities/access-token.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          username: registerInput.username,
          email: registerInput.email,
          password: registerInput.password,
        },
      });
      return user;
    } catch (e) {
      throw new BadRequestException(`A user with email already exists`);
    }
  }

  async login(loginInput: LoginInput): Promise<AccessToken> {
    console.log(loginInput);
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginInput.email,
      },
    });

    if (!user) {
      throw new BadRequestException(`Invalid credentials`);
    }

    if (user.password !== loginInput.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return { accessToken: payload };
  }

  async post(userData: any): Promise<{ msg: string }> {
    return { msg: `Posted image by ${userData.email}` };
  }

  async profile(userData: any): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userData.userId,
      },
    });
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
