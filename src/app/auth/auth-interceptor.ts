import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const secureHttpInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  console.log('Interceptor running for URL:', request.url);
  
  // Get token from localStorage directly for simplicity
  const token = localStorage.getItem('token');
  
  // Prepare the URL
  let url = request.url;
  if (!url.includes('http')) {
    url = `${environment.apiUrl}${url}`;
  }
  
  console.log('Using URL:', url);
  
  // Create a new request with the token
  let modifiedRequest = request.clone({ url });
  
  // Only add Authorization header if token exists
  if (token) {
    console.log('Adding token to request');
    modifiedRequest = modifiedRequest.clone({
      headers: modifiedRequest.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  
  // Log the final request configuration
  console.log('Final request headers:', modifiedRequest.headers);
  
  // Pass the modified request to the next handler
  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP error in interceptor:', error);
      return throwError(() => error);
    })
  );
};