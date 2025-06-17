import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DevExtremeModule } from 'devextreme-angular';

@Component({
  selector: 'app-analytic-viewer',
  standalone: true,
  imports: [
    DevExtremeModule,
    CommonModule,
  ],
  templateUrl: './analytic-viewer.component.html',
  styleUrls: ['./analytic-viewer.component.css']
})
export class AnalyticViewerComponent implements OnInit {
  AnalysisData: any;
  tableData: any[] = [];
  tableColumns: any[] = [];
  chartData: any[] = [];
  chartSeries: any[] = [];
  chartAxis: any[] = [];
  dataFromStorage: any;
  cardTitle: string = '';
  analyticType: string = '';
  showId: any;
  showChartOnly = false;
  showTableOnly = false;
  eeumaData: any[] = [];
  iecData: any[] = [];
  constructor(private router: Router) {}

  ngOnInit() {
    this.checkControlData();
  }

  checkControlData() {
    const savedControlData = localStorage.getItem('Analysis');
    if (savedControlData) {
      this.dataFromStorage = JSON.parse(savedControlData);
      this.cardTitle = this.dataFromStorage.WindowDetails.analyticTitle || '';
      this.analyticType = this.dataFromStorage.WindowDetails.analyticType || '';
      
      this.AnalysisData = this.dataFromStorage;
      this.showId = this.dataFromStorage?.WindowDetails?.analyticId;
      const showControl = this.dataFromStorage?.WindowDetails?.showControl || [];
      this.showChartOnly = showControl.includes('Chart');
      this.showTableOnly = showControl.includes('Datatable');

      this.tableData = this.AnalysisData.Table || [];
      if (this.tableData.length > 0) {
        this.tableColumns = Object.keys(this.tableData[0]);
      }

      if (this.AnalysisData.charts && this.AnalysisData.charts.length > 0) {
        const chartConfig = this.AnalysisData.charts[0];
        this.chartData = chartConfig.data || [];
        this.chartSeries = chartConfig.series || [];
        this.chartAxis = chartConfig.axis || [];
      }

      if (this.showId === "62") {
        this.eeumaGridData(this.dataFromStorage);
      } else if(this.showId === "63") {
        this.iecGridData(this.dataFromStorage);
      } else if(this.showId === "73") {
        this.AlarmPerformanceChart(this.dataFromStorage);
      } else if(this.showId == "64") {
        this.AlarmPerformanceDashboard(this.dataFromStorage);
      } else if(this.showId == "52" || this.showId === "54" || this.showId === "53") {
        this.AlarmsPerOperatingPosition(this.dataFromStorage);
      } else if(this.showId === "61") {
        this.AlarmsVsOperatorAction(this.dataFromStorage);
      } else if(this.showId === "72" || this.showId === "50") {
        this.ChatteringAlarms(this.dataFromStorage);
      } else if(this.showId === "51") {
        this.FleedingAlarms(this.dataFromStorage);
      } else if(this.showId === "60" || this.showId === "48" || this.showId === "49" || this.showId === "67") {
        this.FloodAlarms(this.dataFromStorage);
      } else if(this.showId === "26" || this.showId === "30" || this.showId === "29" || this.showId === "27" || this.showId === "28" || this.showId === "1" || this.showId === "12" || this.showId === "9" || this.showId === "8" || this.showId === "5" || this.showId === "2" || this.showId === "11"
        || this.showId === "10" || this.showId === "6" || this.showId === "4" || this.showId === "7" || this.showId === "3" || this.showId === "33" || this.showId === "31" || this.showId === "76" || this.showId === "21" || this.showId === "18" || this.showId === "25" || this.showId === "24" || this.showId === "13"
        || this.showId === "14" || this.showId === "16" || this.showId === "17" || this.showId === "22" || this.showId === "15" || this.showId === "19" || this.showId === "20" || this.showId === "23" || this.showId === "32" || this.showId === "57" || this.showId === "58"
      ) {
        this.FrequencyAlarms(this.dataFromStorage);
      } else if (this.showId === "77" || this.showId === "47" || this.showId === "45") {
        this.SOE(this.dataFromStorage)
      } else if(this.showId === "46" || this.showId === "34" || this.showId === "35" || this.showId === "38" || this.showId === "39" || this.showId === "37" || this.showId === "36"
        || this.showId === "43" || this.showId === "44" || this.showId === "42" || this.showId === "41" || this.showId === "40"
      ) {
        this.StandingACK(this.dataFromStorage);
      }
    }
  }

