import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpenseListComponent } from './features/finances/expense-list/expense-list.component';
import { ShoppingListComponent } from './features/shopping/shopping-list/shopping-list.component';
import { ChoresBoardComponent } from './features/chores/chores-board/chores-board.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AuthInterceptor } from './auth/auth.interceptor';
import { OnboardingComponent } from './features/auth/onboarding/onboarding.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ToastComponent } from './shared/toast.component';
import { ConfirmComponent } from './shared/confirm.component';
import { PromptComponent } from './shared/prompt.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    RegisterComponent,
    BrowserModule,
    AppRoutingModule,
    LoginComponent,
    DashboardComponent,
    SettingsComponent,
    PromptComponent,
    ExpenseListComponent,
    ConfirmComponent,
    ShoppingListComponent,
    ChoresBoardComponent,
    OnboardingComponent,
    ToastComponent,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
