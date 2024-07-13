import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Category } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryNameValidatorService {
  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient,
  ) { }

  validate = (control: AbstractControl<any, any>): Observable<ValidationErrors | null> => {
    return this.http.get<Category[]>(`${this.baseURL}/categories?name=${control.value}`)
      .pipe(
        map(resp => {
          return (resp.length === 0) ? null : {categoryTaken:true};
        })
      )
  }
}
