import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: 'Basic ' + btoa('SO00000805450003:50791'),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return next.handle(authReq);
  }
}