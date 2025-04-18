import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { getIdToken } from 'firebase/auth';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(private auth: Auth) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.auth.currentUser;

    if (!user) {
      return next.handle(req);
    }

    return from(getIdToken(user)).pipe(
      switchMap(token => {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(clonedReq);
      })
    );
  }
}
