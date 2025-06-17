import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;
  username = '';
  password = '';
  
  constructor(private apiService: ApiService, private router: Router, private authService: AuthService) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    localStorage.clear();
    if (this.username && this.password) {
      const loginData = {
        UserName: this.username,
        Password: this.password,
        grant_type: 'password',
      };

      localStorage.setItem('Username', this.username);
      
      this.apiService.storePassword(
        this.password
      );

      this.apiService.tokenLogin(loginData).subscribe(
        (tokenResponse) => {
          const accessToken = tokenResponse.access_token;

          if (accessToken) {
            this.authService.setToken(accessToken); 

            this.apiService.login(loginData).subscribe(
              (loginResponse) => {
                this.authService.setAuthUser(loginResponse);
                this.router.navigate(['analytic']);
              },
              (error) => {
                console.error('Login failed', error);
              }
            );
          } else {
            console.error('Token not received. Please try again.');
          }
        },
        (error) => {
          console.error('Token login failed', error);
        }
      );
    } else {
      console.error('Please enter valid credentials.');
    }
  }
}
