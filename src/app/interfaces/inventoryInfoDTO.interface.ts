export interface InventoryInfoDTO{
    id:         string;
    category?:  string;
    unit:       string;
    name:       string;
    price:      number;
    stock:      number;
    date:       Date | null;
}