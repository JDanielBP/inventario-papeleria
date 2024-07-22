import { ItemInCart } from "./itemInCart.interface";

export interface Cart {
    products:       ItemInCart[];
    total:          number;
}

