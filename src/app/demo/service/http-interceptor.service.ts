// http-interceptor.service.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Ajouter automatiquement l'authentification Basic Auth pour les API locales
    if (req.url.includes('localhost:8096')) {
      const credentials = btoa('admin:admin123');
      
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}