  eeumaGridData(data: any) {
    const eeumaData = [];
  
    eeumaData.push({
      Metric: "Total Alarms",
      Col1: data?.r1c1?.label || '',
      Col2: data?.r1c2?.label || '',
      Col3: data?.r1c3?.label || ''
    });
  
    eeumaData.push({
      Metric: "Average Alarms Rate Per day",
      Col1: data?.r2c1?.label || '',
      Col2: data?.r2c2?.label || '',
      Col3: data?.r2c3?.label || ''
    });
  
    eeumaData.push({
      Metric: "Key Performance Indicator",
      Col1: data?.r3c1?.label || '',
      Col2: data?.r3c2?.label || '',
      Col3: data?.r3c3?.label || ''
    });
  
    eeumaData.push({
      Metric: "Average Alarms Rate per 10 minutes",
      Col1: data?.r4c1?.label || '~10',
      Col2: data?.r4c2?.label || '~100',
      Col3: data?.r4c3?.label || ''
    });

    eeumaData.push({
      Metric: "Alarm Level",
      Col1: data?.r5c1?.label || 'Stable',
      Col2: data?.r5c2?.label || 'Reactive',
      Col3: data?.r5c3?.label || ''
    });

    eeumaData.push({
      Metric: "Peak 10 minutes alarm rate",
      Col1: data?.r6c1?.label || '~1000',
      Col2: data?.r6c2?.label || '>1000',
      Col3: data?.r6c3?.label || ''
    });

    eeumaData.push({
      Metric: "Peak Level",
      Col1: data?.r7c1?.label || 'Stable',
      Col2: data?.r7c2?.label || 'Reactive',
      Col3: data?.r7c3?.label || ''
    });

    eeumaData.push({
      Metric: "% Time > 5 Alarms",
      Col1: data?.r8c1?.label || '~ 25%	',
      Col2: data?.r8c2?.label || '~ 50%	',
      Col3: data?.r8c3?.label + "%" || ''
    });
  
    eeumaData.push({
      Metric: "Level",
      Col1: data?.r9c1?.label || 'Stable',
      Col2: data?.r9c2?.label || 'Reactive',
      Col3: data?.r9c3?.label || ''
    });

    eeumaData.push({
      Metric: "Alarm Performance",
      Col1: data?.r10c1?.label || '',
      Col2: data?.r10c2?.label || '',
      Col3: data?.r10c3?.label || ''
    });

    eeumaData.push({
      Metric: "Others Indicator",
      Col1: data?.r11c1?.label || '',
      Col2: data?.r11c2?.label || '',
      Col3: data?.r11c3?.label || ''
    });

    eeumaData.push({
      Metric: "",
      Col1: data?.r12c1?.label || '',
      Col2: data?.r12c2?.label ? `>${data.r12c2.label}%` : '',
      Col3: data?.r12c3?.label ? `${data.r12c3.label}%` : '',
    });

    eeumaData.push({
      Metric: "Priority Distribution",
      Col1: data?.r13c1?.label || '',
      Col2: data?.r13c2?.label ? `<${data.r13c2.label}%` : '',
      Col3: data?.r13c3?.label ? `${data.r13c3.label}%` : '',
    });

    eeumaData.push({
      Metric: "",
      Col1: data?.r14c1?.label || '',
      Col2: data?.r14c2?.label ? `<${data.r14c2.label}%` : '',
      Col3: data?.r14c3?.label ? `${data.r14c3.label}%` : '',
    });

    eeumaData.push({
      Metric: "Shelved Alarm",
      Col1: '',
      Col2: '',
      Col3: '0',
    });

    eeumaData.push({
      Metric: "Percentage contribution of the top 10 most frequent alrams",
      Col1: '',
      Col2: '',
      Col3: data?.r15c3?.label || '%',
    });
  
    this.eeumaData = eeumaData;
  }
  
  onToolbarPreparing(e: any) {
    const toolbar = e.toolbarOptions.items;

    toolbar.unshift({
      location: 'before',
      widget: 'dxButton',
      options: {
        stylingMode: 'contained',
        text: "Duration : " + this.AnalysisData.duration.from + " - " + this.AnalysisData.duration.to
      },
    });
  }

  onToolbarEeumacalcu(e: any) {
    const toolbar = e.toolbarOptions.items;

    toolbar.unshift({
      location: 'before',
      widget: 'dxButton',
      options: {
        stylingMode: 'contained',
        text: 'Table 2. EEMUA 191 - Performance category calculation'
      },
    });
  }

