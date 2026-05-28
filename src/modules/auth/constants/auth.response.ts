export class UserResponse {
  email: string;
  id: number;
  name: string;
}

export class LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
