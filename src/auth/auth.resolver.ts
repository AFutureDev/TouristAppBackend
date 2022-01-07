import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { LoginInput, RegisterInput } from './dto/create-auth.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { User } from './entities/user.entity';
import { AccessToken } from './entities/access-token.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';

@ObjectType()
class PostMessage {
  @Field()
  msg: string;
}

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  register(@Args('registerInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AccessToken)
  login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  profile(@CurrentUser() user: any) {
    return this.authService.profile(user);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.authService.findAll();
  }

  @Query(() => PostMessage)
  @UseGuards(GqlAuthGuard)
  post(@CurrentUser() user: any) {
    return this.authService.post(user);
  }

  @Query(() => Auth, { name: 'auth' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.authService.findOne(id);
  }

  @Mutation(() => Auth)
  updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
    return this.authService.update(updateAuthInput.id, updateAuthInput);
  }

  @Mutation(() => Auth)
  removeAuth(@Args('id', { type: () => Int }) id: number) {
    return this.authService.remove(id);
  }
}
