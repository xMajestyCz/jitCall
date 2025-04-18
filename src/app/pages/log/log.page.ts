import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: false
})
export class LogPage implements OnInit {
  user: any[] = [];

  constructor() { }

  ngOnInit() {
  }
}
