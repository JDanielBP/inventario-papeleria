import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Category } from '../../interfaces/category.interface';
import { confirmMsg } from '../../../../../angular-pos-system/src/app/interfaces/confirm-msg.interface';

import { CategoriesService } from '../../services/categories/categories.service';

import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Observable, Subject, merge, startWith, switchMap, takeUntil } from 'rxjs';

import { AddEditCategoryComponent } from '../../components/modals/add-edit-category/add-edit-category.component';
import { ConfirmComponent } from '../../components/modals/confirm/confirm.component';


@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginator,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Category> = new MatTableDataSource<Category>();
  tableColor = '#F6F6F6'

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  txtInput = new FormControl();

  initCategory: Category = {
    id: '',
    name: ''
  }
  selectedCategory: Category = {
    id: '',
    name: ''
  }
  isLoadingResults = true;
  isRateLimitReached = false;
  dataError: boolean = false;
  dataTextEmpty: boolean = false;

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private categoryService: CategoriesService,
    public dialog: MatDialog,
  ){}

  ngAfterViewInit(): void {
    this.sort.sortChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      takeUntil(this.unsubscribe$),
      startWith({}),
      switchMap(() => this.getCategories())
    )
    .subscribe({
      error: this.handleError,
      next: this.handleNextValueChanges
    });
  }

  handleError = (err: Error) => {
    this.dataError = true;
    this.isLoadingResults = false;
    console.error(err);
  }

  handleNext = (categories: Category[]) => {
    this.dataSource.data = categories;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  handleNextValueChanges = (dataSourceInfo: Category[]) => {
    this.dataSource.data = dataSourceInfo;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataTextEmpty = (this.dataSource.data.length <= 0);
    this.isLoadingResults = false;
  }

  handleComplete = () => {
    this.dataTextEmpty = (this.dataSource.data.length <= 0);
    this.isLoadingResults = false;
  }

  getCategories(): Observable<Category[]>{
    this.dataSource.filter = '';
    this.txtInput.setValue('');
    return this.categoryService.getCategories(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
    )
  }

  applySearchByText(e: KeyboardEvent){
    const filterValue = (e.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if(this.dataSource.paginator){
      this.dataSource.paginator.firstPage();
    }
  }

  resetSearchByText(){
    this.txtInput.setValue('');
    this.dataSource.filter = '';

    if(this.dataSource.paginator){
      this.dataSource.paginator.firstPage();
    }
  }

  functionOpenDialogAddCategory(){
    this.selectedCategory = this.initCategory;
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      data: {
        category: this.selectedCategory,
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data && data.updatedData) {
        this.loadingCategories();
      }
    });
  }

  functionOpenDialogEditCategory(category: Category){
    let updatedData: boolean = false;
    this.selectedCategory = category;
    const dialogRef = this.dialog.open(AddEditCategoryComponent, {
      data: {
        category: this.selectedCategory,
        updatedData: updatedData
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data && data.updatedData) {
        this.loadingCategories();
      }
    });
  }

  loadingCategories(){
    this.isLoadingResults = true;

    this.categoryService.getCategories(
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
    )
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      error: this.handleError,
      next: this.handleNext,
      complete: this.handleComplete
    })
  }

  functionOpenDialogDeleteCategory(category: Category){
    this.selectedCategory = category;
    let deleteInventoryyMsg: confirmMsg = {
      title: `Eliminar categoría "${this.selectedCategory.name}"`,
      description: `¿Está seguro de eliminar la categoría "${this.selectedCategory.name}"? Los productos ligados a esta categoría pasarán a estan en la sección "Sin Categoría"`
    }

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: deleteInventoryyMsg,
    })

    dialogRef.afterClosed().subscribe(confirm => {
      if(confirm){
        this.isLoadingResults = true;
        this.categoryService.deleteCategory(this.selectedCategory.id)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap(() => this.getCategories())
        )
        .subscribe({
          error: this.handleError,
          next: this.handleNext,
          complete: this.handleComplete
        })
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
