import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop'; // Add this import

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './home/home.component';
import { ToastrModule } from 'ngx-toastr'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SystemComponent } from './system/system.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';  
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { SidebarComponent } from './components/sidebar/sidebar.component'; 
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';


// Modules PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DrawerModule } from 'primeng/drawer';
import { MatCardModule } from '@angular/material/card';
import { NavComponent } from './components/nav/nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FactureComponent } from './facture/facture.component';
import { LayoutComponent } from './components/layout/layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { MatInputModule } from '@angular/material/input';
import { EmployeeComponent } from './employee/employee.component';
import { DynamicModalComponent } from './components/dynamic-modal/dynamic-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PhonePipe } from './shared/pipes/phone.pipe';
import { UpdateEmployeeModalComponent } from './components/update-employee-modal/update-employee-modal.component';
import { ClientsComponent } from './clients/clients.component';
import { UpdateClientModalComponent } from './components/update-client-modal/update-client-modal.component';
import { ServComponent } from './serv/serv.component';
import { UpdateServiceModalComponent } from './components/update-service-modal/update-service-modal.component';
import { LogoComponent } from './components/Sections/logo/logo.component';
import { InfoClientComponent } from './components/Sections/info-client/info-client.component';
import { OptionsComponent } from './components/Sections/options/options.component';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { InfoCompanyComponent } from './components/Sections/info-company/info-company.component';
import { CalendarComponent } from './components/Sections/calendar/calendar.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TableComponent } from './components/Sections/table/table.component';
import { FooterComponent } from './components/Sections/footer/footer.component';
import { NewFactureComponent } from './list-models/new-facture.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxMatColorPickerModule } from 'ngx-mat-color-picker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CustomMatPaginatorIntlService } from './services/custom-mat-paginator-intl.service';
import { CreeFactureComponent } from './components/cree-facture/cree-facture.component';
import { MatStepperModule } from '@angular/material/stepper';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { MatGridListModule } from '@angular/material/grid-list';
import { PasswordChangeDialogComponent } from './components/password-change-dialog/password-change-dialog.component';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SystemComponent,
    LanguageSwitcherComponent,
    SidebarComponent,
    NavComponent,
    FactureComponent,
    LayoutComponent,
    ToolbarComponent,
    PageNotFoundComponent,
    ProfileComponent,
    EmployeeComponent,
    DynamicModalComponent,
    PhonePipe,
    UpdateEmployeeModalComponent,
    ClientsComponent,
    UpdateClientModalComponent,
    ServComponent,
    UpdateServiceModalComponent,
    LogoComponent,
    InfoClientComponent,
    OptionsComponent,
    InfoCompanyComponent,
    CalendarComponent,
    TableComponent,
    FooterComponent,
    NewFactureComponent,
    CreeFactureComponent,
    SafeHtmlPipe,
    PasswordChangeDialogComponent,
  ],
  imports: [
    MatInputModule,   
    ReactiveFormsModule,
    AuthModule,
    BrowserModule,
    DragDropModule, 
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatChipsModule,
    MatGridListModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    FileUploadModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCardModule,
    MatTableModule,
    MatToolbarModule,
    MatSortModule,
    MatDatepickerModule,
    MatDialogModule,
    ToastModule,
    MatProgressSpinnerModule,
    ToolbarModule,
    SplitButtonModule,
    MatSelectModule,
    MatStepperModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatExpansionModule,
    NgxMatColorPickerModule,
    DrawerModule,
    FontAwesomeModule,
    FormsModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntlService },
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }