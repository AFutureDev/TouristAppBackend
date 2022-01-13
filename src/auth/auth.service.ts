import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginInput, RegisterInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { AccessToken } from './entities/access-token.entity';
import { User } from './entities/user.entity';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID =
  '634893355227-5okafvnailq49vf47p4t8emfi4j7hnts.apps.googleusercontent.com';
const googleClient = new OAuth2Client(CLIENT_ID);

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

  async googleSignIn(idToken: string): Promise<AccessToken> {
    let email: string;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
    } catch (e) {
      throw new BadRequestException(`Invalid idToken`);
    }
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (user) {
      const payload = this.jwtService.sign({
        userId: user.id,
        email: user.email,
      });

      return { accessToken: payload };
    }
    const newUser = await this.prisma.user.create({
      data: {
        email: email,
        password: '',
        username: email.split('@')[0],
      },
    });
    const payload2 = this.jwtService.sign({
      userId: newUser.id,
      email: newUser.email,
    });

    return { accessToken: payload2 };
  }
}
