import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { CalPageComponent } from './pages/cal-page/cal-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: 'calendar', component: CalPageComponent }
    ]
  }
];
