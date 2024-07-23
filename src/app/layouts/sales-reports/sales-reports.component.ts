import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Sale } from '../../interfaces/sale.interface';
import { ConfirmMsg } from '../../interfaces/confirm-msg.interface';

import autoTable from 'jspdf-autotable';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { jsPDF } from "jspdf";
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SalesService } from '../../services/sales/sales.service';

import { ConfirmComponent } from '../../components/modals/confirm/confirm.component';
import { ViewSaleComponent } from '../../components/modals/view-sale/view-sale.component';
import { merge, Observable, startWith, Subject, switchMap, takeUntil } from 'rxjs';


@Component({
  selector: 'app-sales-reports',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginator,
    MatProgressSpinner,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.scss'
})
export class SalesReportsComponent {
  displayedColumns: string[] = ['id', 'customer', 'total', 'date', 'actions'];
  dataSource: MatTableDataSource<Sale> = new MatTableDataSource<Sale>();
  tableColor = '#F6F6F6';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  txtInput = new FormControl();

  initSaleInfo: Sale = {
    id: "",
    customer: "",
    total: 0,
    date: null
  }
  selectedSaleInfo: Sale = {
    id: "",
    customer: "",
    total: 0,
    date: null
  }

  isLoadingResults = true;
  isRateLimitReached = false;
  dataError: boolean = false;
  dataTextEmpty: boolean = false;

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private SalesService: SalesService,
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
      switchMap(() => this.getSalesInfo())
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

  handleNext = (salesInfo: Sale[]) => {
    this.dataSource.data = salesInfo;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  handleNextValueChanges = (dataSourceInfo: Sale[]) => {
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

  getSalesInfo(): Observable<Sale[]>{
    this.dataSource.filter = '';
    this.txtInput.setValue('');
    return this.SalesService.getSales(
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

  functionOpenDialogViewSale(saleInfo: Sale){
    this.selectedSaleInfo = saleInfo;
    this.dialog.open(ViewSaleComponent, {
      data: this.selectedSaleInfo,
    });
  }

  functionOpenDialogDeleteSale(saleInfo: Sale){
    this.selectedSaleInfo = saleInfo;
    let deleteInventoryyMsg: ConfirmMsg = {
      title: `Cancelar la venta ""${this.selectedSaleInfo.id}""`,
      description: `¿Está seguro de cancelar la venta "${this.selectedSaleInfo.id}"? Los productos asociados a esta venta regresarán al stock`
    }

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: deleteInventoryyMsg,
    })

    dialogRef.afterClosed().subscribe(confirm => {
      if(confirm){
        this.isLoadingResults = true;
        this.SalesService.deleteSale(saleInfo.id)
        .pipe(
          takeUntil(this.unsubscribe$),
          switchMap(() => this.getSalesInfo())
        )
        .subscribe({
          error: this.handleError,
          next: this.handleNext,
          complete: this.handleComplete
        })
      }
    });
  }

  generateReport(print: boolean){
    const dateNow: Date = new Date();
    const date = `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, '0')}-${(dateNow.getDate()).toString().padStart(2, '0')} ${dateNow.getHours().toString().padStart(2, '0')}:${dateNow.getMinutes().toString().padStart(2, '0')}:${dateNow.getSeconds().toString().padStart(2, '0')}`;
    const dateForPDF = `${dateNow.getFullYear()}${(dateNow.getMonth() + 1).toString().padStart(2, '0')}${(dateNow.getDate()).toString().padStart(2, '0')}_${dateNow.getHours().toString().padStart(2, '0')}${dateNow.getMinutes().toString().padStart(2, '0')}${dateNow.getSeconds().toString().padStart(2, '0')}`;
    const pdfName = `SALE_REPORTS_${dateForPDF}.pdf`;
    const doc = new jsPDF();

    const text = 'REPORTE DE VENTAS';
    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor; //Ancho del texto
    const pageWidth = doc.internal.pageSize.width;
    const textX = (pageWidth - textWidth) / 2; // Posición centrada X

    doc.text(text, textX, 15);
    doc.text(`Fecha: ${date}`, 15, 30);

    const head = ['ID', 'CLIENTE', 'TOTAL', 'FECHA'];
    const body = this.dataSource.data.map(sale => [
      sale.id,
      sale.customer,
      `$${sale.total.toFixed(2)}`,
      `${sale.date}`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [head],
      body: body,
      headStyles: {
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' }
      },
    })

    if(print){
      const pdfBlobUrl = doc.output('bloburl');
      const newWindow = window.open(pdfBlobUrl);
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print();
        };
      }
    }
    else doc.save(pdfName);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
