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
  public reportTemplates: SafeHtml;

  constructor(injector: Injector,
    private sanitizer: DomSanitizer,
    private cdref: ChangeDetectorRef,
    private http: HttpClient) { 

      this.baseServiceUrl = "http://localhost:39378";    
      this.exportExcelUrl = this.baseServiceUrl + '/Report/DownloadExcel';
      this.reportTemplates = "";
    }

  ngOnInit() {

    let getUsersAndRolesUrl = this.baseServiceUrl + "/DotNetReport/GetUsersAndRoles";
    getUsersAndRolesUrl = getUsersAndRolesUrl.replace(/[?&]$/, "");

    this.http.get(getUsersAndRolesUrl).subscribe((response: any) => {

        let result = response;
        let vm = new reportViewModel({
            runReportUrl: this.baseServiceUrl + '/DotNetReport/Report',
            reportWizard: $("#modal-reportbuilder"),
            lookupListUrl: this.baseServiceUrl + '/DotNetReport/GetLookupList',
            apiUrl: this.baseServiceUrl + '/DotNetReport/CallReportApi',
            runReportApiUrl: this.baseServiceUrl + '/DotNetReport/RunReportApi',
            getUsersAndRolesUrl: this.baseServiceUrl + '/DotNetReport/GetUsersAndRoles',
            userSettings: result,
            execReportUrl: this.baseServiceUrl + '/DotNetReport/RunReport',
            samePageOnRun: true,
            runExportUrl: this.baseServiceUrl,
            printReportUrl: this.baseServiceUrl + '/DotNetReport/ReportPrint'
        });

        vm.printReport = function () {
            var printWindow = window.open("");
            printWindow?.document.open();
            printWindow?.document.write('<html><head>' +
                '<link href="/Content/bootstrap.css" rel="stylesheet" />'+
                '<style type="text/css">a[href]:after {content: none !important;}</style>' +
                '</head><body>' + $('.report-inner').html() +
                '</body></html>');
           
            setTimeout(function () {
                printWindow?.print();
                printWindow?.close();
            }, 250);
        }


        vm.init(0, result.noAccount);

        this.renderKOTemplates();
        ko.applyBindings(vm, document.getElementById('dot-net-report'));

        this.bindWindowResize(vm);
    });
}

ngOnDestroy() {
    ko.cleanNode(document.getElementById('dot-net-report'));
}

public init() {
    this.ngOnInit();
}

