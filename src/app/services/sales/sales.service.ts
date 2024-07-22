import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Sale } from '../../interfaces/sale.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient
  ) { }

  getSales(): Observable<Sale[]>{
    return this.http.get<Sale[]>(`${this.baseURL}/sales`);
  }

  getSale(saleID: string): Observable<Sale>{
    return this.http.get<Sale[]>(`${this.baseURL}/sales?id=${saleID}`).pipe(
      map(sales => sales[0]) // Se obtiene el primer elemento del array
    );
  }

  addSale(sale: Sale): Observable<Sale>{
    return this.http.post<Sale>(`${this.baseURL}/sales`, sale);
  }

  deleteSale(saleID: string): Observable<any>{
    return this.http.delete<any>(`${this.baseURL}/sales/${saleID}`);
  }
}
