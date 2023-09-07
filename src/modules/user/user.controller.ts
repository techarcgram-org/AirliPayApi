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
  Query,
  UseGuards,
} from '@nestjs/common';
import { formatResponse } from '../../common/lib/helpers';
import { UserService } from './user.service';
import { Response, Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserByEmployeeIdDto } from './dto/getuserbyid.dto';
import { GetUserByEmailDto } from './dto/getUserByEmail.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserSession } from 'src/common/types/user.type';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  /**
   * Get user by employee id .
   * @param {Request} req - Request param.
   * @param {Response} res - Response object.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */

  @Get('by-employee-id/')
  async findOneByEmployeeId(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() queryParams: GetUserByEmployeeIdDto,
  ) {
    const user = await this.usersService.findOne(queryParams.employeeId);
    return formatResponse(user, res, HttpStatus.OK);
  }

  /**
   * Get user by employee id .
   * @param {Request} req - Request param.
   * @param {Response} res - Response object.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */

  @Get('by-employee-email/')
  async findOneByEmployeeEmail(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() queryParams: GetUserByEmailDto,
  ) {
    const user = await this.usersService.findOneByEmail(
      queryParams.employeeEmail,
    );
    return formatResponse(user, res, HttpStatus.OK);
  }

  @Get('/list-banks')
  async listBanks() {
    return await this.usersService.listBanks();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/list-user-banks')
  async listUserBanks(@GetUser() user: UserSession) {
    return await this.usersService.listUserBanks(user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
