import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Length } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @Length(3, 15)
  @ApiProperty({
    description: 'Nome de perfil. Deve conter de 3 a 15 letras',
    example: 'diegofreitas50',
  })
  title: string;

  @IsUrl()
  @ApiProperty({
    description: 'Foto do perfil. Deve ser uma URL.',
    example: 'https://avatars.githubusercontent.com/u/92491721?v=4',
  })
  imageUrl: string;
}
