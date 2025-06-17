import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxColorBoxModule, DxDataGridModule, DxNumberBoxModule, DxSelectBoxModule, DxTabPanelModule } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-analysis-settings',
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxDataGridModule,
    DxColorBoxModule,
    DxSelectBoxModule,
    DxNumberBoxModule
  ],
  templateUrl: './analysis-settings.component.html',
  styleUrl: './analysis-settings.component.css'
})
export class AnalysisSettingsComponent {
  selectedTabIndex: number = 0;
  priorityAttributeColumnValue: any;

  eeumaStandardData: any = [];
  iecStandardData: any = [];
  eeumaCalculationData: any = [];
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
        this.eeumaStandardData = JSON.parse(dataFromApi);
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
        this.eeumaCalculationData = JSON.parse(dataFromApi);
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

    this.apiService.GetColumnValues('area', 1).subscribe({
      next: (dataFromApi: any) => {
        this.priorityAttributeColumnValue = JSON.parse(dataFromApi);
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

  NormalTargetValues: any;
  UpsetTargetValues: any;
  StaleAlarmTargetValues: any;
  GetAlmPerformanceChartSettings() {
    this.apiService.GetAlmPerformanceChartSettings().subscribe({
      next: (dataFromApi: any) => {
        this.performanceRatingData = JSON.parse(dataFromApi);
        const Items = this.performanceRatingData.filter((item: any) => item.rating === 0);

      this.NormalTargetValues = Items
        .filter((item: any) => item.category === "Operator Load in Normal Operation")
        .map((item: any) => item.targetvalue);

      this.UpsetTargetValues = Items
        .filter((item: any) => item.category === "Operator Load in Upset Operation")
        .map((item: any) => item.targetvalue);

      this.StaleAlarmTargetValues = Items
        .filter((item: any) => item.category === "Operating in Alarm State - Stale Alarm")
        .map((item: any) => item.targetvalue);

        this.performanceRatingData = this.performanceRatingData.filter((item: any) => item.rating > 0);

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
    // e.toolbarOptions.items.push(resetButton);
  }

  updateData(event: any, gridName: string) {
    const updatedData = event.data;
  
    switch (gridName) {
      case 'eeumaStandard':
        this.apiService.updateEEumaStandard(updatedData.metricname, updatedData.value).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
  
      case 'iecStandard':
        this.apiService.updateIECStandard(updatedData.metricname, updatedData.value).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;

      case 'eeumaCalculation':
        this.apiService.updateEeumaCalculation(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
  
      case 'analysisSetting':
        this.apiService.updateAnalysisSetting(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;

      case 'analysisDuration':
        this.apiService.updateAnalysisDuration(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;

      case 'priorityAttribute':
        this.apiService.updatePriorityAttribute(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
  
      case 'areaOperators':
        this.apiService.updateAreaOperators(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;

      case 'performancerating':
        this.apiService.UpdateAlmPerformanceChartSettings(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
      
      case 'performancedashboard':
        console.log(updatedData);
        this.apiService.UpdateAlmPerformanceDashboardSettings(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
  
      default:
        notify('Update handler not defined for this grid', 'error', 2000);
        break;
    }
  }  

  addData(event: any, gridName: string) {
    const updatedData = event.data;
  
    switch (gridName) {
      case 'eeumaCalculation':
        this.apiService.addEEUMACalculation(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
      case 'analysisDuration':
        this.apiService.addAnalysisDuration(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
      case 'priorityAttribute':
        this.apiService.addPriorityAttributes(updatedData).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
    }
  }

  removeData(event: any, gridName: string) {
    const updatedData = event.data;
  
    switch (gridName) {
      case 'eeumaCalculation':
        this.apiService.deleteEEUMACalculation(updatedData.eeumacalucationid).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
      case 'analysisDuration':
        this.apiService.deleteAnalysisDuration(updatedData.analysisdurationsettingsid).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
      case 'priorityAttribute':
        this.apiService.DeletePriorityAttributes(updatedData.priorityattributeid).subscribe({
          next: () => notify('Updated Successfully', 'success', 2000),
          error: () => notify('Not Updated..!', 'warning', 2000)
        });
        break;
    }
  }

  editableValue: any;
  isEditing: boolean = false;

  enterEditMode() {
    this.editableValue = this.NormalTargetValues;
    this.isEditing = true;
  }

  saveValue() {
    this.NormalTargetValues = this.editableValue;
    this.isEditing = false;

    let data = {
      data: {
        category: "Operator Load in Normal Operation",
        targetvalue: this.NormalTargetValues,
        noofdaysfrom: 0,
        noofdaysto: 0,
        rating: 0,
      }
    }

    this.updateData(data, 'performancerating')
  }

  editableUpset: any;
  isEditingUpset = false;

  editUpset() {
    this.editableUpset = this.UpsetTargetValues;
    this.isEditingUpset = true;
  }

  saveUpset() {
    this.UpsetTargetValues = this.editableUpset;
    this.isEditingUpset = false;
    
    let data = {
      data: {
        category: "Operator Load in Upset Operation",
        targetvalue: this.UpsetTargetValues,
        noofhoursfrom: 0,
        noofhoursto: 0,
        rating: 0,
      }
    }

    this.updateData(data, 'performancerating')
  }

  editableAlarm: any;
  isEditingAlarm = false;

  editAlarm() {
    this.editableAlarm = this.StaleAlarmTargetValues;
    this.isEditingAlarm = true;
  }

  saveAlarm() {
    this.StaleAlarmTargetValues = this.editableAlarm;
    this.isEditingAlarm = false;

    let data = {
      data: {
        category: "Operating in Alarm State - Stale Alarm",
        targetvalue: this.StaleAlarmTargetValues,
        percentagefrom: 0,
        percentageto: 0,
        rating: 0,
      }
    }

    this.updateData(data, 'performancerating')
  }
}
