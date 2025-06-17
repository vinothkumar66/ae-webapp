import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { DxFormModule, DxFilterBuilderModule, DxListModule, DxButtonModule, DxDataGridModule, DxFormComponent } from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import { Workbook } from 'exceljs';
import FileSaver from 'file-saver';
import { exportDataGrid } from 'devextreme/excel_exporter';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
type DxoItemDraggingProperties = DxSortableTypes.Properties;

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [
    CommonModule,
    DxFormModule,
    DxFilterBuilderModule,
    DxListModule,
    DxButtonModule,
    DxDataGridModule
  ],
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.css']
})
export class ExportDataComponent implements OnInit {
  @ViewChild('exportForm', { static: false }) exportForm!: DxFormComponent;

  showGrid = false;

  exportFormData: any = {
    fileName: '',
    fromDate: null,
    toDate: null,
    server: null,
    fields: 'null'
  };
  filterFields: any[] = [];
  fieldLookupValues: { [key: string]: string[] } = {};
  storedFieldConfigs: any[] = [];
  servers: { id: number; name: string }[] = [];
  displayFields: string[] = [];
  defaultFields: string[] = [];
  conditionFields: string[] = [];
  exportedData: any = [];

  private _filterValue: any = null;
  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    this.onFilterValueChanged(value);
  }

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getServers();
    this.getFields();
  }

  validateToDate = (e: any) => {
    const from = this.exportFormData.fromDate;
    const to = e.value;
    return !from || !to || new Date(to) >= new Date(from);
  };

  validateConditions = (e: any) => {
    return this.filterValue && this.filterValue.length > 0;
  };

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.servers = parsed.map((s: any) => ({
            id: s.serverid,
            name: s.servername
          }));
          console.log(this.servers)
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
  }

  getFields() {
    this.apiService.GetFields("Export").subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsedData = JSON.parse(dataFromApi);
          const fieldsString = parsedData[0]?.displayfields || '';
          const conditionString = parsedData[0]?.conditionfields || '';
          const defaultString = parsedData[0]?.defaultfields || '';
  
          const rawDisplayFields = fieldsString.split(',').map((field: string) => field.trim());
          this.defaultFields = defaultString.split(',').map((field: string) => field.trim());
  
          this.displayFields = rawDisplayFields.filter(
            (field: string) => !this.defaultFields.includes(field)
          );
  
          this.conditionFields = conditionString.split(',').map((field: string) => field.trim());

          this.storedFieldConfigs =  this.conditionFields.map((field: any) => ({
            dataField: field,
            dataType: 'string',
            filterOperations: ['=', '<>', 'contains']
          }));

          // Optionally assign basic fields without lookups to display immediately
          this.filterFields = [...this.storedFieldConfigs];
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

      this.apiService.GetColumnValues(fieldName, this.exportFormData.server).subscribe({
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
    this.loadFieldLookups();
  };

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

  onFilterValueChanged(value: any) {
    this.exportFormData.fields = JSON.stringify(value);

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

  onExport() {
    const isValid = this.exportForm.instance.validate().isValid;

    const displayColumnsFormatted = this.defaultFields.join(',');
    const fromDateFormatted = formatDate(this.exportFormData.fromDate, 'dd-MMM-yyyy HH:mm:ss', 'en-US');
    const toDateFormatted = formatDate(this.exportFormData.toDate, 'dd-MMM-yyyy HH:mm:ss', 'en-US');
    const rawCondition = this.exportFormData.fields;

    let whereConditionFormatted = '';

    try {
      const parsed = JSON.parse(rawCondition);
      if (Array.isArray(parsed) && parsed.length === 3) {
        const [field, operator, value] = parsed;
        whereConditionFormatted = `( ${field}${operator}'${value}' )`;
      }
    } catch (e) {
      console.error('Invalid where condition format', e);
    }

    let postData = {
      'displaycolums': displayColumnsFormatted,
      'fromtime': fromDateFormatted,
      'maxrows': 0,
      'serverid': this.exportFormData.server,
      'totime': toDateFormatted,
      'wherecondition': whereConditionFormatted
    };

    this.apiService.exportAEData(postData).subscribe({
      next: (dataFormApi: any) => {
        const parsedData = JSON.parse(dataFormApi);
        this.exportedData = parsedData;
        if(isValid){
          this.showGrid = true;
        }
      }
    });
  }

  onBack(){
    this.showGrid = false;
  }

  onExporting(e: any) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
  
    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
        FileSaver.saveAs(new Blob([buffer], { type: 'application/octet-stream' }), this.exportFormData.fileName + '.xlsx');
      });
    });
  
    e.cancel = true;
  }
}