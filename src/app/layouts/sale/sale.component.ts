import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import autoTable from 'jspdf-autotable';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { jsPDF } from "jspdf";
import { MatButtonModule } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTable, MatTableModule } from '@angular/material/table';

import { CartService } from '../../services/cart/cart.service';
import { InventoryService } from '../../services/inventory/inventory.service';
import { SalesService } from '../../services/sales/sales.service';
import { IdGeneratorService } from '../../services/id-generator/id-generator.service';

import { Cart } from '../../interfaces/cart.interface';
import { InventoryInfo } from '../../interfaces/inventoryInfo.interface';
import { Sale } from '../../interfaces/sale.interface';
import { SaleDetails } from '../../interfaces/saleDetails.interface';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    InputTextModule ,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
})
export class SaleComponent {
  displayedColumns: string[] = ['name', 'quantity', 'price', 'subtotal', 'delete'];
  cart: Cart = {
    products: [],
    total: 0
  }
  dataSource = this.cart.products;
  tableColor = '#F6F6F6';

  @ViewChild(MatTable) table!: MatTable<InventoryInfo>;

  txtInput = new FormControl();
  customerName = new FormControl('', [Validators.maxLength(40)]);
  printReport = new FormControl(false);
  inventory: InventoryInfo[] = [];
  deleteItem: boolean = false;
  addItem: boolean = true;
  generatingNewSale: boolean = false;

  filteredInventory: InventoryInfo[] = [];
  dataTextEmpty: boolean = false;

  constructor(
    private inventoryService: InventoryService,
    private cartService: CartService,
    private _snackBar: MatSnackBar,
    private salesService: SalesService,
    private idGeneratorService: IdGeneratorService
  ){}

  get customerNameErrors() {
    return this.customerName.errors;
  }

  get customerNameMaxLength(): boolean {
    return this.customerName.invalid;
  }

  ngOnInit(){
    this.getInventory();
    this.cart = this.cartService._cart;
    this.updateCustomerNameState();
  }

  getInventory(){
    this.txtInput.setValue('');
    this.customerName.setValue('');
    this.inventoryService.getInventoryInfo('','')
      .subscribe(inventory => {
        this.inventory = inventory;
      })
  }

  updateCustomerNameState() {
    if (this.cart.products.length === 0) {
      this.customerName.setValue("");
      this.customerName.disable();
    } else {
      this.customerName.enable();
    }
  }

  search(e: AutoCompleteCompleteEvent){
    let filtered: InventoryInfo[] = [];
    let query = e.query;

    for (let i = 0; i < this.inventory.length; i++) {
        let item = this.inventory[i];
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
            filtered.push(item);
        }
    }
    this.filteredInventory = filtered;
  }

  addItemToCart(e: AutoCompleteSelectEvent){
    this.txtInput.setValue("");
    if(e.value.stock > 0){
      let itemOnTable = this.cartService.addItem(e.value);
      let dataExist = this.dataSource.find(item => item.inventory.id === itemOnTable.inventory.id);
      if(!dataExist)
        this.dataSource.push(itemOnTable)
      this.table.renderRows();
      this.updateCustomerNameState();
    }
    else{
      this._snackBar.open('No hay stock', 'Aceptar');
    }    
  }

  addItemToCartButton(item: InventoryInfo){
    if(item.stock > 0){
      this.cartService.addItem(item);
      this.table.renderRows();
    }
  }

  deleteItemFromCart(item: InventoryInfo){
    this.cartService.deleteItem(item);
    this.table.renderRows();
  }

  removeItemFromCart(item: InventoryInfo){
    this.cartService.removeItem(item);
    let itemPosition = this.dataSource.findIndex(itemOnTable => itemOnTable.inventory.id === item.id);
    this.dataSource.splice(itemPosition, 1);
    this.table.renderRows();
    this.updateCustomerNameState();
  }

  payment(){
    this.generatingNewSale = true;
    if(this.customerName.value)
      this.customerName.setValue(this.customerName.value.toUpperCase());
    let sale: Sale = {
      id: this.idGeneratorService.elevenCharacterID(),
      customer: this.customerName.value === '' ? '' : this.customerName.value!,
      total: this.cart.total,
      date: new Date(),
      saleDetail: []
    }

    let i = 0;
    this.cart.products.forEach(product => {
      let saleDetailOut: SaleDetails = {
        id: String(i++),
        inventoryID: product.inventory.id,
        quantity: product.quantity,
        price: product.inventory.price
      }
      sale.saleDetail!.push(saleDetailOut);
    });

    this.salesService.addSale(sale)
      .subscribe({
        error: err => console.error('Ocurrió un error al registrar la venta:', err),
        complete:() => {
          if(this.printReport.value){
            this.generateReport(sale);
          }
          this.generatingNewSale = false;
          this.cart.products = [];
          this.cart.total = 0;
          this.dataSource = [];
          this.getInventory();
          this.updateCustomerNameState();
          this.table.renderRows();
        }
      })
  }

  generateReport(sale: Sale){ //Se genera el reporte
    const date = `${sale.date!.getFullYear()}-${(sale.date!.getMonth() + 1).toString().padStart(2, '0')}-${(sale.date!.getDate()).toString().padStart(2, '0')} ${sale.date!.getHours().toString().padStart(2, '0')}:${sale.date!.getMinutes().toString().padStart(2, '0')}:${sale.date!.getSeconds().toString().padStart(2, '0')}`;
    const dateForPDF = `${sale.date!.getFullYear()}${(sale.date!.getMonth() + 1).toString().padStart(2, '0')}${(sale.date!.getDate()).toString().padStart(2, '0')}_${sale.date!.getHours().toString().padStart(2, '0')}${sale.date!.getMinutes().toString().padStart(2, '0')}${sale.date!.getSeconds().toString().padStart(2, '0')}`;
    const pdfName = `SALE_${dateForPDF}.pdf`;
    const doc = new jsPDF();

    doc.text(`Venta: ${sale.id}`, 15, 15);
    doc.text(`Fecha: ${date}`, doc.internal.pageSize.width - 85, 15);
    doc.text(`Cliente: ${this.customerName.value}`, 15, 25);

    const head = ['NOMBRE', 'CANTIDAD', 'PRECIO', 'SUBTOTAL'];
    const body = this.cart.products.map(product => [
      product.inventory.name,
      product.quantity,
      `$${product.inventory.price.toFixed(2)}`,
      `$${(product.inventory.price * product.quantity).toFixed(2)}`
    ]);
    const footer = ['', '','TOTAL:', `$${this.cart.total.toFixed(2)}`]

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

    const pdfBlobUrl = doc.output('bloburl');
    const newWindow = window.open(pdfBlobUrl);
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
  }
}
