import { Component } from '@angular/core';
import { DxToolbarModule} from 'devextreme-angular';

@Component({
  selector: 'app-home',
  imports: [
    DxToolbarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  headertoolbar = [
    {
      location: 'before',
      text: 'Dashboard'
    }
  ];
}
