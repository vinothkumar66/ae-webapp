import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
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
  DxFormComponent
} from 'devextreme-angular';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-realtime-viewer',
imports: [
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
    CommonModule
  ],
  templateUrl: './realtime-viewer.component.html',
  styleUrl: './realtime-viewer.component.css'
})
export class RealtimeViewerComponent {
 @ViewChild('realtimeForm', { static: false }) realtimeForm!: DxFormComponent;

  cardCounter: number = 0;
  cards: any[] = [];
  pollingIntervals: any[] = [];

  headertoolbar = [
    {
      location: 'before',
      text: 'Realtime Viewer'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: 'add',
        text: 'Add Control',
        stylingMode: 'contained',
        type: 'default',
        onClick: () => this.addCard()
      }
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: 'save',
        text: 'Save',
        type: 'success',
        stylingMode: 'contained'
      }
    }
  ];

  constructor(private apiService: ApiService, private route: Router) {}

  ngOnInit(): void {
    const localStorageData = localStorage.getItem('RT_Properties');

    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          this.cards = parsedData.map((item: any) => ({
            id: Number(item.windowCardId),
            windowTitle: item.windowTitle || `Realtime control ${item.windowCardId}`,
            dataSource: [],
            columns: (item.defaultFields || []).map((field: string) => ({
              dataField: field
            })),
            lastRecordId: 0,
            firstCallDone: false,
            windowId: item.windowId,
            maxVisibleItems: item.maxEventsToDisplay
          }));

          this.cardCounter = Math.max(...this.cards.map(c => c.id)) + 1;

          this.cards.forEach(card => {
            this.fetchCardData(card);

            const intervalId = setInterval(() => {
              this.fetchCardData(card);
            }, 5000);

            this.pollingIntervals.push(intervalId);
          });
        }
      } catch (error) {
        console.error('Failed to parse RT_Properties:', error);
        this.cards = [];
      }
    }
  }

  fetchCardData(card: any) {
    const maxRecords = card.firstCallDone ? 0 : card.maxVisibleItems;
  
    this.apiService
      .GetRealTimeData(card.windowId, maxRecords, card.lastRecordId)
      .subscribe({
        next: (response: any) => {
          try {
            const parsedResponse = JSON.parse(response);
  
            if (parsedResponse.length > 0) {
              card.lastRecordId = parsedResponse[parsedResponse.length - 1].recordid;
  
              card.dataSource = [...parsedResponse, ...card.dataSource];
  
              card.dataSource = card.dataSource
                .sort((a: any, b: any) => b.recordid - a.recordid)
                .slice(0, card.maxVisibleItems);
            }
  
            card.firstCallDone = true;
          } catch (e) {
            console.error(`Failed to parse response for card ${card.id}:`, e);
          }
        },
        error: err => {
          console.error(`Error fetching data for card ${card.id}:`, err);
        }
      });
  }

  getWindowTitle(cardId: number): string {
    const card = this.cards.find(c => c.id === cardId);
    return card?.windowTitle || `Realtime control ${cardId}`;
  }

  onSettings(cardId: number) {
    this.route.navigate([`realtime-control/${cardId}`]);
  }

  addCard() {
    this.cardCounter++;
    this.cards.push({
      id: this.cardCounter,
      dataSource: [],
      columns: [],
      lastRecordId: 0,
      firstCallDone: false,
      windowId: null,
      maxVisibleItems: 0
    });
  }

  onRemoveCard(cardId: number) {
    this.cards = this.cards.filter(card => card.id !== cardId);
  }

  ngOnDestroy(): void {
    this.pollingIntervals.forEach(id => clearInterval(id));
  }
}
