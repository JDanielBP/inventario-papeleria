export interface Inventory{
    id:             string;
    categoryId?:    string;
    unitId:         string;
    name:           string;
    price?:         number;
    stock:          number;
    date:           Date | null;
}