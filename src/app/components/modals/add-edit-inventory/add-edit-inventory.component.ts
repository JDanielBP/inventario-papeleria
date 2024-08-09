import { Component, Inject } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { CategoriesService } from '../../../services/categories/categories.service';
import { IdGeneratorService } from '../../../services/id-generator/id-generator.service';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { UnitsService } from '../../../services/units/units.service';

import { Category } from '../../../interfaces/category.interface';
import { Inventory } from '../../../interfaces/inventory.interface';
import { InventoryInfo } from '../../../interfaces/inventoryInfo.interface';
import { Unit } from '../../../interfaces/unit.interface';

import { forkJoin } from 'rxjs';
import { InventoryNameValidatorService } from '../../../validators/inventory-name-validator.service';


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
    categoryId: '',
    price: 0,
    stock: 0,
    unitId: '',
    date: null
  }
  sameInfoFlag: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {inventoryInfo: InventoryInfo, updatedData: boolean},
    public dialogRef: MatDialogRef<AddEditInventoryComponent>,
    private fb: FormBuilder,
    private idGeneratorService: IdGeneratorService,
    private inventoryService: InventoryService,
    private categoriesService: CategoriesService,
    private unitsService: UnitsService,
    private inventoryNameValidatorService: InventoryNameValidatorService
  ) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)], [this.inventoryNameValidatorService.validate]],
      categoryId: [''],
      price: ['', [Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      unitId: ['', [Validators.required, Validators.maxLength(30)]],
    }, {
      validators: [this.sameInformation()],
    } as AbstractControlOptions);
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
          this.inventoryService.getAnInventory(this.data.inventoryInfo.id)
            .subscribe(inventory => {
              this.inventory = inventory;
              this.inventoryNameValidatorService.originalName = this.inventory.name;

              if(this.inventory.id){ // En caso de haber un ID se actualiza el formulario, pues se trata de una edición
                this.myForm.setValue({
                  name: this.inventory.name,
                  categoryId: (this.inventory.categoryId == null ? '' : this.inventory.categoryId),
                  price: this.inventory.price,
                  stock: this.inventory.stock,
                  unitId: this.inventory.unitId
                })
              }
            });
      },
      error: error => {
        console.error('Error en categorías o unidades', error);
      }
    });
  }

  errorsInTheField(field: string){
    return this.myForm.controls[field].errors &&
           this.myForm.controls[field].touched;
  }

  sameInformation(): ValidationErrors | null {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const 
        name = formGroup.get('name')?.value,
        categoryId = formGroup.get('categoryId')?.value,
        price = formGroup.get('price')?.value,
        stock = formGroup.get('stock')?.value,
        unitId = formGroup.get('unitId')?.value
      ;
      
      let inventoryCategoryIdAux = this.inventory.categoryId
      if(inventoryCategoryIdAux === null)
        inventoryCategoryIdAux = '';

      if(
        this.inventory.name === name &&
        (this.inventory.categoryId === categoryId || inventoryCategoryIdAux === categoryId) &&
        this.inventory.price === price &&
        this.inventory.stock === stock &&
        this.inventory.unitId === unitId
      ){
        this.sameInfoFlag = true;
        return {sameInfo: true}
      }
      this.sameInfoFlag = false;
      return null;
    }
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

  get inventoryNameErrorMsgAsync(): string{
    const errors = this.myForm.get('name')?.errors;
    if(errors?.['inventoryNameTaken']){
        return `El inventario con el nombre "${this.myForm.get('name')!.value}" ya se encuentra registrado`;
    }
    return '';
  }

  validateInteger(event: Event): void { //Evita colocar decimales y números negativos, pues solo deja ingresar números y nada más
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
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