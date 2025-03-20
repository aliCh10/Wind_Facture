import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SystemComponent } from './system/system.component';
import { FactureComponent } from './facture/facture.component';
import { AuthGuard } from './services/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,  
    canActivate: [AuthGuard],
    children: [  // Définition des sous-routes
      { path: 'home', component: HomeComponent },
      { path: 'facture', component: FactureComponent },
      { path: 'system', component: SystemComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
