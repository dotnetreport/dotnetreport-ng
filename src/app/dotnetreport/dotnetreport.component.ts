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

export class DotnetreportComponent implements OnInit, OnDestroy {
  private baseServiceUrl: string;
  public exportExcelUrl: string;

  constructor(injector: Injector,
    private sanitizer: DomSanitizer,
    private cdref: ChangeDetectorRef,
    private http: HttpClient) { 

      this.baseServiceUrl = "http://localhost:39378";    
      this.exportExcelUrl = this.baseServiceUrl + '/Report/DownloadExcel';
    }

  ngOnInit() {

    let getUsersAndRolesUrl = this.baseServiceUrl + "/Report/GetUsersAndRoles";
    getUsersAndRolesUrl = getUsersAndRolesUrl.replace(/[?&]$/, "");

    this.http.get(getUsersAndRolesUrl).subscribe((response: any) => {

        let result = response['result'];
        let vm = new reportViewModel({
            runReportUrl: this.baseServiceUrl + '/Report/Report',
            reportWizard: $("#modal-reportbuilder"),
            lookupListUrl: this.baseServiceUrl + '/Report/GetLookupList',
            apiUrl: this.baseServiceUrl + '/Report/CallReportApi',
            runReportApiUrl: this.baseServiceUrl + '/Report/RunReportApi',
            getUsersAndRolesUrl: this.baseServiceUrl + '/Report/GetUsersAndRoles',
            userSettings: result,
            execReportUrl: this.baseServiceUrl + '/Report/RunReport',
            samePageOnRun: true
        });

        vm.printReport = function () {
            var printWindow = window.open("");
            printWindow?.document.open();
            printWindow?.document.write('<html><head>' +
                '<link href="/app/main/theme.css" rel="stylesheet" />' +
                '<style type="text/css">a[href]:after {content: none !important;}</style>' +
                '</head><body>' + $('.report-inner').html() +
                '</body></html>');

            setTimeout(function () {
                printWindow?.print();
                printWindow?.close();
            }, 250);
        }

        vm.downloadExcel = function () {
            $("#downloadExcel").submit();
        }

        vm.init(0, result.noAccount);

        this.renderKOTemplates();
        ko.applyBindings(vm, document.getElementById('dot-net-reports'));

        this.bindWindowResize(vm);
    });
}

ngOnDestroy() {
    ko.cleanNode(document.getElementById('dot-net-reports'));
}

private renderKOTemplates() {

  this.cdref.detectChanges();
}

private bindWindowResize(vm: any): void {
  $(window).resize(function () {
      if (vm.reportMode == "execute") {
          vm.DrawChart()
      };
  });
}


}
