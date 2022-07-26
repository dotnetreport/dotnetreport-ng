import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotnetreportComponent } from './dotnetreport.component';

describe('DotnetreportComponent', () => {
  let component: DotnetreportComponent;
  let fixture: ComponentFixture<DotnetreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DotnetreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DotnetreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
