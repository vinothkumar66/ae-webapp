import { CommonModule, formatDate } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxTextBoxModule,
  DxTreeViewModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxFilterBuilderModule,
  DxListModule,
  DxDropDownButtonModule,
  DxMenuModule,
  DxDropDownButtonComponent,
  DxButtonModule
} from 'devextreme-angular';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface MenuItem {
  text: string;
  items: MenuItem[];
  onClick: () => void;
}

type DxoItemDraggingProperties = DxSortableTypes.Properties;
@Component({
  selector: 'app-analytic-control',
  imports: [
    DxTextBoxModule,
    DxTreeViewModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    CommonModule,
    DxFilterBuilderModule,
    DxListModule,
    DxDropDownButtonModule,
    DxMenuModule,
    DxButtonModule
  ],
  templateUrl: './analytic-control.component.html',
  styleUrls: ['./analytic-control.component.css']
})
export class AnalyticControlComponent {
  @ViewChild('dropDownButton') dropDownButton!: DxDropDownButtonComponent;

  existingData: any = JSON.parse(localStorage.getItem('Analysis') || '{}');

  formData: any = this.existingData.WindowDetails || {
    analyticTitle: '',
    analyticId: '',
    analyticType: '',
    chartType: '',
    showControl: ['Datatable', 'Chart'],
    selectServer: null,
    servers: [],
    queryType: 'LastNN',
    lastNValue: 1,
    fields: [],
    relativeTime: [],
    autoUpdate: null,
    fromDate: new Date(),
    toDate: new Date(),
    timePicker: new Date(),
    displayFields: '',
    defaultFields: ''
  };
  dropdownText: string = this.existingData.WindowDetails?.analyticType || 'Select Analytic Type';
  menuItems: MenuItem[] = [];
  fieldLookupValues: { [key: string]: string[] } = {};

  selectedData: any = [];
  storedFieldConfigs: any[] = [];

  chartTypes = ['Bar Chart', 'Stacked Bar Chart', 'Line Chart', 'Scatter Chart'];
  queryTypes = ['LastNN', 'Today', 'Range'];

  filterFields: any[] = [];
  displayFields: any;
  defaultFields: any;
  fields: any = "null";
  selectedAnalysisId: any = this.existingData.WindowDetails?.analyticId || null;

