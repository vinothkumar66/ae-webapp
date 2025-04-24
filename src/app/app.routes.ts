import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ExportDataComponent } from './export-data/export-data.component';
import { ReportsViewerComponent } from './reports-viewer/reports-viewer.component';
import { PagesViewerComponent } from './pages-viewer/pages-viewer.component';
import { HierarchyComponent } from './hierarchy/hierarchy.component';
import { QuickAccessComponent } from './quick-access/quick-access.component';
import { RealtimeViewerComponent } from './realtime-viewer/realtime-viewer.component';
import { AnalyticViewerComponent } from './analytic-viewer/analytic-viewer.component';
import { MainlayoutComponent } from './shared/mainlayout/mainlayout.component';
import { AnalyticControlComponent } from './analytic-control/analytic-control.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AnalysisSettingsComponent } from './analysis-settings/analysis-settings.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainlayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'export', component: ExportDataComponent },
      { path: 'reports', component: ReportsViewerComponent },
      { path: 'pages', component: PagesViewerComponent },
      { path: 'hierarchy', component: HierarchyComponent },
      { path: 'quickaccess', component: QuickAccessComponent },
      { path: 'realtime', component: RealtimeViewerComponent },
      { path: 'analytic', component: AnalyticViewerComponent },
      { path: 'analytic-control', component: AnalyticControlComponent },
      { path: 'general-settings', component: GeneralSettingsComponent },
      { path: 'analysis-settings', component: AnalysisSettingsComponent },
    ]
  }
];
