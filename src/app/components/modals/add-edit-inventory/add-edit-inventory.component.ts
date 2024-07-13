import { Component, Inject } from '@angular/core';

import { Inventory } from '../../../interfaces/inventory.interface';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory/inventory.service';
import { IdGeneratorService } from '../../../services/id-generator/id-generator.service';
import { CategoriesService } from '../../../services/categories/categories.service';
import { Category } from '../../../interfaces/category.interface';


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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {inventory: Inventory, updatedData: boolean},
    public dialogRef: MatDialogRef<AddEditInventoryComponent>,
    private fb: FormBuilder,
    private idGeneratorService: IdGeneratorService,
    private inventoryService: InventoryService,
    public categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.categoriesService.getCategoriesSimpleWay().subscribe(categories => {
      this.categories = categories;
    });
    
    if(this.data.inventory.id){
      this.myForm = this.fb.group({
        name: [this.data.inventory.name, [Validators.required, Validators.maxLength(60)]],
        category: [this.data.inventory.category],
        price: [this.data.inventory.price, [Validators.min(0)]],
        stock: [this.data.inventory.stock, [Validators.required, Validators.min(0)]],
        unit: [this.data.inventory.unit, [Validators.required, Validators.maxLength(30)]],
      })
    }
    else{
      this.myForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(60)]],
        category: [''],
        price: ['', [Validators.min(0)]],
        stock: ['', [Validators.required, Validators.min(0)]],
        unit: ['', [Validators.required, Validators.maxLength(30)]],
      })
    }    
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
      if(this.data.inventory.id){ //Actualización de inventario
        const createdDate = this.data.inventory.date;
        const id = this.data.inventory.id;
        this.data.inventory = this.myForm.value;
        this.data.inventory.id = id;
        this.data.inventory.date = createdDate;

        this.inventoryService.updateInventory(this.data.inventory)
          .subscribe({
            error: err => console.error('Ocurrió un error al actualizar el dato:', err),
            complete:() => this.dialogRef.close(this.data)
          })
      }
      else{ //Creación de nuevo inventario
        this.data.inventory = this.myForm.value;
        this.data.inventory.id = this.idGeneratorService.elevenCharacterID();
        this.data.inventory.date = new Date;

        this.inventoryService.addInventory(this.data.inventory)
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
