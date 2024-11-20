import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillUpdateComponent } from './bill-update.component';

describe('BillUpdateComponent', () => {
  let component: BillUpdateComponent;
  let fixture: ComponentFixture<BillUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