  eeumacalcu: any[] = [
    { "Performance Category": 'Overloaded', "Average Alarm rate per 10 M": '>100', "Peak Alarm PER 10 Min": '>1000', "% Time > 5 Alarms": '>50%' },
    { "Performance Category": 'Reactive', "Average Alarm rate per 10 M": '10 - 100', "Peak Alarm PER 10 Min": '1000', "% Time > 5 Alarms": '25 -50%' },
    { "Performance Category": 'Stable', "Average Alarm rate per 10 M": '1 - 10', "Peak Alarm PER 10 Min": '100 - 1000', "% Time > 5 Alarms": '5 - 25%' },
    { "Performance Category": 'Robust', "Average Alarm rate per 10 M": '1 -10', "Peak Alarm PER 10 Min": '10 - 100', "% Time > 5 Alarms": '1 - 5%' },
    { "Performance Category": 'Predictive', "Average Alarm rate per 10 M": '< 1', "Peak Alarm PER 10 Min": '< 10', "% Time > 5 Alarms": '< 1%' },
  ];

  //IEC Data
  iecGridData(data: any) {
    const iecData = [];
  
    iecData.push({
      Metric: "Annunciated alarms per time",
      Target1: "Target Value: Very likely to be acceptable",
      Target2: "Target Value: Maximum manageable",
      Col1: data?.r1c3?.label || '',
    });

    iecData.push({
      Metric: "Annunciated alarms per day per operator console",
      Target1: "~ 144 alarms per day",
      Target2: "~ 288 alarams per day",
      Col1: data?.r2c3?.label || '',
    });

    iecData.push({
      Metric: "Annunciated alarms per hour per operator console",
      Target1: "~ 6 (average)",
      Target2: "~ 12 (average)",
      Col1: data?.r3c3?.label || '',
    });

    iecData.push({
      Metric: "Average Alarms Rate per 10 minutes",
      Target1: "~ 1(average)",
      Target2: "~ 2 (average)",
      Col1: data?.r4c3?.label || '',
    });

    iecData.push({
      Metric: "Percentage of hours containing more than 30 alarms",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r6c3?.label || '',
    });

    iecData.push({
      Metric: "Percentage of 10 minutes periods containing more than 10 alarms",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r7c3?.label || '',
    });
    
    iecData.push({
      Metric: "Maximum number of alarms in a 10 minute period",
      Target1: "<= 10",
      Target2: "",
      Col1: data?.r8c3?.label || '',
    });
    
    iecData.push({
      Metric: "Percentage of time the alarm system is in a flood condition",
      Target1: "~ < 1 %",
      Target2: "",
      Col1: data?.r9c3?.label || '',
    });
    
    iecData.push({
      Metric: "Percentage contribution of the top 10 most frequent alarms to the overall alarm load",
      Target1: "~ < 1 % to 5 % maximum, with action plans to address deficiencies.",
      Target2: "",
      Col1: data?.r10c3?.label || '',
    });
    
    iecData.push({
      Metric: "Quantity of chattering alarms",
      Target1: "Zero, action plans to correct any that occur.",
      Target2: "",
      Col1: data?.r11c3?.label || '',
    });
    
    iecData.push({
      Metric: "Quantity of fleeting alarms",
      Target1: "Zero, action plans to correct any that occur.",
      Target2: "",
      Col1: data?.r12c3?.label || '',
    });
    
    iecData.push({
      Metric: "Stale alarms",
      Target1: "Less than 5 present on any day, with action plans to address.",
      Target2: "",
      Col1: data?.r13c3?.label || '',
    });

    iecData.push({
      Metric: ".",
      Target1: data?.r14c1?.label || '',
      Target2: data?.r14c2?.label ? `>${data.r14c2.label}%` : '',
      Col1: data?.r14c3?.label || '',
      bgColor: data?.r14c3?.attr?.bgColor || ''
    });

    iecData.push({
      Metric: "Annunciated priority distribution	",
      Target1: data?.r15c1?.label || '',
      Target2: data?.r15c2?.label ? `<${data.r15c2.label}%` : '',
      Col1: data?.r15c3?.label || '',
      bgColor: data?.r15c3?.attr?.bgColor || ''
    });

    iecData.push({
      Metric: "",
      Target1: data?.r16c1?.label || '',
      Target2: data?.r16c2?.label ? `<${data.r16c2.label}%` : '',
      Col1: data?.r16c3?.label || '',
      bgColor: data?.r16c3?.attr?.bgColor || ''
    });

    const transformedIecData = iecData.map((item: any) => ({
      Metric: item.Metric,
      Target1: item.Target1,
      Target2: item.Target2,
      Col1: item.Col1 ? parseFloat(item.Col1).toFixed(2) : '%',
      bgColor: item.bgColor
    }));
    
    this.iecData = [...transformedIecData,];
  }

