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
      
      this.showId = this.dataFromStorage?.WindowDetails?.analyticId;
      const showControl = this.dataFromStorage?.WindowDetails?.showControl || [];
      this.showChartOnly = showControl.includes('Chart');
      this.showTableOnly = showControl.includes('Datatable');

      this.AnalysisData = this.dataFromStorage.AnalysisData;

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
        this.eeumaGridData(this.AnalysisData);
      } else if(this.showId === "63") {
        this.iecGridData(this.AnalysisData);
      } else if(this.showId === "73") {
        this.AlarmPerformanceChart(this.AnalysisData);
      } else if(this.showId === "74") {
        this.AlarmPerformanceIndicator(this.AnalysisData);
      } else if(this.showId === "75") {
        this.KPIChart(this.AnalysisData);
      } else if(this.showId == "64") {
        this.AlarmPerformanceDashboard(this.AnalysisData);
      } else if(this.showId == "52" || this.showId === "54" || this.showId === "53") {
        this.AlarmsPerOperatingPosition(this.AnalysisData);
      } else if(this.showId === "61") {
        this.AlarmsVsOperatorAction(this.AnalysisData);
      } else if(this.showId === "72" || this.showId === "50") {
        this.ChatteringAlarms(this.AnalysisData);
      } else if(this.showId === "51") {
        this.FleedingAlarms(this.AnalysisData);
      } else if(this.showId === "60" || this.showId === "48" || this.showId === "49" || this.showId === "67") {
        this.FloodAlarms(this.AnalysisData);
      } else if(this.showId === "26" || this.showId === "30" || this.showId === "29" || this.showId === "27" || this.showId === "28" || this.showId === "1" || this.showId === "12" || this.showId === "9" || this.showId === "8" || this.showId === "5" || this.showId === "2" || this.showId === "11"
        || this.showId === "10" || this.showId === "6" || this.showId === "4" || this.showId === "7" || this.showId === "3" || this.showId === "33" || this.showId === "31" || this.showId === "76" || this.showId === "21" || this.showId === "18" || this.showId === "25" || this.showId === "24" || this.showId === "13"
        || this.showId === "14" || this.showId === "16" || this.showId === "17" || this.showId === "22" || this.showId === "15" || this.showId === "19" || this.showId === "20" || this.showId === "23" || this.showId === "32" || this.showId === "57" || this.showId === "58"
      ) {
        this.FrequencyAlarms(this.AnalysisData);
      } else if (this.showId === "77" || this.showId === "47" || this.showId === "45") {
        this.SOE(this.AnalysisData)
      } else if(this.showId === "46" || this.showId === "34" || this.showId === "35" || this.showId === "38" || this.showId === "39" || this.showId === "37" || this.showId === "36"
        || this.showId === "43" || this.showId === "44" || this.showId === "42" || this.showId === "41" || this.showId === "40"
      ) {
        this.StandingACK(this.AnalysisData);
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
    this.AlarmVsOperatorData = data.charts;
    this.AlarmVsOperatorTableData = data.Table;
  }

  ChatteringData: any = [];
  ChatteringTableData: any = [];
  ChatteringAlarms(data: any) {
    this.ChatteringData = data.charts;
    this.ChatteringTableData = data.Table;
  }

  FleedingData: any = [];
  FleedingTableData: any = [];
  FleedingAlarms(data: any) {
    this.FleedingData = data.charts;
    this.FleedingTableData = data.Table;
  }

  FloodData: any = [];
  FloodTableData: any = [];
  FloodAlarms(data: any) {
    this.FloodData = data.charts;
    this.FloodTableData = data.Table;
  }

  FrequencyData: any = [];
  FrequencyTableData: any = [];
  FrequencyAlarms(data: any) {
    this.FrequencyData = data.charts;
    this.FrequencyTableData = data.Table;
  }

  SOETableData: any = [];
  SOE(data: any) {
    this.SOETableData = data.Table;
  }

  StandingACKData: any = [];
  StandingACKTableData: any = [];
  StandingACK(data: any) {
    this.StandingACKData = data.charts;
    this.StandingACKTableData = data.Table;
  }

  dataPoints: any = {};
  statePoints: any = {};

  alarm_metrics1: any[] = [
    {
      robust: 60,
      stable: 80,
      reactive: 80,
      overload: 80,
      state: 0,
    },
    {
      robust: 40,
      stable: 80,
      reactive: 80,
      state: 20,
    },
    {
      stable: 60,
      reactive: 80,
      overload: 80,
      state: 40,
    },
    {
      reactive: 60,
      overload: 80,
      state: 60,
    },
    {
      overload: 80,
      state: 80,
    },
    {
      state: 30,
      scatterField: 30,
    },
    {
      state: 46,
      bigscatterField: 26,
    },
  ];
  alarm_metrics2: any[] = [
    {
      robust: 60,
      stable: 80,
      reactive: 80,
      overload: 80,
      state: 0,
    },
    {
      robust: 40,
      stable: 80,
      reactive: 80,
      state: 10,
    },
    {
      stable: 60,
      reactive: 80,
      overload: 80,
      state: 20,
    },

    {
      reactive: 60,
      overload: 80,
      state: 30,
    },
    {
      overload: 80,
      state: 40,
    },
    {
      state: 17,
      scatterField: 3,
    },
    {
      state: 22,
      scatterField: 5,
    },
    {
      state: 25,
      scatterField: 7,
    },
    {
      state: 21,
      scatterField: 6,
    },
    {
      state: 12,
      scatterField: 4,
    },
    {
      state: 35,
      scatterField: 7,
    },
    {
      state: 26,
      bigscatterField: 6,
    },
  ];
  alarm_metrics_barchart: any[] = [];
  alarm_metrics_barchart_upset_state: any[] = [];

   customizeBarchartPoint(arg: any) {
    if (arg.seriesName == 'ACT-UCT') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Ammonia') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Ammonia_Storage') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'FGS') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'CPP') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Urea') {
      return { color: arg.data.areacolor };
    }

    return {};
  }

   getUniqueAreas(data: any[]): string[] {
    // Reduce the array to get unique areas
    return data.reduce((uniqueAreas: string[], item: any) => {
      if (!uniqueAreas.includes(item.area)) {
        uniqueAreas.push(item.area);
      }
      return uniqueAreas;
    }, []);
  }

  getColor(area: string): string {
    const matchedBarchart = this.alarm_metrics_barchart.find(
      (item) => item.area === area
    );
    if (matchedBarchart) {
      return matchedBarchart.areacolor;
    }
    return '#000000';
  }

  getColor2(area: string): string {
    const matchedBarchart = this.alarm_metrics_barchart_upset_state.find(
      (item) => item.area === area
    );
    if (matchedBarchart) {
      return matchedBarchart.areacolor;
    }
    return '#000000';
  }

  customizebarchartTooltip(arg: any) {
    if (arg.valueText > 0 && arg.valueText <= 3) {
      return {
        text: `Roubust`,
      };
    }
    if (arg.valueText > 3 && arg.valueText <= 7) {
      return {
        text: `Stable`,
      };
    }
    if (arg.valueText > 7 && arg.valueText <= 11) {
      return {
        text: `Reactive`,
      };
    }
    if (arg.valueText > 11 && arg.valueText <= 16) {
      return {
        text: `Overload`,
      };
    }
    return {
      text: arg.valueText,
    };
  }

  customizeText1(arg: any) {
    if (arg.value > 0 && arg.value <= 4) {
      return `Roubust`;
    }
    if (arg.value > 4 && arg.value <= 8) {
      return `Stable`;
    }
    if (arg.value > 8 && arg.value <= 12) {
      return `Reactive`;
    }
    if (arg.value > 12 && arg.value <= 16) {
      return `Overload`;
    }
    return ``;
  }

  customizeTextAreaChartSteadyStateVal(arg: any) {
    if (arg.value == 20) {
      return `1%`;
    }
    if (arg.value == 40) {
      return `10%`;
    }
    if (arg.value == 60) {
      return `25%`;
    }
    if (arg.value == 80) {
      return `50%`;
    }
    return `${arg.valueText}%`;
  }

  customizeTextAreaChartSteadyStateArg(arg: any) {
    if (arg.value == 20) {
      return `1`;
    }
    if (arg.value == 40) {
      return `2`;
    }
    if (arg.value == 60) {
      return `10`;
    }
    if (arg.value == 80) {
      return `100`;
    }
    return `${arg.valueText}`;
  }

  customizeTextAreaChartUpsetVal(arg: any) {
    if (arg.value == 20) {
      return ``;
    }
    if (arg.value == 40) {
      return `1%`;
    }
    if (arg.value == 60) {
      return `2.5%`;
    }
    if (arg.value == 80) {
      return `5%`;
    }
    return `${arg.valueText}%`;
  }

  customizeTextAreaChartUpsetArg(arg: any) {
    if (arg.value == 10) {
      return `10`;
    }
    if (arg.value == 20) {
      return `20`;
    }
    if (arg.value == 30) {
      return `100`;
    }
    if (arg.value == 40) {
      return `1000`;
    }
    return `${arg.valueText}`;
  }

   customizePoint(arg: any) {
    if (arg.seriesName == 'Scatter_Series') {
      return { color: arg.data.areacolor };
    }
    if (arg.seriesName == 'Steady_State_Scatter_series') {
      if (arg.data.area == 'FGS') {
        return {
          image: { url: '../../assets/fgs.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'ACT-UCT') {
        return {
          image: { url: '../../assets/act-uct.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'CPP') {
        return {
          image: { url: '../../assets/cpp.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia') {
        return {
          image: { url: '../../assets/ammonia.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia_Storage') {
        return {
          image: {
            url: '../../assets/ammonia_storage.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Urea') {
        return {
          image: { url: '../../assets/urea.png', width: 20, height: 20 },
          visible: true,
        };
      } else {
        return {
          image: { url: '../../assets/s_image.png', width: 20, height: 20 },
          visible: true,
        };
      }
    }
    if (arg.seriesName == 'Upset_State_Scatter_series') {
      if (arg.data.area == 'FGS') {
        return {
          image: { url: '../../assets/fgs_upset.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'ACT-UCT') {
        return {
          image: {
            url: '../../assets/act-uct_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'CPP') {
        return {
          image: { url: '../../assets/cpp_upset.png', width: 20, height: 20 },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia') {
        return {
          image: {
            url: '../../assets/ammonia_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Ammonia_Storage') {
        return {
          image: {
            url: '../../assets/ammonia_storage_upset.png',
            width: 20,
            height: 20,
          },
          visible: true,
        };
      }
      if (arg.data.area == 'Urea') {
        return {
          image: { url: '../../assets/urea_upset.png', width: 20, height: 20 },
          visible: true,
        };
      } else {
        return {
          image: { url: '../../assets/u_image.png', width: 20, height: 20 },
          visible: true,
        };
      }
    }

    return {};
  }

  customizeTooltip(arg: any) {
    const datetimeString = arg.point.data.datetime;
    const datetime = new Date(datetimeString);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = datetime.getDate();
    const monthIndex = datetime.getMonth();
    const year = datetime.getFullYear();

    const formattedDate = day + '-' + months[monthIndex] + '-' + year;
    let customValue;
    let valueText;
    // customValue = this.mapValueSteadyStateArgAxis(arg.argument);

    let rangeStart: number;
    let rangeEnd: number;
    let val_starting_point: number;
    let val_ending_point: number;

    let argument = arg.argument;
    let value = arg.value;
    if (argument) {
      if (argument >= 0 && argument < 20) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 20;
      } else if (argument >= 20 && argument < 40) {
        rangeStart = 1;
        rangeEnd = 2;
        val_starting_point = 20;
        val_ending_point = 40;
      } else if (argument >= 40 && argument < 60) {
        rangeStart = 2;
        rangeEnd = 10;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (argument >= 60 && argument < 80) {
        rangeStart = 10;
        rangeEnd = 100;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        argument = 80;
        rangeStart = 10;
        rangeEnd = 100;
        val_starting_point = 60;
        val_ending_point = 80;
      }
      const clamped_val1 =
        (argument - val_starting_point) /
        (val_ending_point - val_starting_point);
      customValue = rangeStart + clamped_val1 * (rangeEnd - rangeStart);
    }

    if (value) {
      if (value >= 0 && value < 20) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 20;
      } else if (value >= 20 && value < 40) {
        rangeStart = 1;
        rangeEnd = 10;
        val_starting_point = 20;
        val_ending_point = 40;
      } else if (value >= 40 && value < 60) {
        rangeStart = 10;
        rangeEnd = 25;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (value >= 60 && value < 80) {
        rangeStart = 25;
        rangeEnd = 50;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        value = 80;
        rangeStart = 25;
        rangeEnd = 50;
        val_starting_point = 60;
        val_ending_point = 80;
      }

      const clamped_val =
        (value - val_starting_point) / (val_ending_point - val_starting_point);
      valueText = rangeStart + clamped_val * (rangeEnd - rangeStart);
    }

    if (arg.seriesName == 'Scatter_Series') {
      // valueText = this.calculateCustomValueValAxis(arg.value);
      return {
        text: `Date : ${formattedDate}<br/> Average Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    } else if (arg.seriesName == 'Steady_State_Scatter_series') {
      return {
        text: `Average Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    }

    return {};
  }

  customizeTooltipUpsetState(arg: any) {
    const datetimeString = arg.point.data.datetime;
    const datetime = new Date(datetimeString);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = datetime.getDate();
    const monthIndex = datetime.getMonth();
    const year = datetime.getFullYear();

    const formattedDate = day + '-' + months[monthIndex] + '-' + year;
    let customValue;
    let valueText;
    // customValue = this.mapValueSteadyStateArgAxis(arg.argument);

    let rangeStart: number;
    let rangeEnd: number;
    let val_starting_point: number;
    let val_ending_point: number;

    let argument = arg.argument;
    let value = arg.value;
    if (argument) {
      if (argument >= 0 && argument < 10) {
        rangeStart = 0;
        rangeEnd = 10;
        val_starting_point = 0;
        val_ending_point = 10;
      } else if (argument >= 10 && argument < 20) {
        rangeStart = 10;
        rangeEnd = 20;
        val_starting_point = 10;
        val_ending_point = 20;
      } else if (argument >= 20 && argument < 30) {
        rangeStart = 20;
        rangeEnd = 100;
        val_starting_point = 20;
        val_ending_point = 30;
      } else if (argument >= 30 && argument < 40) {
        rangeStart = 100;
        rangeEnd = 1000;
        val_starting_point = 30;
        val_ending_point = 40;
      } else {
        argument = 40;
        rangeStart = 100;
        rangeEnd = 1000;
        val_starting_point = 30;
        val_ending_point = 40;
      }
      const clamped_val1 =
        (argument - val_starting_point) /
        (val_ending_point - val_starting_point);
      customValue = rangeStart + clamped_val1 * (rangeEnd - rangeStart);
    }

    if (value) {
      if (value >= 0 && value < 40) {
        rangeStart = 0;
        rangeEnd = 1;
        val_starting_point = 0;
        val_ending_point = 40;
      } else if (value >= 40 && value < 60) {
        rangeStart = 1;
        rangeEnd = 2.5;
        val_starting_point = 40;
        val_ending_point = 60;
      } else if (value >= 60 && value < 80) {
        rangeStart = 2.5;
        rangeEnd = 5;
        val_starting_point = 60;
        val_ending_point = 80;
      } else {
        value = 80;
        rangeStart = 2.5;
        rangeEnd = 5;
        val_starting_point = 60;
        val_ending_point = 80;
      }

      const clamped_val =
        (value - val_starting_point) / (val_ending_point - val_starting_point);
      valueText = rangeStart + clamped_val * (rangeEnd - rangeStart);
    }

    if (arg.seriesName == 'Scatter_Series') {
      return {
        text: `Date : ${formattedDate}<br/> Max Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    } else if (arg.seriesName == 'Upset_State_Scatter_series') {
      return {
        text: `Max Alarm Rate : ${customValue}<br/>% Timeout Above Target (>1) : ${valueText}`,
      };
    }

    return {};
  }

  customLegendItems(items: any[]): any[] {
    const seriesToInclude = ['robust', 'stable', 'reactive', 'overload'];
    return items.filter((item) => seriesToInclude.includes(item.text));
  }

  AlarmPerformanceIndicator(data: any) {
    if (data[0]) {
            this.dataPoints = data[0];
          }
          if (data[1]) {
            this.statePoints = data[1];
          }
          // const avgValues = this.dataPoints.map((dataPoint: { avg: any; }) => dataPoint.avg);
          // Assuming alarm_metrics1 is already defined
          this.dataPoints.forEach(
            (dataPoint: {
              avg: any;
              percent_outside_target_avg_value: any;
              area: any;
              color: any;
              convert_to_intervaltime: any;
            }) => {
              if (dataPoint) {
                this.alarm_metrics1.push({
                  // valueField: 'percent_outside_target_avg_value',
                  // name: 'Scatter Series',
                  // argumentField: 'avg',
                  // type: 'scatter',
                  // color: '#9cd8f2',
                  // size: 45,
                  // data: [
                  //   {
                  //     avg: dataPoint.avg || 0,
                  //     percent_outside_target_avg_value: dataPoint.percent_outside_target_avg_value || 0
                  //   }
                  // ]
                  area: dataPoint.area,
                  areacolor: dataPoint.color,
                  datetime: dataPoint.convert_to_intervaltime,
                  // avg: this.mapValueSteadyStateArgAxis(dataPoint.avg) || 0,
                  // percent_outside_target_avg_value:
                  //   this.mapValueSteadyStateValAxis(
                  //     dataPoint.percent_outside_target_avg_value
                  //   ) || 0,
                  avg: dataPoint.avg > 80 ? 80 : dataPoint.avg,
                  percent_outside_target_avg_value:
                    dataPoint.percent_outside_target_avg_value > 80
                      ? 80
                      : dataPoint.percent_outside_target_avg_value,
                });
                let avg = dataPoint.avg > 80 ? 80 : dataPoint.avg;
                let per_avg_val =
                  dataPoint.percent_outside_target_avg_value > 80
                    ? 80
                    : dataPoint.percent_outside_target_avg_value;

                function isInsideTriangle(
                  x1: number,
                  y1: number,
                  x2: number,
                  y2: number,
                  x3: number,
                  y3: number,
                  x: number,
                  y: number
                ): boolean {
                  function area(
                    x1: number,
                    y1: number,
                    x2: number,
                    y2: number,
                    x3: number,
                    y3: number
                  ): number {
                    return Math.abs(
                      (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0
                    );
                  }

                  /* Calculate the area of triangle ABC */
                  const A: number = area(x1, y1, x2, y2, x3, y3);

                  /* Calculate the area of triangle PBC */
                  const A1: number = area(x, y, x2, y2, x3, y3);

                  /* Calculate the area of triangle PAC */
                  const A2: number = area(x1, y1, x, y, x3, y3);

                  /* Calculate the area of triangle PAB */
                  const A3: number = area(x1, y1, x2, y2, x, y);

                  /* Check if the sum of A1, A2, and A3 is the same as A */
                  return A === A1 + A2 + A3;
                }
                let stateValue =
                  per_avg_val >= 0 && per_avg_val <= 20 && avg >= 0 && avg <= 20
                    ? 1
                    : per_avg_val >= 20 &&
                      per_avg_val <= 40 &&
                      avg >= 0 &&
                      avg <= 20
                    ? 2
                    : per_avg_val >= 60 &&
                      per_avg_val <= 80 &&
                      avg >= 0 &&
                      avg <= 20
                    ? 4
                    : per_avg_val >= 0 &&
                      per_avg_val <= 20 &&
                      avg >= 20 &&
                      avg <= 40
                    ? 5
                    : per_avg_val >= 20 &&
                      per_avg_val <= 40 &&
                      avg >= 20 &&
                      avg <= 40
                    ? 6
                    : per_avg_val >= 40 &&
                      per_avg_val <= 60 &&
                      avg >= 20 &&
                      avg <= 40
                    ? 7
                    : per_avg_val >= 0 &&
                      per_avg_val <= 20 &&
                      avg >= 40 &&
                      avg <= 60
                    ? 9
                    : per_avg_val >= 20 &&
                      per_avg_val <= 40 &&
                      avg >= 40 &&
                      avg <= 60
                    ? 10
                    : per_avg_val >= 40 &&
                      per_avg_val <= 60 &&
                      avg >= 40 &&
                      avg <= 60
                    ? 11
                    : per_avg_val >= 0 &&
                      per_avg_val <= 20 &&
                      avg >= 60 &&
                      avg <= 80
                    ? 13
                    : per_avg_val >= 20 &&
                      per_avg_val <= 40 &&
                      avg >= 60 &&
                      avg <= 80
                    ? 14
                    : per_avg_val >= 40 &&
                      per_avg_val <= 60 &&
                      avg >= 60 &&
                      avg <= 80
                    ? 15
                    : per_avg_val >= 60 &&
                      per_avg_val <= 80 &&
                      avg >= 60 &&
                      avg <= 80
                    ? 16
                    : 0;

                if (
                  per_avg_val >= 40 &&
                  per_avg_val <= 60 &&
                  avg >= 0 &&
                  avg <= 20
                ) {
                  const isPointInside: boolean = isInsideTriangle(
                    0,
                    40,
                    20,
                    40,
                    0,
                    60,
                    avg,
                    per_avg_val
                  );
                  if (isPointInside) {
                    stateValue = 3;
                  } else {
                    stateValue = 7;
                  }
                }

                if (
                  per_avg_val >= 60 &&
                  per_avg_val <= 80 &&
                  avg >= 20 &&
                  avg <= 40
                ) {
                  const isPointInside: boolean = isInsideTriangle(
                    20,
                    60,
                    40,
                    60,
                    20,
                    80,
                    avg,
                    per_avg_val
                  );
                  if (isPointInside) {
                    stateValue = 8;
                  } else {
                    stateValue = 12;
                  }
                }

                if (
                  per_avg_val >= 60 &&
                  per_avg_val <= 80 &&
                  avg >= 40 &&
                  avg <= 60
                ) {
                  const isPointInside: boolean = isInsideTriangle(
                    40,
                    60,
                    60,
                    60,
                    40,
                    80,
                    avg,
                    per_avg_val
                  );
                  if (isPointInside) {
                    stateValue = 12;
                  } else {
                    stateValue = 16;
                  }
                }
                this.alarm_metrics_barchart.push({
                  area: dataPoint.area,
                  areacolor: dataPoint.color,
                  date: dataPoint.convert_to_intervaltime,
                  avg: dataPoint.avg,
                  [dataPoint.area]: stateValue,
                  percent_outside_target_avg_value:
                    dataPoint.percent_outside_target_avg_value || 0,
                });
              }
            }
          );
          this.statePoints.forEach(
            (dataPoint: {
              avg: any;
              percent_outside_target_avg_value: any;
              area: any;
              color: any;
              convert_to_intervaltime: any;
            }) => {
              if (dataPoint) {
                this.alarm_metrics1.push({
                  area: dataPoint.area,
                  areacolor: dataPoint.color,
                  datetime: dataPoint.convert_to_intervaltime,
                  // state_avg: this.mapValueSteadyStateArgAxis(dataPoint.avg) || 0,
                  state_percent_outside_target_avg_value:
                    dataPoint.percent_outside_target_avg_value > 80
                      ? 80
                      : dataPoint.percent_outside_target_avg_value,
                  state_avg: dataPoint.avg > 80 ? 80 : dataPoint.avg,
                  // state_percent_outside_target_avg_value: dataPoint.percent_outside_target_avg_value
                });
              }
            }
          );

          this.dataPoints.forEach(
            (dataPoint: {
              max: any;
              percent_outside_target: any;
              area: any;
              color: any;
              convert_to_intervaltime: any;
            }) => {
              this.alarm_metrics2.push({
                area: dataPoint.area,
                areacolor: dataPoint.color,
                datetime: dataPoint.convert_to_intervaltime,
                max: dataPoint.max > 40 ? 40 : dataPoint.max,
                percent_outside_target:
                  dataPoint.percent_outside_target > 80
                    ? 80
                    : dataPoint.percent_outside_target,
              });

              let avg = dataPoint.max > 40 ? 40 : dataPoint.max;
              let per_avg_val =
                dataPoint.percent_outside_target > 80
                  ? 80
                  : dataPoint.percent_outside_target;

              function isInsideTriangle(
                x1: number,
                y1: number,
                x2: number,
                y2: number,
                x3: number,
                y3: number,
                x: number,
                y: number
              ): boolean {
                function area(
                  x1: number,
                  y1: number,
                  x2: number,
                  y2: number,
                  x3: number,
                  y3: number
                ): number {
                  return Math.abs(
                    (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0
                  );
                }

                /* Calculate the area of triangle ABC */
                const A: number = area(x1, y1, x2, y2, x3, y3);

                /* Calculate the area of triangle PBC */
                const A1: number = area(x, y, x2, y2, x3, y3);

                /* Calculate the area of triangle PAC */
                const A2: number = area(x1, y1, x, y, x3, y3);

                /* Calculate the area of triangle PAB */
                const A3: number = area(x1, y1, x2, y2, x, y);

                /* Check if the sum of A1, A2, and A3 is the same as A */
                return A === A1 + A2 + A3;
              }

              let stateValue =
                per_avg_val >= 0 && per_avg_val <= 20 && avg >= 0 && avg <= 10
                  ? 1
                  : per_avg_val >= 20 &&
                    per_avg_val <= 40 &&
                    avg >= 0 &&
                    avg <= 10
                  ? 2
                  : per_avg_val >= 60 &&
                    per_avg_val <= 80 &&
                    avg >= 0 &&
                    avg <= 10
                  ? 7
                  : per_avg_val >= 0 &&
                    per_avg_val <= 20 &&
                    avg >= 10 &&
                    avg <= 20
                  ? 4
                  : per_avg_val >= 20 &&
                    per_avg_val <= 40 &&
                    avg >= 10 &&
                    avg <= 20
                  ? 5
                  : per_avg_val >= 40 &&
                    per_avg_val <= 60 &&
                    avg >= 10 &&
                    avg <= 20
                  ? 6
                  : per_avg_val >= 0 &&
                    per_avg_val <= 20 &&
                    avg >= 20 &&
                    avg <= 30
                  ? 8
                  : per_avg_val >= 20 &&
                    per_avg_val <= 40 &&
                    avg >= 20 &&
                    avg <= 30
                  ? 8
                  : per_avg_val >= 40 &&
                    per_avg_val <= 60 &&
                    avg >= 20 &&
                    avg <= 30
                  ? 10
                  : per_avg_val >= 0 &&
                    per_avg_val <= 20 &&
                    avg >= 30 &&
                    avg <= 40
                  ? 12
                  : per_avg_val >= 20 &&
                    per_avg_val <= 40 &&
                    avg >= 30 &&
                    avg <= 40
                  ? 13
                  : per_avg_val >= 40 &&
                    per_avg_val <= 60 &&
                    avg >= 30 &&
                    avg <= 40
                  ? 14
                  : per_avg_val >= 60 &&
                    per_avg_val <= 80 &&
                    avg >= 30 &&
                    avg <= 40
                  ? 15
                  : 0;

              if (
                per_avg_val >= 40 &&
                per_avg_val <= 60 &&
                avg >= 0 &&
                avg <= 10
              ) {
                const isPointInside: boolean = isInsideTriangle(
                  0,
                  40,
                  10,
                  40,
                  0,
                  60,
                  avg,
                  per_avg_val
                );
                if (isPointInside) {
                  stateValue = 3;
                } else {
                  stateValue = 4;
                }
              }

              if (
                per_avg_val >= 60 &&
                per_avg_val <= 80 &&
                avg >= 10 &&
                avg <= 20
              ) {
                const isPointInside: boolean = isInsideTriangle(
                  10,
                  60,
                  20,
                  60,
                  10,
                  80,
                  avg,
                  per_avg_val
                );
                if (isPointInside) {
                  stateValue = 8;
                } else {
                  stateValue = 9;
                }
              }

              if (
                per_avg_val >= 60 &&
                per_avg_val <= 80 &&
                avg >= 20 &&
                avg <= 30
              ) {
                const isPointInside: boolean = isInsideTriangle(
                  20,
                  60,
                  30,
                  60,
                  20,
                  80,
                  avg,
                  per_avg_val
                );
                if (isPointInside) {
                  stateValue = 12;
                } else {
                  stateValue = 16;
                }
              }
              this.alarm_metrics_barchart_upset_state.push({
                area: dataPoint.area,
                areacolor: dataPoint.color,
                date: dataPoint.convert_to_intervaltime,
                avg: dataPoint.max,
                [dataPoint.area]: stateValue,
                percent_outside_target_avg_value:
                  dataPoint.percent_outside_target || 0,
              });
            }
          );
          this.statePoints.forEach(
            (dataPoint: {
              max: any;
              percent_outside_target: any;
              area: any;
              color: any;
            }) => {
              if (dataPoint) {
                this.alarm_metrics2.push({
                  area: dataPoint.area,
                  areacolor: dataPoint.color,
                  state_max: dataPoint.max > 40 ? 40 : dataPoint.max,
                  state_percent_outside_target:
                    dataPoint.percent_outside_target > 80
                      ? 80
                      : dataPoint.percent_outside_target,
                });
              }
            }
          );
  }

  productionData: any[] = [];
  KPIChart(data: any) {
    console.log(data)
    const tempSource = data.Table;
    tempSource.forEach(
      (dataPoint: {
        avg: any;
        percent_outside_target_avg_value: any;
        percent_outside_target: any;
        area: any;
        convert_to_intervaltime: any;
      }) => {
        if (dataPoint) {
          const dateString = dataPoint.convert_to_intervaltime;

          const dateObject = new Date(dateString);

          const month = dateObject.getMonth();

          const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
          const monthName = monthNames[month];

          this.productionData.push({
            area: dataPoint.area,
            date: monthName,
            data: [
              {
                arg: 'KPI-1 <br> Average rate <br> in Steady <br>  state',
                val1: Math.min(dataPoint.avg, 100),
              },
              {
                arg: 'KPI-2 <br>  % <br> outside <br>  target',
                val1: Math.min(dataPoint.percent_outside_target, 100),
              },
              {
                arg: 'KPI-3 <br> Flood <br>  rate',
                val1: Math.min(
                  dataPoint.percent_outside_target_avg_value,
                  100
                ),
              },
            ],
          });
        }
      }
    );
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
