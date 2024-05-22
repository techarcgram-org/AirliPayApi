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
import { ListTransactionDto } from '../airlipay-balance/dto/list-transaction.dto';
import { AirlipayBalanceService } from '../airlipay-balance/airlipay-balance.service';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';
import { UpdatePhoneDto } from './dto/update-phone.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UserService,
    private readonly airlipayBalanceService: AirlipayBalanceService,
  ) {}

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

  @UseGuards(AuthGuard, ACGuard)
  @ApiBearerAuth()
  @UseRoles({
    resource: 'employeeData',
    action: 'read',
    possession: 'any',
  })
  @Get(':user_id/airlipay-balance')
  async getUserBalance(
    @Param('user_id') user_id: number,
    @Res({ passthrough: true }) res,
  ) {
    return await this.airlipayBalanceService.getUserBalance(user_id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/:user_id/transactions')
  async listUserTransactions(
    @Param('user_id') user_id: number,
    @Body() listTransactionDto: ListTransactionDto,
  ) {
    return await this.airlipayBalanceService.listUserWithdrawalTransactions(
      user_id,
      listTransactionDto,
    );
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':user_id/list-banks')
  async listBanks(@Param('id') user_id: number) {
    return await this.usersService.listBanks(user_id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':id/list-momo-accounts')
  async listMomoAccounts(@Param('id') id: number) {
    return await this.usersService.listMomoAccounts(id);
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

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/:id/notifications')
  getAllNotifications(@Param('id') id) {
    return this.usersService.getNotifications(+id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/phoneConfirmation')
  updateUserPhone(
    @Param('id') id: string,
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.usersService.updatePhoneConfirmed(+id, updatePhoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
