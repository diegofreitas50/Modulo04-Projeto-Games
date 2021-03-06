import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleError } from 'src/utils/handle-error.util';
import { isAdmin } from 'src/utils/is-admin.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private userSelect = {
    password: false,
    id: true,
    name: true,
    email: true,
    isAdmin: true,
    cpf: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    if (dto.password != dto.confirmPassword) {
      throw new BadRequestException('As senhas informadas não são iguais.');
    }

    delete dto.confirmPassword;

    const data: User = {
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    };

    return this.prisma.user
      .create({ data, select: this.userSelect })
      .catch(handleError);
  }

  async findAll(user: User) {
    isAdmin(user);

    const allUsers = await this.prisma.user.findMany({
      select: this.userSelect,
    });

    if (allUsers.length === 0) {
      throw new NotFoundException('Não há usuários cadastrados.');
    }

    return allUsers;
  }

  async findById(id: string) {
    const record = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!record) {
      throw new NotFoundException(`Registro com id '${id}' não encontrado.`);
    }

    return record;
  }

  async findOne(user: User, id: string) {
    isAdmin(user);

    await this.findById(id);

    return await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
  }

  async update(user: User, id: string, dto: UpdateUserDto) {
    isAdmin(user);

    await this.findById(id);

    if (dto.password) {
      if (dto.password != dto.confirmPassword) {
        throw new BadRequestException('As senhas informadas não são iguais.');
      }
    }

    delete dto.confirmPassword;

    const data: Partial<User> = { ...dto };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user
      .update({ where: { id }, data, select: this.userSelect })
      .catch(handleError);
  }

  async delete(user: User, id: string) {
    isAdmin(user);
    
    await this.findById(id);

    await this.prisma.user.delete({ where: { id } });
  }
}
