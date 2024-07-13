import { Component, ViewChild } from '@angular/core';

import { Inventory } from '../../interfaces/inventory.interface';
import { AddEditInventoryComponent } from '../../components/modals/add-edit-inventory/add-edit-inventory.component';

import { InventoryService } from '../../services/inventory/inventory.service';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { merge, Observable, startWith, Subject, switchMap, takeUntil} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmComponent } from '../../components/modals/confirm/confirm.component';
import { ConfirmMsg } from '../../interfaces/confirm-msg.interface';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
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
  providers: [InventoryService],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
  displayedColumns: string[] = ['id', 'name', 'stock', 'unit', 'category', 'price', 'date', 'actions'];
  dataSource: MatTableDataSource<Inventory> = new MatTableDataSource<Inventory>();
  tableColor = '#F6F6F6'

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  txtInput = new FormControl();

  initInventory: Inventory = {
    id: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    unit: '',
    date: null
  }
  selectedInventory: Inventory = {
    id: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    unit: '',
    date: null
  }

  isLoadingResults = true;
  isRateLimitReached = false;
  dataError: boolean = false;
  dataTextEmpty: boolean = false;

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private inventoryService: InventoryService,
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
      switchMap(() => this.getInventory())
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

  handleNext = (inventory: Inventory[]) => {
    this.dataSource.data = inventory;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  handleNextValueChanges = (dataSourceInfo: Inventory[]) => {
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

  getInventory(): Observable<Inventory[]>{
    this.dataSource.filter = '';
    this.txtInput.setValue('');
    return this.inventoryService.getInventory(
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

  functionOpenDialogAddInventory(){
    let updatedData: boolean = false;
    this.selectedInventory = this.initInventory;
    const dialogRef = this.dialog.open(AddEditInventoryComponent, {
      data: {
        inventory: this.selectedInventory,
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data && data.updatedData) {
        this.loadingInventory();
      }
    });
  }

  functionOpenDialogEditInventory(inventory: Inventory){
    let updatedData: boolean = false;
    this.selectedInventory = inventory;
    const dialogRef = this.dialog.open(AddEditInventoryComponent, {
      data: {
        inventory: this.selectedInventory,
        updatedData: updatedData
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data && data.updatedData) {
        this.loadingInventory();
      }
    });
  }

  loadingInventory(){
    this.isLoadingResults = true;

    this.inventoryService.getInventory(
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

  functionOpenDialogDeleteInventory(inventory: Inventory){
    this.selectedInventory = inventory;
    let deleteInventoryyMsg: ConfirmMsg = {
      title: `Eliminar "${this.selectedInventory.name}" del inventario`,
      description: `¿Está seguro de eliminar del inventario ${this.selectedInventory.name}?`
    }

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: deleteInventoryyMsg,
    })

    dialogRef.afterClosed().subscribe(confirm => {
      if(confirm){
        this.isLoadingResults = true;
        this.inventoryService.deleteInventory(this.selectedInventory.id)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap(() => this.getInventory())
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