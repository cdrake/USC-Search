import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  {path: '', component: SearchComponent},
  {path: 'results', component: SearchResultsComponent},
  {path: 'item/:key/:collection/:id', component: ItemDetailComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
