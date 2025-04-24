import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxColorBoxModule, DxDataGridModule, DxTabPanelModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-analysis-settings',
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxDataGridModule,
    DxColorBoxModule
  ],
  templateUrl: './analysis-settings.component.html',
  styleUrl: './analysis-settings.component.css'
})
export class AnalysisSettingsComponent {
  selectedTabIndex: number = 0;

  eemuaStandardData: any = [];
  iecStandardData: any = [];
  eemuaCalculationData: any = [];
  analysisSettingData: any = [];
  analysisDurationData: any = [];
  priorityAttributeData: any = [];
  areaOperatorsData: any = [];
  performanceRatingData: any = [];
  normalOperationData: any = [];
  upsetOperationData: any = [];
  alarmStateData: any = [];
  performanceDashboardData: any = [];
  performanceDashboardDataAFM: any = [];
  performanceDashboardDataDAET: any = [];

  constructor(
    private apiService: ApiService,
  ){}

  ngOnInit(): void {
    this.getEEumaStandard();
    this.getIECStandard();
    this.getEEumaCaculation();
    this.GetAnalysisSettings();
    this.GetAnalysisDuration();
    this.getPriorityAttributes();
    this.getAreaOperation();
    this.GetAlmPerformanceChartSettings(); 
    this.GetAlmPerformanceDashboardSettings();
  }

  getEEumaStandard() {
    this.apiService.getEEumaStandard().subscribe({
      next: (dataFromApi: any) => {
        this.eemuaStandardData = JSON.parse(dataFromApi);
      },
    });
  }

  getIECStandard() {
    this.apiService.getIECStandard().subscribe({
      next: (dataFromApi: any) => {
        this.iecStandardData = JSON.parse(dataFromApi);
      },
    });
  }

  getEEumaCaculation() {
    this.apiService.getEEumaCaculation().subscribe({
      next: (dataFromApi: any) => {
        this.eemuaCalculationData = JSON.parse(dataFromApi);
      },
    });
  }

  GetAnalysisSettings() {
    this.apiService.GetAnalysisSettings().subscribe({
      next: (dataFromApi: any) => {
        this.analysisSettingData = JSON.parse(dataFromApi);
      },
    });
  }

  GetAnalysisDuration() {
    this.apiService.GetAnalysisDuration().subscribe({
      next: (dataFromApi: any) => {
        this.analysisDurationData = JSON.parse(dataFromApi);
      },
    });
  }

  getPriorityAttributes() {
    this.apiService.getPriorityAttributes().subscribe({
      next: (dataFromApi: any) => {
        this.priorityAttributeData = JSON.parse(dataFromApi);
      },
    });
  }

  getAreaOperation() {
    this.apiService.getAreaOperation().subscribe({
      next: (dataFromApi: any) => {
        this.areaOperatorsData = JSON.parse(dataFromApi);
      },
    });
  }

  GetAlmPerformanceChartSettings() {
    this.apiService.GetAlmPerformanceChartSettings().subscribe({
      next: (dataFromApi: any) => {
        this.performanceRatingData = JSON.parse(dataFromApi);
        this.performanceRatingData = this.performanceRatingData.filter((item: any) => item.rating > 0);

        // Filter data for different categories
        this.normalOperationData = this.performanceRatingData.filter((item: any) => item.category === "Operator Load in Normal Operation");
        this.upsetOperationData = this.performanceRatingData.filter((item: any) => item.category === "Operator Load in Upset Operation");
        this.alarmStateData = this.performanceRatingData.filter((item: any) => item.category === "Operating in Alarm State - Stale Alarm");
      },
      error: (err) => {
        console.error('Error fetching performance rating data:', err);
      }
    });
  }

  GetAlmPerformanceDashboardSettings() {
    this.apiService.GetAlmPerformanceDashboardSettings().subscribe({
      next: (dataFromApi: any) => {
        const parsedData = JSON.parse(dataFromApi);
        this.performanceDashboardDataAFM = parsedData.filter((item: any) => item.category === 'AFM');
        this.performanceDashboardDataDAET = parsedData.filter((item: any) => item.category === 'DAET');
      }
    });
  }

  onToolbarPreparing(e: any, gridName: string) {
    const resetButton = {
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'refresh',
      },
      toolbar: e.toolbar
    };
    e.toolbarOptions.items.push(resetButton);
  }
}
