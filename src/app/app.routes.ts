import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ExportDataComponent } from './export-data/export-data.component';
import { ReportsViewerComponent } from './reports-viewer/reports-viewer.component';
import { PagesViewerComponent } from './pages-viewer/pages-viewer.component';
import { HierarchyComponent } from './hierarchy/hierarchy.component';
import { QuickAccessComponent } from './quick-access/quick-access.component';
import { AnalyticViewerComponent } from './analytic-viewer/analytic-viewer.component';
import { MainlayoutComponent } from './shared/mainlayout/mainlayout.component';
import { AnalyticControlComponent } from './analytic-control/analytic-control.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AnalysisSettingsComponent } from './analysis-settings/analysis-settings.component';
import { RealtimeeComponent } from './realtimee/realtimee.component';
import { RealtimeControlComponent } from './realtime-control/realtime-control.component';
import { RealtimeViewerComponent } from './realtime-viewer/realtime-viewer.component';
import { AnalyticViewerNewComponent } from './analytic-viewer-new/analytic-viewer-new.component';
import { AnalyticControlNewComponent } from './analytic-control-new/analytic-control-new.component';
import { RealtimeViewerResizeComponent } from './realtime-viewer-resize/realtime-viewer-resize.component';
import { Dashboard } from './dashboard/dashboard';
import { AddChart } from './add-chart/add-chart';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainlayoutComponent,
    children: [
      { path: 'realtime', component: RealtimeViewerComponent },
      { path: 'realtime/:id', component: RealtimeViewerComponent },
      { path: 'realtime-control/:id', component: RealtimeControlComponent },
      { path: 'export', component: ExportDataComponent },
      { path: 'reports', component: ReportsViewerComponent },
      { path: 'pages', component: PagesViewerComponent },
      { path: 'hierarchy', component: HierarchyComponent },
      { path: 'quickaccess', component: QuickAccessComponent },
      { path: 'general-settings', component: GeneralSettingsComponent },
      { path: 'analysis-settings', component: AnalysisSettingsComponent },
      { path: 'analytic-control-new/:id', component: AnalyticControlNewComponent },
      { path: 'analytic-new', component: AnalyticViewerNewComponent },
      { path: 'analytic-new/:id', component: AnalyticViewerNewComponent },
      { path: 'dashboard', component: Dashboard },
      { path: 'dashboard/:id', component: Dashboard },
      { path: 'add-chart', component: AddChart },
      { path: 'add-chart/:id', component: AddChart },

      { path: 'analytic-control', component: AnalyticControlComponent },
      { path: 'analytic-control/:id', component: AnalyticControlComponent },
      { path: 'realtimecontrol', component: RealtimeeComponent },
      { path: 'realtime-resize', component: RealtimeViewerResizeComponent },
      { path: 'analytic', component: AnalyticViewerComponent },
      { path: 'analytic/:id', component: AnalyticViewerComponent },
    ]
  }
];
