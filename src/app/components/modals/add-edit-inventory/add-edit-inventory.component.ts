import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { CategoriesService } from '../../../services/categories/categories.service';
import { IdGeneratorService } from '../../../services/id-generator/id-generator.service';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { UnitsService } from '../../../services/units/units.service';

import { Category } from '../../../interfaces/category.interface';
import { Inventory } from '../../../interfaces/inventory.interface';
import { InventoryInfoDTO } from '../../../interfaces/inventoryInfoDTO.interface';
import { Unit } from '../../../interfaces/unit.interface';

import { forkJoin } from 'rxjs';
import { DataConversionService } from '../../../services/data-conversion/data-conversion.service';


@Component({
  selector: 'app-add-edit-inventory',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-edit-inventory.component.html',
  styleUrl: './add-edit-inventory.component.scss'
})
export class AddEditInventoryComponent {
  newInventory: boolean = true;
  myForm!: FormGroup;
  categories: Category[] = [];
  units: Unit[] = [];
  inventory: Inventory = {
    id: '',
    name: '',
    categoryID: '',
    price: 0,
    stock: 0,
    unitID: '',
    date: null
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {inventoryInfo: InventoryInfoDTO, updatedData: boolean},
    public dialogRef: MatDialogRef<AddEditInventoryComponent>,
    private fb: FormBuilder,
    private idGeneratorService: IdGeneratorService,
    private inventoryService: InventoryService,
    private categoriesService: CategoriesService,
    private unitsService: UnitsService,
    private dataConversionService: DataConversionService
  ) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      categoryID: [''],
      price: ['', [Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      unitID: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    forkJoin({
      categories: this.categoriesService.getCategories('',''),
      units: this.unitsService.getUnits()
    }).subscribe({
      next: results => {
        this.categories = results.categories;
        this.units = results.units;

        if(this.data.inventoryInfo)
          this.dataConversionService.inventoryInfoDTOToInventory(this.data.inventoryInfo)
            .subscribe(inventory => {
              this.inventory = inventory;

              if(this.inventory.id){ // En caso de haber un ID se actualiza el formulario, pues se trata de una edición
                this.myForm.setValue({
                  name: this.inventory.name,
                  categoryID: this.inventory.categoryID,
                  price: this.inventory.price,
                  stock: this.inventory.stock,
                  unitID: this.inventory.unitID
                })
              }

            });
      },
      error: error => {
        console.error('Error fetching categories or units', error);
      }
    });
  }

  errorsInTheField(field: string){
    return this.myForm.controls[field].errors &&
           this.myForm.controls[field].touched;
  }

  getErrorMessage(fieldName: string): string {
    const errors = this.myForm.get(fieldName)?.errors;
    if(errors?.['required']){
      return 'El campo es obligatorio';
    }
    if(errors?.['maxlength']){
      return 'El dato ingresado supera el límite de caracteres permitidos para este campo';
    }
    if(errors?.['min']){
      return 'Ingresa una cantidad mayor a 0';
    }
    return '';
  }

  registerInventory(){
    if(this.myForm.valid){
      this.data.updatedData = true;
      if(this.inventory.id){ //Actualización de inventario

        const createdDate = this.inventory.date;
        const id = this.inventory.id;
        this.inventory = this.myForm.value;
        this.inventory.id = id;
        this.inventory.date = createdDate;

        this.inventoryService.updateInventory(this.inventory)
          .subscribe({
            error: err => console.error('Ocurrió un error al actualizar el dato:', err),
            complete:() => this.dialogRef.close(this.data)
          })
      }
      else{ //Creación de nuevo inventario
        this.inventory = this.myForm.value;
        this.inventory.id = this.idGeneratorService.elevenCharacterID();
        this.inventory.date = new Date;

        this.inventoryService.addInventory(this.inventory)
          .subscribe({
            error: err => console.error('Ocurrió un error al registrar el dato:', err),
            complete:() => this.dialogRef.close(this.data)
          });
      }
    }
    else{
      this.myForm.markAllAsTouched();
    }
  }
}