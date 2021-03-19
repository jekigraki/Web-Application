import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { AdminComponent } from './admin/admin.component';
import { PreduzeceComponent } from './preduzece/preduzece.component';
import { PoljoprivrednikComponent } from './poljoprivrednik/poljoprivrednik.component';
import { ShopComponent } from './shop/shop.component';
import { DetaljanPrikazComponent } from './detaljan-prikaz/detaljan-prikaz.component';
import { StepsComponent } from './steps/steps.component';
import { PromenaLozinkeComponent } from './promena-lozinke/promena-lozinke.component';
import { PoslovanjeComponent } from './poslovanje/poslovanje.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'poljoprivrednik', component: PoljoprivrednikComponent },
  { path: 'preduzece', component: PreduzeceComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'detaljanPrikaz', component: DetaljanPrikazComponent },
  { path: 'dodajProizvod', component: StepsComponent},
  {path: 'promenaLozinke', component: PromenaLozinkeComponent},
  {path: 'poslovanje', component: PoslovanjeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
