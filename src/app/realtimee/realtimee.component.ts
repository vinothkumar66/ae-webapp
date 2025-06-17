import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxToolbarModule,
  DxButtonModule,
  DxDataGridModule,
  DxPopupModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxTagBoxModule,
  DxFilterBuilderModule,
  DxListModule,
  DxResizableModule,
  DxFormComponent,
  DxSortableModule
} from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';

type DxoItemDraggingProperties = DxSortableTypes.Properties;

@Component({
  selector: 'app-realtimee',
  imports: [
    CommonModule,
    DxToolbarModule,
    DxButtonModule,
    DxDataGridModule,
    DxPopupModule,
    DxFormModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxTagBoxModule,
    DxFilterBuilderModule,
    DxListModule,
    DxResizableModule,
    DxSortableModule
  ],
  templateUrl: './realtimee.component.html',
  styleUrl: './realtimee.component.css'
})
export class RealtimeeComponent {
  @ViewChild('exportForm', { static: false }) exportForm!: DxFormComponent;

  cardCounter = 1;
  cards = [
    { id: this.cardCounter, width: '100%' } 
  ];

  popupVisible = false;
  selectedCardId: number | null = null;

  cardSettingsMap: {
    [cardId: number]: {
      settings: any;
      filterValue: any;
      displayFields: any[];
      defaultFields: any[];
    };
  } = {};

  servers: any = [];

  cardSettings: any = {
    windowTitle: '',
    server: 0,
    eventsAtStartup: 100,
    maxEvents: 1000,
    fields: '',
  };

  onCardResize(e: any, card: any) {
    card.width = `${e.width}px`;
  }

  onReorderCard(e: any) {
    const movedCard = this.cards.splice(e.fromIndex, 1)[0];
    this.cards.splice(e.toIndex, 0, movedCard);
  }

  headertoolbar = [
    {
      location: 'before',
      text: 'Realtime Viewer'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: "add",
        text: 'Add Control',
        stylingMode: 'contained',
        onClick: () => this.addCard()
      }
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: "save",
        text: 'Save',
        onClick: () => this.onSaved(),
        stylingMode: 'contained'
      }
    }
  ];

  filterFields: any[] = [];
  displayFields: any[] = [];
  defaultFields: any[] = [];

  private _filterValue: any = null;
  get filterValue(): any {
    return this._filterValue;
  }

  set filterValue(value: any) {
    this._filterValue = value;
    if (this.selectedCardId !== null) {
      this.cardSettings.fields = JSON.stringify(value);
      this.cardSettingsMap[this.selectedCardId].filterValue = value;
    }
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getServers();
  }

  addCard() {
    this.cardCounter++;
    this.cards.push({ id: this.cardCounter, width: '100%' });
  }

  onServerChange(event: any) {
    if (this.selectedCardId !== null) {
      const cardId = this.selectedCardId;
      this.cardSettingsMap[cardId].settings.server = event.value;
    }
  }

  onSettings(cardId: number) {
    this.selectedCardId = cardId;

    if (!this.cardSettingsMap[cardId]) {
      this.cardSettingsMap[cardId] = {
        settings: this.cardSettings,
        filterValue: null,
        displayFields: [],
        defaultFields: []
      };
    }

    const cardData = this.cardSettingsMap[cardId];
    this.cardSettings = { ...cardData.settings };
    this.filterValue = cardData.filterValue;
    this.displayFields = [...cardData.displayFields];
    this.defaultFields = [...cardData.defaultFields];

    this.popupVisible = true;
    this.getFields(cardId);
  }

  closePopup() {
    if (this.selectedCardId !== null) {
      const cardId = this.selectedCardId;

      this.cardSettingsMap[cardId].settings = { ...this.cardSettings };
      this.cardSettingsMap[cardId].filterValue = this.filterValue;
      this.cardSettingsMap[cardId].displayFields = [...this.displayFields];
      this.cardSettingsMap[cardId].defaultFields = [...this.defaultFields];
    }

    this.popupVisible = false;
    this.selectedCardId = null;
  }

  onRemoveCard(cardId: number) {
    this.cards = this.cards.filter(card => card.id !== cardId);
    delete this.cardSettingsMap[cardId];
  }

  getFields(cardId: number) {
    this.apiService.GetFields("Export").subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsedData = JSON.parse(dataFromApi);
          const fieldsString = parsedData[0]?.displayfields || '';
          const conditionString = parsedData[0]?.conditionfields || '';
          const defaultString = parsedData[0]?.defaultfields || '';

          const rawDisplayFields = fieldsString.split(',').map((field: string) => field.trim());
          const defaultFields = defaultString.split(',').map((field: string) => field.trim());
          const displayFields = rawDisplayFields.filter(
            (field: string) => !defaultFields.includes(field)
          );

          const conditionFields = conditionString.split(',').map((field: string) => field.trim());
          const filterFields = conditionFields.map((field: string) => ({
            dataField: field,
            dataType: 'string',
            lookup: {
              dataSource: ['104LINE3'],
              valueExpr: '',
              displayExpr: ''
            }
          }));

          this.filterFields = filterFields;
          this.displayFields = displayFields;
          this.defaultFields = defaultFields;

          this.cardSettingsMap[cardId].displayFields = displayFields;
          this.cardSettingsMap[cardId].defaultFields = defaultFields;
        } catch (e) {
          console.error('Field parsing error:', e);
        }
      },
      error: (err) => {
        console.error('API error:', err);
      }
    });
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

  onEditorPreparing(e: any) {
    if (e.dataField && e.editorOptions && e.lookup) {
      const fieldName = e.dataField;

      this.apiService.GetColumnValues(fieldName, this.cardSettings.server).subscribe({
        next: (dataFromApi: any) => {
          try {
            const parsedData = JSON.parse(dataFromApi);
            if (!parsedData.length) return;

            const firstKey = Object.keys(parsedData[0])[0];

            e.editorOptions.dataSource = parsedData;
            e.editorOptions.valueExpr = firstKey;
            e.editorOptions.displayExpr = firstKey;

            if (e.editorOptions.updateDataSource) {
              e.editorOptions.updateDataSource();
            }
          } catch (error) {
            console.error(`Error parsing values for ${fieldName}:`, error);
          }
        },
        error: (err) => {
          console.error('API error:', err);
        }
      });
    }
  }

  getServers() {
    this.apiService.getServers().subscribe({
      next: (dataFromApi: any) => {
        try {
          const parsed = JSON.parse(dataFromApi);
          this.servers = parsed.map((s: any) => ({
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

  onSaved() {
    const savedCards = this.cards.map((card) => ({
      id: card.id,
      width: card.width,
      position: this.cards.indexOf(card),
      settings: this.cardSettingsMap[card.id]?.settings,
    }));

    console.log(savedCards);
  }

  onSettingSaved() {
    const savedSettings = this.cards.map((card) => ({
      settings: this.cardSettingsMap[card.id]?.settings,
    }));

    console.log(savedSettings, this.cardSettings);
  }
}
