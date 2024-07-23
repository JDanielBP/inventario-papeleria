import { Injectable } from '@angular/core';
import { Cart } from '../../interfaces/cart.interface';
import { ItemInCart } from '../../interfaces/itemInCart.interface';
import { InventoryInfo } from '../../interfaces/inventoryInfo.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: Cart = {
    products: [],
    total: 0,
  }

  get _cart(){
    return this.cart;
  }

  constructor() { }

  getItemFromCart(itemInfo: InventoryInfo): ItemInCart{
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfo.id);
    return {
      inventory: itemInfo,
      quantity: this._cart.products[itemPosition].quantity
    }
  }

  addItem(itemInfo: InventoryInfo): ItemInCart{
    let itemExist: ItemInCart | undefined = this.cart.products.find(product => product.inventory.id === itemInfo.id);
    let itemInCart: ItemInCart;
    if(itemExist){
      let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfo.id);
      
      if(itemExist.inventory.stock > 0){
        this.cart.products[itemPosition].quantity += 1;
        this.cart.products[itemPosition].inventory.stock -= 1;
        itemInfo.stock
      }
      itemInCart = {
        inventory: itemInfo,
        quantity: this.cart.products[itemPosition].quantity
      }
    }
    else{
      itemInCart = {
        inventory: itemInfo,
        quantity: 1
      }
      this.cart.products.push(itemInCart);
      let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfo.id);
      this.cart.products[itemPosition].inventory.stock -= 1;
    }
    this.cart.total = this.cart.total + itemInfo.price;
    return itemInCart;
  }

  deleteItem(itemInfo: InventoryInfo){
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfo.id);
    if(this.cart.products[itemPosition].quantity > 1){
      this.cart.products[itemPosition].quantity -= 1;
      this.cart.products[itemPosition].inventory.stock += 1;
      this.cart.total = this.cart.total - itemInfo.price;
    }
  }

  removeItem(itemInfo: InventoryInfo){
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfo.id);
    
    //Se devuelven todo el stock antes de eliminarlo del carrito
    this.cart.products[itemPosition].inventory.stock =
    this.cart.products[itemPosition].inventory.stock +
      this.cart.products[itemPosition].quantity

    this.cart.total = this.cart.total - (itemInfo.price * this.cart.products[itemPosition].quantity);
    this.cart.products.splice(itemPosition, 1);
  }
}
