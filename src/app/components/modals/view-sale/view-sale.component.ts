import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';

import autoTable from 'jspdf-autotable';
import { jsPDF } from "jspdf";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Sale } from '../../../interfaces/sale.interface';
import { SaleDetails } from '../../../interfaces/saleDetails.interface';

import { SalesService } from '../../../services/sales/sales.service';

@Component({
  selector: 'app-view-sale',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './view-sale.component.html',
  styleUrl: './view-sale.component.scss'
})
export class ViewSaleComponent {
  dialogRef = inject(MatDialogRef<ViewSaleComponent>);
  displayedColumns: string[] = ['name', 'quantity', 'price', 'subtotal'];
  dataSource: MatTableDataSource<SaleDetails> = new MatTableDataSource<SaleDetails>();
  tableColor = '#F6F6F6';

  saleDetails: SaleDetails[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Sale,
    private salesService: SalesService
  ){}

  ngOnInit(): void {
    this.salesService.getSaleDetailById(this.data.id)
      .subscribe(saleDetail => {
        this.saleDetails = saleDetail;
        this.dataSource.data = this.saleDetails;
      })
  }

  generateReport(print: boolean){
    let sale = this.data;
    let saleDate: Date = new Date(sale.date!)
    
    const date = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}-${(saleDate.getDate()).toString().padStart(2, '0')} ${saleDate.getHours().toString().padStart(2, '0')}:${saleDate.getMinutes().toString().padStart(2, '0')}:${saleDate.getSeconds().toString().padStart(2, '0')}`;
    const dateForPDF = `${saleDate.getFullYear()}${(saleDate.getMonth() + 1).toString().padStart(2, '0')}${(saleDate.getDate()).toString().padStart(2, '0')}_${saleDate.getHours().toString().padStart(2, '0')}${saleDate!.getMinutes().toString().padStart(2, '0')}${saleDate.getSeconds().toString().padStart(2, '0')}`;
    const pdfName = `SALE_${dateForPDF}.pdf`;
    const doc = new jsPDF();

    doc.text(`Venta: ${sale.id}`, 15, 15);
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width - 85, 15);
    if(sale.customer)
      doc.text(`Cliente: ${sale.customer}`, 15, 25);

    const head = ['NOMBRE', 'CANTIDAD', 'PRECIO', 'SUBTOTAL'];
    const body = this.saleDetails.map(product => [
      product.inventoryName!,
      product.quantity,
      `$${product.price.toFixed(2)}`,
      `$${(product.price * product.quantity).toFixed(2)}`
    ]);
    const footer = ['', '','TOTAL:', `$${sale.total.toFixed(2)}`]

    autoTable(doc, {
      startY: 30,
      head: [head],
      body: body,
      foot: [footer],
      headStyles: {
        halign: 'center'
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      footStyles: {
        halign: 'right'
      }
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
}
