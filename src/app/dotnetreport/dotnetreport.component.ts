import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var ko: any;
declare var reportViewModel: any;
declare var $: any;

@Component({
  selector: 'app-dotnetreport',
  templateUrl: './dotnetreport.component.html',
  styleUrls: ['./dotnetreport.component.css']
})
export class DotnetreportComponent implements OnInit {

  constructor() { 

    
    //ko.applyBindings(vm, document.getElementById('dot-net-reports'));
  }

  ngOnInit(): void {
  }

}
