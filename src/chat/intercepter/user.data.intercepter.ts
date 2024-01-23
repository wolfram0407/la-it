//import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
//import { AhoCorasick } from 'aho-corasick';
//import { forbiddenWords } from '../forbidden.words';
//import { Observable } from 'rxjs';
//@Injectable()
//export class ForbiddenWordsInterceptor implements NestInterceptor {
//    private ac;  //여기서 이 ac는 뭐야?

//    constructor() {
//        this.ac = new AhoCorasick();
//        forbiddenWords.forEach((word) => this.ac.add(word));
//        this.ac.build;  //이건 뭐야?
//    }
//    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {}
//}
