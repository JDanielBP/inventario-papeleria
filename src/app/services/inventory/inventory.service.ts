import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InventoryInfo } from '../../interfaces/inventoryInfo.interface';
import { SortDirection } from '@angular/material/sort';
import { Inventory } from '../../interfaces/inventory.interface';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient,
  ) {}

  getInventory(sort: string, order: SortDirection, page?: number):Observable<Inventory[]>{
    if(!order && !sort){ order = 'desc'; sort = 'date' } //Se aplican para la primera vez que se obtienen los datos

    const params = new HttpParams()
      .set('_sort', sort)
      .set('_order', order)

    return this.http.get<Inventory[]>(`${this.baseURL}/inventory`, {params})
  }

  getInventoryInfo(sort: string, order: SortDirection, page?: number):Observable<InventoryInfo[]>{
    if(!order && !sort){ order = 'desc'; sort = 'date' } //Se aplican para la primera vez que se obtienen los datos

    const params = new HttpParams()
      .set('_sort', sort)
      .set('_order', order)

    return this.http.get<InventoryInfo[]>(`${this.baseURL}/inventoryInfo`, {params})
  }

  addInventory(inventory: Inventory): Observable<Inventory>{
    return this.http.post<Inventory>(`${this.baseURL}/inventory`, inventory);
  }

  updateInventory(inventory: Inventory): Observable<Inventory>{
    return this.http.put<Inventory>(`${this.baseURL}/inventory/${inventory.id}`, inventory);
  }

  deleteInventory(inventory: string): Observable<any>{
    return this.http.delete<any>(`${this.baseURL}/inventory/${inventory}`);
  }
}
