import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support',
  standalone: false,
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {


  constructor(private router: Router) { }

  ngOnInit() { }

  gotochat() {
    this.router.navigate(['/chat-box'])
  }

}
