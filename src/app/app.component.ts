import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  currentLang = 'en';

  constructor() {

    sessionStorage.setItem('app_lang', this.currentLang);

  }


}
