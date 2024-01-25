import { Controller } from '@nestjs/common';
import { CreateChatDto } from './dto/chat.dto';
import { UpdateChatDto } from './dto/response.chat.dto';

// TODO 인증가드 할것.
@Controller('live')
export class ChatController {}