  private _filterValue: any = null;
  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    this.onFilterValueChanged(value);
  }

  onFilterValueChanged(value: any) {
    this.formData.fields = JSON.stringify(value);

    const extractFields = (val: any): string[] => {
      if (Array.isArray(val)) {
        if (typeof val[0] === 'string' && val.length === 3) {
          return [val[0]];
        }
        return val.flatMap((v) => extractFields(v));
      }
      return [];
    };
  }

  onDragStart: DxoItemDraggingProperties['onDragStart'] = (e) => {
    e.itemData = e.fromData[e.fromIndex];
  };

  onAdd: DxoItemDraggingProperties['onAdd'] | any = (e: any) => {
    e.toData.splice(e.toIndex, 0, e.itemData);
  };

  onRemove: DxoItemDraggingProperties['onRemove'] | any = (e: any) => {
    e.fromData.splice(e.fromIndex, 1);
  };

  onReorder: DxoItemDraggingProperties['onReorder'] = (e) => {
    this.onRemove(e as DxSortableTypes.RemoveEvent);
    this.onAdd(e as DxSortableTypes.AddEvent);
  };

  ngOnInit(): void {
    this.getServers();
    this.getAnalysis();

    console.log(this.existingData.WindowDetails)
  }

  constructor(
    private apiService: ApiService,
    private route: Router,
    private location: Location
 ) { }

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.formData.servers = parsed.map((s: any) => ({
            id: s.serverid,
            name: s.servername
          }));
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  getAnalysis() {
    this.apiService.getAnalysis().subscribe({
      next: (dataFromApi: any) => {
        this.selectedData = JSON.parse(dataFromApi);

        this.menuItems = this.generateMenuItems(this.selectedData);
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  generateMenuItems(items: any[]): MenuItem[] {
    return items.map((item) => {
      const hasChildren = Array.isArray(item.Childs) && item.Childs.length > 0;
  
      const menuItem: any = {
        text: item.AnalysisName,
        items: hasChildren ? this.generateMenuItems(item.Childs) : [],
      };
  
      if (!hasChildren) {
        menuItem.onClick = () => this.onItemSelect(item);
      }
  
      return menuItem;
    });
  }

  onItemSelect(item: any) {
    this.dropdownText = item.FullName;
    if (item.FullName !== undefined) {
      this.dropDownButton.instance.close();  

      this.selectedAnalysisId = item.id;
      this.formData.analyticId = item.id;

      this.getFields(item.FullName.replace(/\s*>\s*/g, '>'))
    }
  }

  getFields(value: any) {    
    this.apiService.GetFields(value).subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsedData = JSON.parse(dataFromApi);
          const displayString = parsedData[0]?.displayfields || '';
          let conditionString = parsedData[0]?.conditionfields || '';
          const defaultString = parsedData[0]?.defaultfields || '';

          const rawDisplayFields = displayString.split(',').map((f: string) => f.trim());
          const defaultFields = defaultString.split(',').map((f: string) => f.trim());
          const displayFields = rawDisplayFields.filter((f: any) => !defaultFields.includes(f));

          conditionString = conditionString.split(',').map((field: string) => field.trim());

          this.storedFieldConfigs =  conditionString.map((field: any) => ({
            dataField: field,
            dataType: 'string',
            filterOperations: ['=', '<>', 'contains']
          }));

          this.filterFields = [...this.storedFieldConfigs];

          this.displayFields = displayFields;
          this.defaultFields = defaultFields;

          this.formData.displayFields = displayFields;
          this.formData.defaultFields = defaultFields;
        } catch (e) {
          console.error('Field parsing error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }
  
  loadFieldLookups(){
    this.storedFieldConfigs.forEach((fieldConfig: any) => {
      const fieldName = fieldConfig.dataField;

      this.apiService.GetColumnValues(fieldName, this.formData.selectServer).subscribe({
        next: (dataFromApi: any) => {
          try {
            const parsedData = JSON.parse(dataFromApi);
            this.fieldLookupValues[fieldName] = parsedData;

            const displayKey = parsedData.length > 0 ? Object.keys(parsedData[0])[0] : '';

            fieldConfig.lookup = {
              dataSource: parsedData,
              valueExpr: displayKey,
              displayExpr: displayKey,
              allowClearing: true
            };

            this.filterFields = [...this.storedFieldConfigs];

          } catch (parseError) {
          }
        },
        error: (err) => {
          console.error(`Failed to fetch column values for '${fieldName}':`, err);
        }
      });
    });
  }
  onServerValueChanged = (e: any) => {
    this.filterValue = [];
    this.formData.selectServer = e.value;

    this.loadFieldLookups();
  };

  blnChartOutput: boolean = false;
  blnTableOutput: boolean = false;
  blnrelativetime: boolean = false;

  saveControl(){
    let fromDate = formatDate(this.formData.fromDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let toDate = formatDate(this.formData.toDate, 'yyyy-MM-dd HH:mm', 'en-US');
    let timePicker = formatDate(this.formData.timePicker, 'yyyy-MM-dd HH:mm:SS', 'en-US');

    this.blnChartOutput = this.formData.showControl.includes('Chart');
    this.blnTableOutput = this.formData.showControl.includes('Datatable');
    this.blnrelativetime = this.formData.relativeTime.includes('Relative Time');

    this.formData.analyticType = this.dropdownText;
    this.formData.analyticId = this.selectedAnalysisId;

    const rawCondition = this._filterValue;
    let whereConditionFormatted = '';

    try {
      const parsed = rawCondition;
      if (Array.isArray(parsed) && parsed.length === 3) {
        const [field, operator, value] = parsed;
        whereConditionFormatted = `( ${field}${operator}'${value}' )`;
      }
    } catch (e) {
      console.error('Invalid where condition format', e);
    }

    let data: any = {
      "analysistype": this.formData.analyticId,
      "fromtime": fromDate,
      "totime": toDate,
      "serverid": this.formData.selectServer,
      "wherecondition": whereConditionFormatted,
      "displaycolums": this.formData.defaultFields.join(','),
      "blnOverTime": false,
      "durationtype": null,
      "blnchartoutput": this.blnChartOutput,
      "blntableoutput": this.blnTableOutput,
      "daterangetype": this.formData.queryType,
      "lastnndays": this.formData.lastNValue.toString(),
      "blnrelativetime": this.blnrelativetime,
      "relativetime": timePicker
    }

    console.log(data);

    this.apiService.GetAnalyticData(data).subscribe({
      next: (dataFromApi: any) => {
        let dataFromApiObj = JSON.parse(dataFromApi);

        dataFromApiObj.WindowDetails = this.formData;
        localStorage.setItem("Analysis", JSON.stringify(dataFromApiObj));

        this.route.navigate([`analytic/${this.selectedAnalysisId}`]);
      }
    })
  }

  cancelControl(){
    this.location.back();
  }
}
