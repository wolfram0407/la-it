import { PartialType } from '@nestjs/swagger';
import { CreateChatDto } from './chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {}
