import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { number } from 'joi';
import { Date, HydratedDocument, ObjectId } from 'mongoose';
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

    //@Prop({ type: Date, default: () => new Date() })
    //createdAt: Date;

    //@Prop({ type: Date, default: () => new Date() })
    //updatedAt: Date;
}
export const ChatSchema = SchemaFactory.createForClass(Chat);
