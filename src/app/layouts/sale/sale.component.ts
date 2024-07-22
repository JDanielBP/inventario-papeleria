import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTable, MatTableModule } from '@angular/material/table';

import { CartService } from '../../services/cart/cart.service';
import { InventoryService } from '../../services/inventory/inventory.service';
import { SalesService } from '../../services/sales/sales.service';

import { Cart } from '../../interfaces/cart.interface';
import { InventoryInfoDTO } from '../../interfaces/inventoryInfoDTO.interface';
import { Sale } from '../../interfaces/sale.interface';
import { SaleDetail } from '../../interfaces/saleDetail.interface';
import { IdGeneratorService } from '../../services/id-generator/id-generator.service';


@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CommonModule,
    InputTextModule ,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
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

  @ViewChild(MatTable) table!: MatTable<InventoryInfoDTO>;

  txtInput = new FormControl();
  customerName = new FormControl();
  inventory: InventoryInfoDTO[] = [];
  deleteItem: boolean = false;
  addItem: boolean = true;
  generatingNewSale: boolean = false;

  filteredInventory: InventoryInfoDTO[] = [];
  dataTextEmpty: boolean = false;

  constructor(
    private inventoryService: InventoryService,
    private cartService: CartService,
    private _snackBar: MatSnackBar,
    private salesService: SalesService,
    private idGeneratorService: IdGeneratorService
  ){}


  ngOnInit(){
    this.getInventory();
    this.cart = this.cartService._cart;
    this.updateCustomerNameState();
  }

  getInventory(){
    this.txtInput.setValue('');
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
    let filtered: InventoryInfoDTO[] = [];
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

  addItemToCartButton(item: InventoryInfoDTO){
    if(item.stock > 0){
      this.cartService.addItem(item);
      this.table.renderRows();
    }
  }

  deleteItemFromCart(item: InventoryInfoDTO){
    this.cartService.deleteItem(item);
    this.table.renderRows();
  }

  removeItemFromCart(item: InventoryInfoDTO){
    this.cartService.removeItem(item);
    let itemPosition = this.dataSource.findIndex(itemOnTable => itemOnTable.inventory.id === item.id);
    this.dataSource.splice(itemPosition, 1);
    this.table.renderRows();
    this.updateCustomerNameState();
  }

  payment(){
    this.generatingNewSale = true;

    let sale: Sale = {
      id: this.idGeneratorService.elevenCharacterID(),
      customer: this.customerName.value,
      total: this.cart.total,
      date: new Date(),
      saleDetail: []
    }

    let i = 0;
    this.cart.products.forEach(product => {
      let saleDetailOut: SaleDetail = {
        id: String(i++),
        inventoryID: product.inventory.id,
        quantity: product.quantity,
        price: product.inventory.price
      }
      sale.saleDetail.push(saleDetailOut);
    });

    this.salesService.addSale(sale)
      .subscribe({
        error: err => console.error('Ocurrió un error al registrar la venta:', err),
        complete:() => {
          this.generatingNewSale = false;
          this.cart.products = [];
          this.cart.total = 0;
          this.dataSource = [];
          this.getInventory();
          this.table.renderRows();
        }
      })
  }
}
