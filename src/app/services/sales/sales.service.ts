import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Sale } from '../../interfaces/sale.interface';
import { map, Observable } from 'rxjs';
import { SortDirection } from '@angular/material/sort';
import { SaleDetails } from '../../interfaces/saleDetails.interface';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient
  ) { }

  getSales(sort: string, order: SortDirection, page?: number): Observable<Sale[]>{
    if(!order && !sort){ order = 'desc'; sort = 'date' } //Se aplican para la primera vez que se obtienen los datos

    const params = new HttpParams()
      .set('_sort', sort)
      .set('_order', order)

    return this.http.get<Sale[]>(`${this.baseURL}/sales-info`, {params});
  }

  getSale(saleID: string): Observable<Sale>{
    return this.http.get<Sale[]>(`${this.baseURL}/sales?sale_id=${saleID}`).pipe(
      map(sales => sales[0]) // Se obtiene el primer elemento del array
    );
  }

  getSaleDetails(saleInfoID: string): Observable<SaleDetails[]>{
    return this.http.get<SaleDetails[]>(`${this.baseURL}/sale-detail?sale_id=${saleInfoID}`);
  }

  addSale(sale: Sale): Observable<Sale>{
    return this.http.post<Sale>(`${this.baseURL}/sales`, sale);
  }

  deleteSale(saleID: string): Observable<any>{
    return this.http.delete<any>(`${this.baseURL}/sales/${saleID}`);
  }
}
