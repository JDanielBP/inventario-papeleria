import { ItemInCart } from "./itemInCart.interface";

export interface Cart {
    id:             number;
    products:       ItemInCart[];
    total:          number;
}

