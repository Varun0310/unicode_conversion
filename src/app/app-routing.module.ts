import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { SignupComponent } from './signup/signup.component';

import { CustomerFormComponent } from './customer-form/customer-form.component';
import { FinanceComponent } from './finance/finance.component';
import { AadhaarFormComponent } from './aadhaar-form/aadhaar-form.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'customer-form',
    component: CustomerFormComponent,
  },
  {
    path: 'finance/:userId',
    component: FinanceComponent,
  },
  {
    path: 'aadhaar-form/:userId',
    component: AadhaarFormComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
