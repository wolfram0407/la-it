import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { ObjectIdColumn } from 'typeorm';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({
    collection: 'chat',
    timestamps: true,
})
export class Chat {
    @ObjectIdColumn()
    _id: ObjectId;

    @Prop()
    userId: number;

    @Prop()
    liveId: string;

    @Prop({ required: true })
    content: string;
}
export const ChatSchema = SchemaFactory.createForClass(Chat);
