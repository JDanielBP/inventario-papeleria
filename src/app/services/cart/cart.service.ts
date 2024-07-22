import { Injectable } from '@angular/core';
import { Cart } from '../../interfaces/cart.interface';
import { ItemInCart } from '../../interfaces/itemInCart.interface';
import { InventoryInfoDTO } from '../../interfaces/inventoryInfoDTO.interface';

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

  getItemFromCart(itemInfoDTO: InventoryInfoDTO): ItemInCart{
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfoDTO.id);
    return {
      inventory: itemInfoDTO,
      quantity: this._cart.products[itemPosition].quantity
    }
  }

  addItem(itemInfoDTO: InventoryInfoDTO): ItemInCart{
    let itemExist: ItemInCart | undefined = this.cart.products.find(product => product.inventory.id === itemInfoDTO.id);
    let itemInCart: ItemInCart;
    if(itemExist){
      let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfoDTO.id);
      
      if(itemExist.inventory.stock > 0){
        this.cart.products[itemPosition].quantity += 1;
        this.cart.products[itemPosition].inventory.stock -= 1;
        itemInfoDTO.stock
      }
      itemInCart = {
        inventory: itemInfoDTO,
        quantity: this.cart.products[itemPosition].quantity
      }
    }
    else{
      itemInCart = {
        inventory: itemInfoDTO,
        quantity: 1
      }
      this.cart.products.push(itemInCart);
      let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfoDTO.id);
      this.cart.products[itemPosition].inventory.stock -= 1;
    }
    this.cart.total = this.cart.total + itemInfoDTO.price;
    return itemInCart;
  }

  deleteItem(itemInfoDTO: InventoryInfoDTO){
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfoDTO.id);
    if(this.cart.products[itemPosition].quantity > 1){
      this.cart.products[itemPosition].quantity -= 1;
      this.cart.products[itemPosition].inventory.stock += 1;
      this.cart.total = this.cart.total - itemInfoDTO.price;
    }
  }

  removeItem(itemInfoDTO: InventoryInfoDTO){
    let itemPosition: number = this.cart.products.findIndex(product => product.inventory.id === itemInfoDTO.id);
    
    //Se devuelven todo el stock antes de eliminarlo del carrito
    this.cart.products[itemPosition].inventory.stock =
    this.cart.products[itemPosition].inventory.stock +
      this.cart.products[itemPosition].quantity

    this.cart.total = this.cart.total - (itemInfoDTO.price * this.cart.products[itemPosition].quantity);
    this.cart.products.splice(itemPosition, 1);
  }
}
