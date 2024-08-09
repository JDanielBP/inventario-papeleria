import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Inventory } from '../interfaces/inventory.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryNameValidatorService {
  private baseURL: string = environment.baseURL;
  public originalName: string = '';

  constructor(
    private http: HttpClient,
  ) { }

  validate = (control: AbstractControl<any, any>): Observable<ValidationErrors | null> => {
    return this.http.get<Inventory[]>(`${this.baseURL}/inventory/validate/${control.value}`)
      .pipe(
        map(resp => {
          return (resp.length === 0 || resp[0]?.name === this.originalName) ? null : {inventoryNameTaken:true};
        })
      )
  }
}
