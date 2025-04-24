import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import config from 'devextreme/core/config'; 
import { licenseKey } from './devextreme-license'; 
 
config({ licenseKey });  

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Error bootstrapping the application:', err);
  });