private renderKOTemplates() {

  this.reportTemplates = this.sanitizer.bypassSecurityTrustHtml(`
  <script type="text/html" id="report-filter">
  <div class="form-group">
      <!-- ko if: !hasForeignKey-->
      <!-- ko if: fieldType=='DateTime'-->
      <!-- ko if: ['=','>','<','>=','<=', 'not equal'].indexOf($parent.Operator()) != -1 -->
      <input class="form-control" data-bind="datepicker: $parent.Value" required />
      <!-- /ko -->
      <!-- ko if: ['between'].indexOf($parent.Operator()) != -1 -->
      From
      <input required class="form-control" data-bind="datepicker: $parent.Value" />
      to
      <input data-bind="datepicker: $parent.Value2" class="form-control" required />
      <!-- /ko -->
      <!-- ko if: ['range'].indexOf($parent.Operator()) != -1 -->
      <select data-bind="value: $parent.Value" class="form-control" required>
          <option value=""></option>
          <option>Today</option>
          <option>Today +</option>
          <option>Today -</option>
          <option>Yesterday</option>
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
          <option>Last Year</option>
          <option>This Month To Date</option>
          <option>This Year To Date</option>
          <option>Last 30 Days</option>
          <optgroup label="Comparison Options">
              <option>>= Today</option>
              <option><= Today</option>
              <option>>= Today +</option>
              <option><= Today +</option>
              <option>>= Today -</option>
              <option><= Today -</option>
          </optgroup>
      </select>
      <div data-bind="if: $parent.Value().indexOf('Today +') >= 0 || $parent.Value().indexOf('Today -') >= 0" class="form-group pull-left" style="padding-top: 5px;">
          <input type="number" class="form-control input-sm pull-left" style="width: 80px;" data-bind="value: $parent.Value2" required /><span style="padding: 5px 5px;" class="pull-left"> days</span>
      </div>
      <!-- /ko -->
      <!-- /ko -->
      <!-- ko if: ['Int','Money','Float','Double'].indexOf(fieldType) != -1 -->
      <!-- ko if: ['=','>','<','>=','<=', 'not equal'].indexOf($parent.Operator()) != -1 && ['is blank', 'is not blank', 'is null', 'is not null'].indexOf($parent.Operator()) == -1 -->
      <input class="form-control" type="number" data-bind="value: $parent.Value, disable: $parent.Operator() == 'is default'" required />
      <!-- /ko -->
      <!-- ko if: ['between'].indexOf($parent.Operator()) != -1 -->
      From
      <input class="form-control" type="number" data-bind="value: $parent.Value" required />
      to
      <input class="form-control" type="number" data-bind="value: $parent.Value2" required />
      <!-- /ko -->
      <!-- /ko -->
      <!-- ko if: fieldType=='Boolean' && ['is blank', 'is not blank', 'is null', 'is not null'].indexOf($parent.Operator()) == -1 -->
      <select required class="form-control" data-bind="value: $parent.Value, disable: $parent.Operator() == 'is default'">
          <option value="1">Yes</option>
          <option value="0">No</option>
      </select>
      <!-- /ko -->
      <!-- ko if: ['Int','Money','Float','Double','Date','DateTime','Boolean'].indexOf(fieldType) == -1 && ['is blank', 'is not blank', 'is null', 'is not null'].indexOf($parent.Operator()) == -1 -->
      <input class="form-control" type="text" data-bind="value: $parent.Value, disable: $parent.Operator() == 'is default'" required />
      <!-- /ko -->
      <!-- /ko -->
      <!-- ko if: hasForeignKey-->
      <!-- ko if: hasForeignParentKey && $parent.showParentFilter() -->
      <select multiple class="form-control" data-bind="select2: { placeholder: 'Please Choose', allowClear: true }, options: $parent.ParentList, optionsText: 'text', optionsValue: 'id', selectedOptions: $parent.ParentIn"></select>
      <!-- /ko -->
      <!-- ko if: $parent.Operator()=='='-->
      <select required class="form-control" data-bind="options: $parent.LookupList, optionsText: 'text', optionsValue: 'id', value: $parent.Value, optionsCaption: 'Please Choose'"></select>
      <!-- /ko -->
      <!-- ko if: $parent.Operator()=='in' || $parent.Operator()=='not in'-->
      <select required multiple class="form-control" data-bind="select2: { placeholder: 'Please Choose', allowClear: true }, options: $parent.LookupList, optionsText: 'text', optionsValue: 'id', selectedOptions: $parent.ValueIn"></select>
      <!-- /ko -->
      <!-- /ko -->
  </div>
</script>
<script type="text/html" id="pager-template">
  <div class="pager-container">
      <a href="" title="first" data-bind="click: first, enable: !isFirstPage()"><i class="fa fa-backward report-pager-btn" style="font-size: 18px;"></i></a>&nbsp;
      <a href="" title="previous" data-bind="click: previous, enable: !isFirstPage()"><i class="fa fa-caret-left fa-2x report-pager-btn"></i></a>
      <select class="form-control form-control-sm" data-bind="options: [10,30,50,100,150,200,500], value: pageSize"></select>
      <span class="pager-pageinfo">
          <span>Page</span>&nbsp;
          <input type="number" min="1" pattern="[0-9]*" class="form-control form-control-sm text-center" data-bind="
                              value: currentPage,
                              attr: { max: pages() }" />&nbsp;
          <span>of</span>&nbsp;
          <span data-bind="text: pages"></span>
      </span>&nbsp;

      <a href="" title="next" data-bind="click: next, enable: !isLastPage()"><i class="fa fa-caret-right fa-2x report-pager-btn"></i></a>&nbsp;
      <a href="" title="last" data-bind="click: last, enable: !isLastPage()"><i class="fa fa-forward report-pager-btn" style="font-size: 18px;"></i></a>
  </div>
</script>

<script type="text/html" id="report-column-header">
  <!-- ko foreach: Columns -->
  <th data-bind="attr: { id: fieldId }, css: {'right-align': IsNumeric}, style: {'width': fieldWidth, 'background-color': headerBackColor }" style="border-right: 1px solid;">
      <!-- ko if: $parents[1].useStoredProc ? $parents[1].useStoredProc() : ($parents[2].useStoredProc ? $parents[2].useStoredProc() : false) -->
      <span data-bind="text: fieldLabel ? fieldLabel : fieldName, style: {'color': headerFontColor, 'font-weight': headerFontBold ? 'bold' : 'normal'}"></span>
      <!-- /ko -->
      <!-- ko ifnot: $parents[1].useStoredProc ? $parents[1].useStoredProc() : ($parents[2].useStoredProc ? $parents[2].useStoredProc() : false)  -->
      <a href="" data-bind="click: function(){ $parents[1].pager ? $parents[1].changeSort(SqlField) : $parents[2].changeSort(SqlField); }, style: {'color': headerFontColor, 'font-weight': headerFontBold ? 'bold' : 'normal'}">
          <span data-bind="text: fieldLabel ? fieldLabel : ColumnName"></span>
          <span data-bind="text: ($parents[1].pager ? $parents[1].pager.sortColumn() : $parents[2].pager.sortColumn()) === SqlField ? (($parents[1].pager ? $parents[1].pager.sortDescending() : $parents[2].pager.sortDescending()) ? '&#9660;' : '&#9650;') : ''"></span>
      </a>
      <!-- /ko -->
  </th>
  <!-- /ko -->
</script>
<script type="text/html" id="report-column">
  <!-- ko foreach: Items -->
  <td data-bind="style: {'background-color': backColor, 'color': fontColor, 'font-weight': fontBold ? 'bold' : 'normal', 'text-align': $parents[3].pager && $parents[3].ReportType()=='Single' ? 'center' : (fieldAlign ? fieldAlign : (Column.IsNumeric ? 'right' : 'left')), 'font-size':$parents[3].pager && $parents[3].ReportType()=='Single' ? '64px' : ''}">
      <!-- ko if: LinkTo-->
      <a data-bind="attr: {href: LinkTo}"><span data-bind="html: FormattedValue"></span></a>
      <!-- /ko-->
      <!-- ko ifnot: LinkTo-->
      <span data-bind="html: FormattedValue"></span>
      <!-- /ko-->
  </td>
</script>

<script type="text/html" id="report-template">
  <div class="report-chart" data-bind="attr: {id: 'chart_div_' + $parent.ReportID()}, visible: $parent.isChart"></div>
  <!-- ko if: !$parent.isChart() || $parent.ShowDataWithGraph() -->
  <div class="table-responsive" data-bind="with: ReportData">
      <table class="table table-hover table-condensed">
          <thead data-bind="if: $parents[1].ReportType() != 'Single'">
              <tr class="no-highlight">
                  <!-- ko if: $parentContext.$parent.canDrilldown() && !IsDrillDown() -->
                  <th style="width: 30px; border-left: 1px solid;"></th>
                  <!-- /ko -->
                  <!-- ko template: 'report-column-header', data: $data -->
                  <!-- /ko-->
              </tr>
          </thead>
          <tbody>
              <tr style="display: none;" data-bind="visible: Rows.length < 1">
                  <td class="text-info" data-bind="attr:{colspan: Columns.length}">
                      No records found
                  </td>
              </tr>
              <!-- ko foreach: Rows  -->
              <tr>
                  <!-- ko if: $parentContext.$parentContext.$parent.canDrilldown() && !$parent.IsDrillDown() -->
                  <td style="width: 30px; vertical-align: middle;"><a href="#" data-bind="click: function(){ toggle(); }"><span class="fa" data-bind="css: {'fa-plus': !isExpanded(), 'fa-minus': isExpanded()}"></span></a></td>
                  <!-- /ko -->
                  <!-- ko template: 'report-column', data: $data -->
                  <!-- /ko-->
              </tr>
              <!-- ko if: isExpanded -->
              <tr>
                  <td style="width: 30px;"></td>
                  <td data-bind="attr:{colspan: $parent.Columns.length }" style="padding-left: 0px;">
                      <!-- ko if: DrillDownData -->
                      <table class="table table-hover table-condensed" data-bind="with: DrillDownData">
                          <thead>
                              <tr class="no-highlight">
                                  <!-- ko template: 'report-column-header', data: $data -->
                                  <!-- /ko-->
                              </tr>
                          </thead>
                          <tbody>
                              <tr style="display: none;" data-bind="visible: Rows.length < 1">
                                  <td class="text-info" data-bind="attr:{colspan: Columns.length}">
                                      No records found
                                  </td>
                              </tr>
                              <!-- ko foreach: Rows  -->
                              <tr>
                                  <!-- ko template: 'report-column', data: $data -->
                                  <!-- /ko-->
                              </tr>
                              <!-- /ko -->
                          </tbody>
                      </table>
                      <div class="col-xs-12 col-centered" data-bind="with: pager">
                          <div class="form-inline small text-muted">
                              <div class="pull-left total-records" data-bind="visible: pages()">
                                  <span data-bind="text: 'Total Records: ' + totalRecords()"></span>
                              </div>
                             
                              <div class="form-group pull-right" data-bind="visible: pages()">
                                  <div data-bind="template: 'pager-template', data: $data"></div>
                              </div>
                          </div>
                      </div>
                      <!-- /ko -->
                  </td>
              </tr>
              <!-- /ko -->
              <!-- /ko -->
          </tbody>
          <!-- ko if: $parent.SubTotals().length == 1 -->
          <tfoot data-bind="foreach: $parent.SubTotals">
              <tr>
                  <!-- ko if: $parentContext.$parentContext.$parent.canDrilldown() && !$parent.IsDrillDown() -->
                  <td></td>
                  <!-- /ko -->
                  <!-- ko foreach: Items -->
                  <!-- ko if: Value != 'NA' -->
                  <td data-bind="style: {'background-color': backColor, 'color': fontColor, 'font-weight': fontBold ? 'bold' : 'normal', 'text-align': $parents[3].pager && $parents[3].ReportType()=='Single' ? 'center' : (fieldAlign ? fieldAlign : (Column.IsNumeric ? 'right' : 'left')), 'font-size':$parents[3].pager && $parents[3].ReportType()=='Single' ? '64px' : ''}">
                      <span data-bind="html: FormattedValue, css: {'right-align': true}"></span>
                  </td>
                  <!-- /ko -->
                  <!-- /ko -->
              </tr>
          </tfoot>
          <!-- /ko -->
      </table>
  </div>
  <!-- /ko -->
</script>
<script type="text/html" id="admin-mode-template">
  <div class="row" style="padding: 10px 10px">
      <div class="material-switch pull-right">
          <input id="admin-mode" type="checkbox" data-bind="checked: adminMode" />
          <label for="admin-mode" class="label-primary"></label>
      </div>
      <div class="pull-right">Admin Mode</div>
  </div>

  <div class="alert alert-info" data-bind="visible: adminMode">
      <i class="fa fa-user-circle"></i>Admin Mode is turned on now, it allows you to setup and view Reports or Dashboards for all roles and users. You should remove the Admin mode toggle for non-admin users.<br />
  </div>
</script>
<script type="text/html" id="manage-access-template">
  <h5><span class="fa fa-key"></span>Manage Access</h5>
  <div class="panel panel-default panel-body" style="margin-left: 20px;">
      <div class="alert alert-info">
          <span class="fa fa-lightbulb-o fa-2x"></span>&nbsp;User level rights over rule Role level rights. No selection for a rule implies report is available to all.
      </div>
      <b>Manage by User</b> (allow edit)
      <div class="row container-fluid">
          <!-- ko foreach: manageAccess.users -->
          <div class="pull-left">
              <div class="checkbox">
                  <label class="label label-info">
                      <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                  </label>
              </div>
          </div>
          <!-- /ko -->
      </div>
      <br />
      <b>View only by User</b> (no edit/delete)
      <div class="row container-fluid">
          <!-- ko foreach: manageAccess.viewOnlyUsers -->
          <div class="pull-left">
              <div class="checkbox">
                  <label class="label label-info">
                      <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                  </label>
              </div>
          </div>
          <!-- /ko -->
      </div>
      <br />
      <div data-bind="ifnot: manageAccess.isDashboard">
          <b>Delete by User</b> (allow delete)
          <div class="row container-fluid">
              <!-- ko foreach: manageAccess.deleteOnlyUsers -->
              <div class="pull-left">
                  <div class="checkbox">
                      <label class="label label-info">
                          <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                      </label>
                  </div>
              </div>
              <!-- /ko -->
          </div>
          <br />
      </div>
      <b>Manage by User Role</b> (allow edit)
      <div class="row container-fluid">
          <!-- ko foreach: manageAccess.userRoles -->
          <div class="pull-left">
              <div class="checkbox">
                  <label class="label label-info">
                      <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                  </label>
              </div>
          </div>
          <!-- /ko -->
      </div>
      <br />
      <b>View only by User Role</b> (no edit/delete)
      <div class="row container-fluid">
          <!-- ko foreach: manageAccess.viewOnlyUserRoles -->
          <div class="pull-left">
              <div class="checkbox">
                  <label class="label label-info">
                      <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                  </label>
              </div>
          </div>
          <!-- /ko -->
      </div>
      <div data-bind="ifnot: manageAccess.isDashboard">            
          <br />
          <b>Delete by User Role</b> (allow delete)
          <div class="row container-fluid">
              <!-- ko foreach: manageAccess.deleteOnlyUserRoles -->
              <div class="pull-left">
                  <div class="checkbox">
                      <label class="label label-info">
                          <input type="checkbox" data-bind="checked: selected">&nbsp;<span data-bind="text: text"></span>&nbsp;
                      </label>
                  </div>
              </div>
              <!-- /ko -->
          </div>
      </div>
  </div>
</script>
<script type="text/html" id="filter-group">
  <div data-bind="foreach: FilterGroups">
      <div class="card" style="margin-left: 20px;">
          <div class="card-body" data-bind="visible: !isRoot">
              <select data-bind="value: AndOr" class="form-control form-control-sm pull-left">
                  <option>And</option>
                  <option>Or</option>
              </select>
              <button class="btn btn-sm btn-secondary pull-left" data-bind="click: $parent.RemoveFilterGroup, visible: !isRoot">Remove Group</button>&nbsp;
              <hr />
          </div>
          <div data-bind="template: {name: 'filter-inner'}"></div>
      </div>
  </div>
</script>
<script type="text/html" id="fly-filter-template">
  <div class="card" data-bind="visible: FlyFilters().length>0">
      <div class="card-header">
          <h5 class="card-title">
              <a data-toggle="collapse" data-target="#filter-panel" href="#">
                  <i class="fa fa-filter"></i>Choose filter options
              </a>
          </h5>
      </div>
      <div id="filter-panel" class="card-body">
          <div>
              <!-- ko foreach: FlyFilters -->
              <div class="row">

                  <div class="col-sm-5 col-xs-4">
                      <div data-bind="with: Field" class="checkbox">
                          <div class="checkbox">
                              <label>
                                  <input type="checkbox" title="Apply this filter" data-bind="checked: $parent.Apply" /><span data-bind="text: selectedFieldName"></span>
                              </label>
                          </div>
                      </div>
                  </div>
                  <div data-bind="with: Field" class="col-sm-2 col-xs-3">
                      <div class="form-group" data-bind="if: $parent.Apply">
                          <select class="form-control" data-bind="options: fieldFilter, value: $parent.Operator" required></select>
                      </div>
                  </div>
                  <div data-bind="with: Field" class="col-xs-5">
                      <div data-bind="if: $parent.Apply">
                          <div data-bind="template: 'report-filter', data: $data"></div>
                      </div>
                  </div>
              </div>
              <!-- /ko -->
              <button class="btn btn-primary" data-bind="click: RunReport">Refresh Report</button>
          </div>
      </div>
  </div>
</script>

<script type="text/html" id="filter-inner">
  <div class="table-responsive">
      <table class="table  table-hover table-borderless" data-bind="visible: Filters().length>0">
          <thead>
              <tr>
                  <th style="width: 10%"></th>
                  <th style="width: 30%">Field</th>
                  <th style="width: 10%"></th>
                  <th style="width: 30%">Filter</th>
                  <th></th>
              </tr>
          </thead>
          <tbody data-bind="foreach: Filters">
              <tr>
                  <td>
                      <select data-bind="value: AndOr, visible: $index()>0" class="form-control">
                          <option>And</option>
                          <option>Or</option>
                      </select>
                  </td>
                  <td>
                      <div class="form-group">
                          <select class="form-control" style="width: 100%;" data-bind="options: $root.selectedFieldsCanFilter, optionsText: 'selectedFieldName', optionsCaption: 'Please Choose', value: Field, attr: {required: Field()==null?'required':false}, disable: Field() && Field().forced"></select>
                      </div>
                  </td>
                  <td data-bind="with: Field">
                      <div class="form-group">
                          <select class="form-control" style="width: 100%;" data-bind="options: fieldFilter, value: $parent.Operator" required></select>
                      </div>
                  </td>
                  <td data-bind="with: Field">
                      <div data-bind="template: 'report-filter', data: $data"></div>
                  </td>
                  <td>
                      <span data-bind="visible: Field() && Field().forced" class="badge badge-info">Required Filter</span>
                      <button class="btn btn-sm btn-secondary" data-bind="click: $parent.RemoveFilter, hidden: Field() && Field().forced">Remove</button>
                      <!-- ko if: Field() && Field().fieldType == 'DateTime' && Operator() == 'range' && $root.canAddSeries() && $index()==0 -->
                      <button class="btn btn-sm btn-secondary" data-bind="click: $root.AddSeries.bind($data)">Add Comparison</button>
                      <!--/ko -->
                  </td>
              </tr>
              <!-- ko foreach: compareTo -->
              <tr>
                  <td></td>
                  <td style="text-align: right"><button class="btn btn-xs" data-bind="click: $root.RemoveSeries"><span class="fa fa-trash-o"></span></button></td>
                  <td>Compare To</td>
                  <td>
                      <div class="form-group">
                          <select class="form-control" data-bind="options: Range, value: Value" required></select>
                      </div>
                  </td>
              </tr>
              <!-- /ko -->
          </tbody>
      </table>
  </div>
  <div data-bind="template: {name: 'filter-group'}"></div>
  <div>
      <button class="btn btn-sm btn-link" data-bind="click: AddFilterGroup">Add Group</button>&nbsp;
      <button class="btn btn-sm btn-link" data-bind="click: AddFilter">Add Filter</button>
  </div>
</script>

<script type="text/html" id="filter-parameters">
  <div class="table-responsive card" style="margin-left: 20px;">
      <div class="card-body">
          <span data-bind="hidden: showParameters">No filters available to choose</span>
          <table class="table  table-hover table-borderless" data-bind="visible: showParameters">
              <thead>
                  <tr>
                      <th style="width: 30%">Paramter</th>
                      <th style="width: 20%"></th>
                      <th style="width: 30%">Value</th>
                      <th></th>
                  </tr>
              </thead>
              <tbody data-bind="foreach: Parameters">
                  <tr data-bind="ifnot: Hidden">
                      <td data-bind="text: DisplayName">
                      </td>
                      <td>
                          <div class="form-group">
                              <select class="form-control" style="width: 100%;" data-bind="options: operators, value: Operator" required></select>
                          </div>
                      </td>
                      <td data-bind="with: Field">
                          <div data-bind="template: 'report-filter', data: $data"></div>
                      </td>
                      <td></td>
                  </tr>

              </tbody>
          </table>
      </div>
  </div>
</script>
<script type="text/html" id="report-schedule">
<div data-bind="with: scheduleBuilder">
    <div class="checkbox">
        <label>
            <input type="checkbox" data-bind="checked: hasSchedule" />
            Schedule Report
        </label>
    </div>
    <div data-bind="if: hasSchedule">

        <div class="form-inline form-group">
            <span data-bind="text: selectedOption() != 'once' ? 'Every ' : ''"></span>&nbsp;
            <select class="form-control" required data-bind="options: options, value: selectedOption"></select>
            <div data-bind="if: selectedOption() == 'once'">
            &nbsp;on&nbsp;<input data-bind="datepicker: selectedDate" class="form-control" required />
            </div>
            <div data-bind="if: showDays">
            &nbsp;on&nbsp;<select multiple class="form-control" required style="width: 30%;" data-bind="select2: { placeholder: 'Choose Days', allowClear: true }, options: days, selectedOptions: selectedDays"></select>
            </div>
            <div data-bind="if: showDates">
            &nbsp;on&nbsp;<select multiple class="form-control" required style="width: 30%;" data-bind="select2: { placeholder: 'Choose Dates', allowClear: true }, options: dates, selectedOptions: selectedDates"></select>
            </div>
            <div data-bind="if: showMonths">
            &nbsp;of&nbsp;<select multiple class="form-control" required style="width: 30%;" data-bind="select2: { placeholder: 'Choose Months', allowClear: true }, options: months, selectedOptions: selectedMonths"></select>
            </div>
            <div data-bind="if: showAtTime">
            &nbsp;at&nbsp;<select class="form-control" data-bind="options: hours, value: selectedHour"></select>
            <select class="form-control" data-bind="options: minutes, value: selectedMinute"></select>
            <select class="form-control" data-bind="value: selectedAmPm">
                <option>AM</option>
                <option>PM</option>
            </select>
            </div>
        </div>
        <div class="alert alert-info">
            Report will be run and emailed <span data-bind="text: selectedOption() != 'once' ? 'every' : ''"></span> <span data-bind="text: selectedOption"></span>
            <div data-bind="if: selectedOption() == 'once'">
            on <span class="error" data-bind="visible: !selectedDate()">Please pick a Date</span> <span data-bind="text: selectedDate"></span>
            </div>
            <div data-bind="if: showDays">
            on <span class="error" data-bind="visible: selectedDays().length == 0">Please pick Day(s)</span> <span data-bind="text: selectedDays"></span>
            </div>
            <div data-bind="if: showDates">
            on <span class="error" data-bind="visible: selectedDates().length == 0">Please pick Date(s)</span>
            <span data-bind="foreach: selectedDates"><span data-bind="visible: $index()>0">, </span><span data-bind="text: $data == 1 ? '1st': ($data == 2 ? '2nd' : ($data == 3 ? '3rd' : $data+'th'))"></span></span>
            </div>
            <div data-bind="if: showMonths">
            of <span class="error" data-bind="visible: selectedMonths().length == 0">Please pick Month(s)</span> <span data-bind="text: selectedMonths"></span>
            </div>
            <div data-bind="if: showAtTime">
            at <span data-bind="text: selectedHour"></span>:<span data-bind="text: selectedMinute"></span> <span data-bind="text: selectedAmPm"></span>
            </div>
        </div>
        <div class="form-horizontal form-group">
            <div class="form-group row">
                <label class="col-sm-2 control-label">Email to</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" style="width: 100%;" data-bind="value: emailTo" placeholder="Enter Email Addresses separated by comma to send the Report to" required />
                </div>
            </div>
        </div>
        <div class="form-horizontal form-group">
            <div class="form-group row">
                <div class="col-sm-2 control-label">
                    <div class="checkbox">
                        <label title="Set a date to start sending scheduled report">
                            <input type="checkbox" data-bind="checked: hasScheduleStart" />
                            Set Schedule Start Date
                        </label>
                    </div>
                </div>
                <div class="col-sm-4" data-bind="if: hasScheduleStart">
                    <input type="text" class="form-control" data-bind="datepicker: scheduleStart" title="Scheduled Report will not be sent before this date" required />
                </div>
            </div>
        </div>

        <div class="form-horizontal form-group">
            <div class="form-group row">
                <div class="col-sm-2 control-label">
                    <div class="checkbox" title="Set a date to stop sending scheduled report">
                        <label>
                            <input type="checkbox" data-bind="checked: hasScheduleEnd" />
                            Set Schedule End Date
                        </label>
                    </div>
                </div>
                <div class="col-sm-4" data-bind="if: hasScheduleEnd">
                    <input type="text" class="form-control" data-bind="datepicker: scheduleEnd" title="Scheduled Report will not be sent after this date" required />
                </div>
            </div>
        </div>
    </div>
</div>
</script>

  `);
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
