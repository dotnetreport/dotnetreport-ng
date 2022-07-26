import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DotnetreportComponent } from './dotnetreport/dotnetreport.component';

const routes: Routes = [
  { path: 'dotnetreport', component: DotnetreportComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
