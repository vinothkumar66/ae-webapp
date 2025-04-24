import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DxToolbarModule } from 'devextreme-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-mainlayout',
  imports: [
    DxToolbarModule,
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './mainlayout.component.html',
  styleUrl: './mainlayout.component.css'
})
export class MainlayoutComponent {
  currentRoute: string = '';
  themeMode: any = 'light'; 

  headertoolbar = [
    {
      widget: 'dxButton',
      location: 'before',
      options: {
        icon: 'menu',
        stylingMode: 'text',
        onClick: () => {
          const sidebar = document.querySelector('.sidebar');
          const content = document.querySelector('.maincontent');
          sidebar?.classList.toggle('collapsed');
          content?.classList.toggle('collapsed');
        }
      },
    },
    {
      location: 'center',
      text: 'SAMA AE'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: this.themeMode === 'light' ? 'moon' : 'sun',
        stylingMode: 'text',
        onClick: () => {
          this.toggleTheme();
        }
      },
    },
    {
      location: 'after',
      text: 'Username'
    },
    {
      widget: 'dxButton',
      location: 'after',
      options: {
        icon: 'login',
        stylingMode: 'text',
        onClick: () => {
          localStorage.clear();
          this.router.navigate(['login']);
        }
      },
    },
  ];

  footertoolbar = [
    {
      location: 'before',
      text: 'Copyright © 2025 Supra Controls Pvt Ltd. All rights reserved'
    }
  ];

  constructor(private router: Router){
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  navigateTo(route: string) {
    if(route === 'login'){
      localStorage.clear();
    }
    this.router.navigate([route]);
  }

  toggleTheme() {
    const head = document.head;
    const existingLink = document.getElementById('theme-style') as HTMLLinkElement;
  
    const themeHref = this.themeMode === 'light'
      ? 'assets/themes/dx.material.blue.dark.css'
      : 'assets/themes/dx.material.blue.light.css';
  
    if (existingLink) {
      existingLink.href = themeHref;
    } else {
      const link = document.createElement('link');
      link.id = 'theme-style';
      link.rel = 'stylesheet';
      link.href = themeHref;
      head.appendChild(link);
    }
  
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
  
    this.updateHeaderToolbar();
  }  

  updateHeaderToolbar() {
    this.headertoolbar = [
      {
        widget: 'dxButton',
        location: 'before',
        options: {
          icon: 'menu',
          stylingMode: 'text',
          onClick: () => {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.maincontent');
            sidebar?.classList.toggle('collapsed');
            content?.classList.toggle('collapsed');
          }
        },
      },
      {
        location: 'center',
        text: 'SAMA AE'
      },
      {
        widget: 'dxButton',
        location: 'after',
        options: {
          icon: this.themeMode === 'light' ? 'moon' : 'sun',
          stylingMode: 'text',
          onClick: () => {
            this.toggleTheme();
          }
        },
      },
      {
        location: 'after',
        text: 'Username'
      },
      {
        widget: 'dxButton',
        location: 'after',
        options: {
          icon: 'login',
          stylingMode: 'text',
          onClick: () => {
            localStorage.clear();
            this.router.navigate(['login']);
          }
        },
      },
    ];
  }
}
