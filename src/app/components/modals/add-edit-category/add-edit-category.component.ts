import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Category } from '../../../interfaces/category.interface';
import { AddEditInventoryComponent } from '../add-edit-inventory/add-edit-inventory.component';
import { IdGeneratorService } from '../../../services/id-generator/id-generator.service';
import { CategoriesService } from '../../../services/categories/categories.service';
import { CategoryNameValidatorService } from '../../../validators/category-name-validator.service';

@Component({
  selector: 'app-add-edit-category',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-edit-category.component.html',
  styleUrl: './add-edit-category.component.scss'
})
export class AddEditCategoryComponent {
  myForm!: FormGroup;
  sameInfoFlag: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {category: Category, updatedData: boolean},
    public dialogRef: MatDialogRef<AddEditInventoryComponent>,
    private fb: FormBuilder,
    private idGeneratorService: IdGeneratorService,
    private categoryService: CategoriesService,
    private categoryNameValidatorService: CategoryNameValidatorService
  ) {}

  ngOnInit(): void {
    if(this.data.category.id){
      this.myForm = this.fb.group({
        name: [this.data.category.name, [Validators.required, Validators.maxLength(60)], [this.categoryNameValidatorService.validate]],
      })
    }
    else{
      this.myForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(60)], [this.categoryNameValidatorService.validate]],
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
    return '';
  }

  get categoryErrorMsgAsync(): string{
    const errors = this.myForm.get('name')?.errors;
    if(errors?.['categoryTaken']){
      return `La categoría "${this.myForm.get('name')!.value}" ya se encuentra registrada`;
    }
    return '';
  }

  registerCategory(){
    if(this.myForm.valid){
      this.data.updatedData = true;
      if(this.data.category.id){ //Actualización de inventario
        const id = this.data.category.id;
        this.data.category = this.myForm.value;
        this.data.category.id = id;

        this.categoryService.updateCategory(this.data.category)
          .subscribe({
            error: err => console.error('Ocurrió un error al actualizar el dato:', err),
            complete:() => this.dialogRef.close(this.data)
          })
      }
      else{ //Creación de nuevo inventario
        this.data.category = this.myForm.value;
        this.data.category.id = this.idGeneratorService.elevenCharacterID();

        this.categoryService.addCategory(this.data.category)
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
