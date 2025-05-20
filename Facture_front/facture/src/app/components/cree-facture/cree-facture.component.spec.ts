import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreeFactureComponent } from './cree-facture.component';

describe('CreeFactureComponent', () => {
  let component: CreeFactureComponent;
  let fixture: ComponentFixture<CreeFactureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreeFactureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreeFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
