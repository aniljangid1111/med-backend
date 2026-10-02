import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: true;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: any) => {
        // If the return value is an object and contains a 'message' property,
        // extract it and move it to the top level of the response.
        if (res && typeof res === 'object' && 'message' in res) {
          const { message, ...data } = res;
          return {
            success: true,
            message,
            // If the remaining object is empty (e.g. only message was returned),
            // return null or an empty object for data.
            data: Object.keys(data).length > 0 ? (data as T) : ({} as T),
          };
        }
        return { data: res, success: true };
      }),
    );
  }
}