  onCellPrepared(e: any) {
    if(e.rowType === 'data'){
      if (e.column.dataField === 'Target1' && e.data.bgColor) {
        if (
          e.data.Metric === ""
        ) {
          e.cellElement.style.backgroundColor =  "yellow";
        }

        if (
          e.data.Metric.includes("Annunciated priority distribution")
        ) {
          e.cellElement.style.backgroundColor = "red";
        }
  
        if (
          e.data.Metric === "."
        ) {
          e.cellElement.style.backgroundColor =  "mediumseagreen";
        }
      }
  
      if(e.column.dataField === 'Col1' && e.data.bgColor){
        if (
          e.data.Metric.includes("Annunciated priority distribution") || e.data.Metric === "" || e.data.Metric === "."
        ) {
          console.log(e.data.bgColor)

          e.cellElement.style.backgroundColor = e.data.bgColor;
        }
      }
    }
  }

  AlmChartData: any = [];
  valueAxisConfig: any;
  seriesData: any;
  AlarmPerformanceChart(data: any){
    this.AlmChartData = data.Table;

    this.seriesData = [
      {
        valueField: 'Annunciated_Rating',
        name: 'Operator Load in Normal' +
        'Operation Annunciated Alarms(<150 alarms/day)',
        color: '#f20c0c'
      },
      {
        valueField: 'Operator_Load_Rating',
        name: 'Operator Load in Upset Operation - Flood Periods (<7 hours per month)',
        color: '#227322'
      },
      {
        valueField: 'Stale_Rating',
        name: 'Operating in Alarm State - Stale Alarms (<5% on any day)',
        color: '#8c8cff'
      }
    ];
  
    this.valueAxisConfig = {
      min: 0,
      max: 5,
      visualRange: { startValue: 0, endValue: 5 },
      wholeRange: { startValue: 0, endValue: 5 },
      label: {
        customizeText: (arg: any) => `${arg.value}%`
      },
      title: 'Rating (%)',
      constantLines: [
        {
          value: 1,
          color: 'green',
          width: 2,
          dashStyle: 'dash',
          label: {
            text: 'Good',
            visible: true,
            position: 'inside'
          }
        },
        {
          value: 5,
          color: 'red',
          width: 2,
          dashStyle: 'dash',
          label: {
            text: 'Poor Performance',
            visible: true,
            position: 'inside'
          }
        }
      ]
    };
  }

  AlmDashboardData: any = [];
  AlarmPerformanceDashboard(data: any) {
    this.AlmDashboardData = data.Table;
  }

  AlmsPerOprPositionData: any = [];
  AlmsPerOprPositionTableData: any = [];
  AlarmsPerOperatingPosition(data: any) {
    this.AlmsPerOprPositionData = data.charts[0].data;
    this.seriesData = data.charts[0].series;
    this.AlmsPerOprPositionTableData = data.Table;

    if (data.charts[0].axis && data.charts[0].axis.length > 0) {
      this.valueAxisConfig = data.charts[0].axis[0];
    } else {
      this.valueAxisConfig = null;
    }
  }

  AlarmVsOperatorData: any = [];
  AlarmVsOperatorTableData: any = [];

  AlarmsVsOperatorAction(data: any) {
    console.log(data);

    this.AlarmVsOperatorData = data.charts;
    this.AlarmVsOperatorTableData = data.Table;
  }

  ChatteringData: any = [];
  ChatteringTableData: any = [];
  ChatteringAlarms(data: any) {
    console.log(data);
    this.ChatteringData = data.charts;
    this.ChatteringTableData = data.Table;
  }

  FleedingData: any = [];
  FleedingTableData: any = [];
  FleedingAlarms(data: any) {
    console.log(data);
    this.FleedingData = data.charts;
    this.FleedingTableData = data.Table;
  }

  FloodData: any = [];
  FloodTableData: any = [];
  FloodAlarms(data: any) {
    console.log(data);
    this.FloodData = data.charts;
    this.FloodTableData = data.Table;
  }

  FrequencyData: any = [];
  FrequencyTableData: any = [];
  FrequencyAlarms(data: any) {
    console.log(data);
    this.FrequencyData = data.charts;
    this.FrequencyTableData = data.Table;
  }

  SOETableData: any = [];
  SOE(data: any) {
    console.log(data);
    this.SOETableData = data.Table;
  }

  StandingACKData: any = [];
  StandingACKTableData: any = [];
  StandingACK(data: any) {
    console.log(data);
    this.StandingACKData = data.charts;
    this.StandingACKTableData = data.Table;
  }

  onAddClicked(): void {
    this.router.navigate(['analytic-control']);
  }

  onSaveClicked(): void {
    console.log('Save button clicked');
  }

  onSettingsClicked(): void {
    if (this.dataFromStorage) {
      this.router.navigate(['analytic-control']);
    }
  }

  onDeleteClicked(): void {
    console.log('Delete button clicked');
  }
}
