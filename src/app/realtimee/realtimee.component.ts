import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  DxToolbarModule,
  DxButtonModule,
  DxDataGridModule,
  DxResizableModule,
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
    DxResizableModule,
    DxSortableModule
  ],
  templateUrl: './realtimee.component.html',
  styleUrl: './realtimee.component.css'
})
export class RealtimeeComponent {
  cardCounter = 1;
  cards = [
    { id: this.cardCounter, width: '100%' } 
  ];

  popupVisible = false;
  selectedCardId: number | null = null;

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
      text: ''
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
        onClick: () => {},
        stylingMode: 'contained'
      }
    }
  ];

  addCard() {
    this.cardCounter++;
    this.cards.push({ id: this.cardCounter, width: '100%' });
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
}
