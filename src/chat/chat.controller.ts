import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/chat.dto';
import { UpdateChatDto } from './dto/response.chat.dto';

// TODO 인증가드 할것.
@Controller('live')
export class ChatController {
    //constructor(private readonly chatService: ChatService) {}
    //@Post('/:liveId/chat')
    //async createChat(@Body() createChatDto: CreateChatDto):  {
    //  await return this.chatService.createChat(createChatDto);
    //}
    //@Get('/:liveId/chat')
    //findAllChat() {
    //    return this.chatService.findAll();
    //}
    //@Get('/:liveId/chat')
    //findOneChat(@Param('id') id: string) {
    //    return this.chatService.findOne(+id);
    //}
    //@Patch('/:liveId/chat')
    //updateChat(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    //    return this.chatService.update(+id, updateChatDto);
    //}
}
