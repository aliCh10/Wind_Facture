import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturePreviewModalComponent } from './facture-preview-modal.component';

describe('FacturePreviewModalComponent', () => {
  let component: FacturePreviewModalComponent;
  let fixture: ComponentFixture<FacturePreviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FacturePreviewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturePreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
