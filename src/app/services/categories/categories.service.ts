import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { map, Observable } from 'rxjs';
import { Category } from '../../interfaces/category.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient
  ) { }

  getCategories(sort: string, order: SortDirection, page?: number): Observable<Category[]>{
    if(!order && !sort){ order = 'desc'; sort = 'date' } //Se aplican para la primera vez que se obtienen los datos

    const params = new HttpParams()
      .set('_sort', sort)
      .set('_order', order)

    return this.http.get<Category[]>(`${this.baseURL}/categories`, {params})
  }

  getCategory(categoryName: string): Observable<Category>{
    return this.http.get<Category[]>(`${this.baseURL}/categories?name=${categoryName}`).pipe(
      map(categories => categories[0]) // Se obtiene el primer elemento del array
    );
  }

  addCategory(category: Category): Observable<Category>{
    return this.http.post<Category>(`${this.baseURL}/categories`, category);
  }

  updateCategory(category: Category): Observable<Category>{
    return this.http.put<Category>(`${this.baseURL}/categories/${category.id}`, category);
  }

  deleteCategory(categoryID: string): Observable<any>{
    return this.http.delete<any>(`${this.baseURL}/categories/${categoryID}`);
  }
}
