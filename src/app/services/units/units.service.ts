import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Unit } from '../../interfaces/unit.interface';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  private baseURL: string = environment.baseURL;

  constructor(
    private http: HttpClient
  ) { }

  getUnits(): Observable<Unit[]>{
    return this.http.get<Unit[]>(`${this.baseURL}/units`);
  }
}
