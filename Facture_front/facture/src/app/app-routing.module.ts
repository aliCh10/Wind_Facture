import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SystemComponent } from './system/system.component';
import { FactureComponent } from './facture/facture.component';
import { AuthGuard } from './services/auth.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component'; 
import { ProfileComponent } from './profile/profile.component';
import { EmployeeComponent } from './employee/employee.component';
import { ClientsComponent } from './clients/clients.component';
import { ServComponent } from './serv/serv.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [ 
      { path: 'home', component: HomeComponent,canActivate:[AuthGuard] },
      { path: 'facture', component: FactureComponent ,canActivate:[AuthGuard] },
      { path: 'system', component: SystemComponent ,canActivate:[AuthGuard] },
      { path: 'profile',component: ProfileComponent},
      { path: 'employee/:partnerId', component: EmployeeComponent },
      {path: 'clients' ,component: ClientsComponent,canActivate:[AuthGuard]},
      {path: 'services' ,component: ServComponent,canActivate:[AuthGuard]},


    ]
  },
  { path: '404', component: PageNotFoundComponent }, 
  { path: '**', redirectTo: '/404' } 
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }