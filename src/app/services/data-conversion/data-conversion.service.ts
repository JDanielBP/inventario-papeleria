import { Injectable } from '@angular/core';
import { UnitsService } from '../units/units.service';
import { CategoriesService } from '../categories/categories.service';
import { forkJoin, map, Observable } from 'rxjs';
import { Category } from '../../interfaces/category.interface';
import { Unit } from '../../interfaces/unit.interface';
import { InventoryInfoDTO } from '../../interfaces/inventoryInfoDTO.interface';
import { Inventory } from '../../interfaces/inventory.interface';

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {
  constructor(
    private categoriesService: CategoriesService,
    private unitsService: UnitsService
  ) { }

  inventoryInfoDTOToInventory(inventoryInfoDTO: InventoryInfoDTO): Observable<Inventory> {
    return forkJoin({
      category: this.categoriesService.getCategory(inventoryInfoDTO.category!),
      unit: this.unitsService.getUnit(inventoryInfoDTO.unit)
    }).pipe(
      map(results => {
        const category = results.category;
        const unit = results.unit;

        const inventory: Inventory = {
          id: inventoryInfoDTO.id,
          name: inventoryInfoDTO.name,
          categoryID: category.id,
          price: inventoryInfoDTO.price,
          stock: inventoryInfoDTO.stock,
          unitID: unit.id,
          date: inventoryInfoDTO.date
        };
        
        return inventory;
      })
    );
  }
}
