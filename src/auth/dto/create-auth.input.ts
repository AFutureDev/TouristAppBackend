import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field({ description: 'username' })
  username: string;

  @Field({ description: 'email' })
  email: string;

  @Field({ description: 'password' })
  password: string;
}

@InputType()
export class LoginInput {
  @Field({ description: 'email' })
  email: string;

  @Field({ description: 'password' })
  password: string;
}

@InputType()
export class GoogleSignInInput {
  @Field({ description: 'idToken' })
  idToken: string;
}
