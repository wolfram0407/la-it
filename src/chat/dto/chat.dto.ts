export class CreateChatDto {
    content: string;
}

export class CreateChatResultDto {
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export class SearchDto {
    searchValue: string;
}
