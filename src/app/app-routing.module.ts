import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { SignupComponent } from './auth/components/signup/signup.component';
import { HomeComponent } from './sider/home/home.component';
import { LoginComponent } from './auth/components/login/login.component';
import { StorageService } from './auth/services/storage/storage.service';
import { AuthGuardService } from './auth/services/AuthGuard/auth-guard.service';
import { UnauthorizedComponent } from './auth/components/unauthorized/unauthorized.component';

const canActivateUser = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot, router: Router): boolean => {
  const userSession = StorageService.getUser();

  if (userSession && userSession.id) {
    return true; // User is logged in
  } else {
    router.navigate(['/login']); // Redirect to login if not authenticated
    return false;
  }
};

const routes: Routes = [
  {
    path:"",
    component:LoginComponent
  },
  {
    path:"home",
    component:HomeComponent
  },  
  {
    path:"signup",
    component:SignupComponent
  },
  {
    path:"login",
    component:LoginComponent
  },
  {
    path:"user",
    loadChildren:()=> import("./modules/User/user/user.module").then(e=>e.UserModule),
    canActivate: [AuthGuardService] // Use the guard here
  },
  {
    path:"unauthorized",
    component:UnauthorizedComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
