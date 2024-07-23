import { Route } from "@angular/router";
import { CategoriesComponent } from "./categories/categories.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { SidenavComponent } from "./sidenav/sidenav.component";
import { SaleComponent } from "./sale/sale.component";
import { SalesReportsComponent } from "./sales-reports/sales-reports.component";

export default [
  {
    path: '',
    component: SidenavComponent,
    children: [
      { path: 'categorias', component: CategoriesComponent },
      { path: 'inventario', component: InventoryComponent },
      { path: 'ventas', component: SaleComponent },
      { path: 'reportes-de-ventas', component: SalesReportsComponent },
      { path: '**', redirectTo: 'inventario'}
    ]
  }
] as Route[];
