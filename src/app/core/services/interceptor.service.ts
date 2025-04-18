import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExternalApiService } from './external-api.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  constructor(private externalApiService: ExternalApiService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiToken = this.externalApiService.getToken();
    if (apiToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
    }
    return next.handle(req);
  }
}