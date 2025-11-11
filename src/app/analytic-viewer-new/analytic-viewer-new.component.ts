import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxChartModule,
  DxDataGridModule
} from 'devextreme-angular';

@Component({
  selector: 'app-analytic-viewer-new',
  standalone: true,
  imports: [
    CommonModule,
    DxChartModule,
    DxDataGridModule,
    DxButtonModule
  ],
  templateUrl: './analytic-viewer-new.component.html',
  styleUrls: ['./analytic-viewer-new.component.css']
})
export class AnalyticViewerNewComponent implements OnInit {
  cards: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const storedData = localStorage.getItem('AT_Properties');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const windowGroups = parsed.WindowGroups || [];

      this.cards = windowGroups.map((group: any) => {
        const details = group.WindowDetails || {};
        const tableData = details.Table || [];

        const chartObj = details.charts?.[0] || {};
        const chartData = chartObj.data || [];

        const chartSeries = (chartObj.series || []).map((s: any) => ({
          ...s
        }));

        const chartAxes = chartObj.axis || [];
        const controls = details.WindowDetails?.showControl || [];

        const argumentAxis = {
          label: {
            overlappingBehavior: "rotate",
            rotationAngle: -45
          }
        };

        const showId = details.WindowDetails?.analyticId;

        const tooltip = {
          enabled: true,
          customizeTooltip: function (arg: any) {
            return {
              text: `${arg.argumentText} : ${arg.value}`
            };
          }
        };

         const times = chartData.map((item: any) => new Date(item.fromtime)).sort((a: any, b: any) => a.getTime() - b.getTime());

        const fromDate = times.length > 0 ? times[0] : null;
        const toDate = times.length > 0 ? times[times.length - 1] : null;

        function formatDate(date: Date | null): string | null {
          if (!date) return null;
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const hh = String(date.getHours()).padStart(2, '0');
          const mi = String(date.getMinutes()).padStart(2, '0');
          const ss = String(date.getSeconds()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        }

        return {
          id: +group.windowCardId,
          title: details.WindowDetails?.analyticTitle || 'Untitled',
          showChart: controls.includes('Chart'),
          showGrid: controls.includes('Datatable'),
          tableData,
          chartData,
          chartSeries,
          chartAxes,
          tooltip,
          showId,
          argumentAxis,
          fromDate: formatDate(fromDate),
          toDate: formatDate(toDate)
        };
      });

    console.log(this.cards)

    }
  }

  addCard() {
    const newCard = {
      id: Date.now(),
      title: '',
      showChart: false,
      showGrid: false,
      tableData: [],
      chartData: [],
      chartSeries: [],
      chartAxes: [],
      tooltip: {
        enabled: true,
        customizeTooltip: function (arg: any) {
          console.log(arg)
          return {
            text: `${arg.argumentText}: ${arg.value}`
          };
        }
      },
      argumentAxis: {
        label: {
          overlappingBehavior: "rotate",
          rotationAngle: -45
        }
      }
    };
    this.cards.push(newCard);

  }

  configureCard(id: number) {
    this.router.navigate([`analytic-control-new/${id}`]);
  }

  removeCard(id: number) {
    this.cards = this.cards.filter(card => card.id !== id);
  }

  onSaveClicked(): void {
    console.log('Save button clicked');
  }
}
