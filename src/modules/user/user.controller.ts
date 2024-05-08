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
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { csvFileFilter, csvFileName } from 'src/common/utils/util';
import { BuldCreateUserDto } from './dto/bulk-create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async get() {
    return await this.usersService.get();
  }

  @Post('/bulkCreate')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/employee-roasters',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  bulkCreate(
    @UploadedFile() file: Express.Multer.File,
    @Body() bulkUserDto: BuldCreateUserDto,
  ) {
    return this.usersService.bulkCreate(file, bulkUserDto.clientId);
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
    const user = await this.usersService.findOneByEmployeeId(
      queryParams.employeeId,
    );
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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

  @Get('/:id/airlipays')
  getAirliPays(@Param('id') id) {
    return this.usersService.getAirlipays(+id);
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
