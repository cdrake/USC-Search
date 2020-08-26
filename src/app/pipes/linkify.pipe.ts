import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  constructor(private _domSanitizer: DomSanitizer) {}

  transform(value: any, args?: any): any {
    return this._domSanitizer.bypassSecurityTrustHtml(this.stylize(value));
  }

  // Modify this method according to your custom logic
  private stylize(text: string): string {
    let stylizedText: string = '';
    if (text && text.length > 0) {
      for (let t of text.split(" ")) {
        if (this.isHttp(t))
          stylizedText += `<a href="${t}">${t}</a> `;
        else
          stylizedText += t + " ";
      }
      return stylizedText;
    }
    else return text;
  }

  private isHttp(text: string): boolean {
      if(text && text.length > 0) {
        if(text.toLowerCase().startsWith("http://") ||
        text.toLowerCase().startsWith("https://")) {
            return true;
        }
      }
      return false;
  }

}