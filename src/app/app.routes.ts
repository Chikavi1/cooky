import { Routes } from '@angular/router';
import { CreateComponent } from './modules/reports/create/create.component';
import { ShowComponent } from './modules/reports/show/show.component';
import { IndexComponent } from './modules/partners/index/index.component';

export const routes: Routes = [
  { path: '', redirectTo: 'report', pathMatch: 'full' },
  { path: 'report', component: CreateComponent },
  { path: 'report/:code', component: ShowComponent },
  { path: 'partners', component: IndexComponent }
];

