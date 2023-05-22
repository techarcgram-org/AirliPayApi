import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { formatResponse } from '../lib/helpers';
import { UserService } from 'src/user/user.service';
import { Response, query } from 'express';
import { SendConfirmEmailDto } from './dto/sendEmail.dto';
import { VerifyEmailSecretDto } from './dto/verifyEmailSecret.dto';
import { CreateNewPasswordDto } from './dto/createNewPassword.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getAll(@Request() req) {
    return { data: req.user };
  }
  /**
   * Send Email Verification Code.
   * @param {Request} req - Request param.
   * @param {Response} res - Response object.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */

  @Post('/sendEmailVerificationCode')
  async sendEmailVerification(
    @Req() req: Request,
    @Body() body: SendConfirmEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findOneByEmail(body.email);
    const result = await this.usersService.sendEmailVerificationCode(user);
    if (!result.code)
      return formatResponse(
        { message: result.message },
        res,
        HttpStatus.BAD_REQUEST,
      );
    return formatResponse({ message: result.message }, res, HttpStatus.OK);
  }

  /**
   * verifies email code sent by user.
   * @param {Request} req - Request param.
   * @param {Response} res - Response object.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */

  @Post('/verifyEmailSecret')
  async verifyEmailSecret(
    @Req() req: Request,
    @Body() body: VerifyEmailSecretDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.findOneByEmail(body.email);
    const result = await this.usersService.verifyEmailCode(body.secret, user);
    if (!result.code)
      return formatResponse(
        { message: result.message },
        res,
        HttpStatus.BAD_REQUEST,
      );
    return formatResponse({ message: result.message }, res, HttpStatus.OK);
  }

  /**
   * Creates a new user password on onboard flow.
   * @param {Request} req - Request param.
   * @param {Response} res - Response object.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */

  @Post('/createNewPassword/:user_id')
  async createNewPassword(
    @Req() req: Request,
    @Body() body: CreateNewPasswordDto,
    @Res({ passthrough: true }) res: Response,
    @Param('user_id') userId: string,
  ) {
    if (body.password !== body.confirmPassword)
      return formatResponse(
        { message: "passwords don't match" },
        res,
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.usersService.findOneById(parseInt(userId));
    const result = await this.usersService.createPassword(body.password, user);
    if (!result.code)
      return formatResponse(
        { message: result.message },
        res,
        HttpStatus.BAD_REQUEST,
      );
    return formatResponse({ message: result.message }, res, HttpStatus.OK);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() body: LoginDto, @Request() req) {
    return this.authService.login(req.user, body.remember);
  }

  @Get('/validateAccessToken')
  validateToken(@Headers('authorization') authorization: string, @Res() res) {
    const token = authorization.replace('Bearer ', '');

    if (this.authService.tokenIsValid(token)) {
      return formatResponse(
        { message: 'Valid Access token' },
        res,
        HttpStatus.OK,
      );
    }
    return formatResponse(
      { message: 'Invalid Token' },
      res,
      HttpStatus.BAD_REQUEST,
    );
  }
}
