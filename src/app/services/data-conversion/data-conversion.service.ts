import { Injectable } from '@angular/core';
import { UnitsService } from '../units/units.service';
import { CategoriesService } from '../categories/categories.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Category } from '../../interfaces/category.interface';
import { Unit } from '../../interfaces/unit.interface';
import { InventoryInfo } from '../../interfaces/inventoryInfo.interface';
import { Inventory } from '../../interfaces/inventory.interface';

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {
  constructor(
    private categoriesService: CategoriesService,
    private unitsService: UnitsService
  ) { }

  inventoryInfoToInventory(inventoryInfo: InventoryInfo): Observable<Inventory> {
    return forkJoin({
      category: this.categoriesService.getCategory(inventoryInfo.category!),
      unit: this.unitsService.getUnit(inventoryInfo.unit)
    }).pipe(
      map(results => {
        const category = results.category;
        const unit = results.unit;

        const inventory: Inventory = {
          id: inventoryInfo.id,
          name: inventoryInfo.name,
          categoryID: category.id,
          price: inventoryInfo.price,
          stock: inventoryInfo.stock,
          unitID: unit.id,
          date: inventoryInfo.date
        };
        
        return inventory;
      })
    );
  }
}
