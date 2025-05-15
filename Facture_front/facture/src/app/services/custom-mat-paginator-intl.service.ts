import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomMatPaginatorIntlService extends MatPaginatorIntl {
  override changes = new Subject<void>();

  constructor(private translate: TranslateService) {
    super();
    console.log('CustomMatPaginatorIntlService initialized');
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();
      this.changes.next();
    });
  }

  updateTranslations() {
    const itemsPerPage = this.translate.instant('PAGINATOR.ITEMS_PER_PAGE');
    const rangeTemplate = this.translate.instant('PAGINATOR.RANGE');
    console.log('updateTranslations - ITEMS_PER_PAGE:', itemsPerPage);
    console.log('updateTranslations - RANGE template:', rangeTemplate);

    this.itemsPerPageLabel = itemsPerPage;
    this.nextPageLabel = this.translate.instant('PAGINATOR.NEXT_PAGE');
    this.previousPageLabel = this.translate.instant('PAGINATOR.PREVIOUS_PAGE');
    this.firstPageLabel = this.translate.instant('PAGINATOR.FIRST_PAGE');
    this.lastPageLabel = this.translate.instant('PAGINATOR.LAST_PAGE');
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const params = {
        start: length === 0 || pageSize === 0 ? 0 : page * pageSize + 1,
        end: length === 0 || pageSize === 0 ? 0 : Math.min((page + 1) * pageSize, length),
        total: length
      };
      let result: string;
      try {
        result = this.translate.instant('PAGINATOR.RANGE', params);
        if (result === 'PAGINATOR.RANGE' || result.includes('{start}')) {
          // Fallback to manual interpolation
          result = rangeTemplate
            .replace('{start}', params.start.toString())
            .replace('{end}', params.end.toString())
            .replace('{total}', params.total.toString());
        }
      } catch (error) {
        console.error('Translation error:', error);
        result = `${params.start} – ${params.end} sur ${params.total}`;
      }
      console.log('getRangeLabel:', params, 'result:', result);
      return result;
    };
  }

  get changes$() {
    return this.changes.asObservable();
  }
}