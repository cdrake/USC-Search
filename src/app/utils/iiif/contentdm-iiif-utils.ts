import { CONTENTdmItem, CONTENTdmItemNode, CONTENTdmItemNodePage, CONTENTdmItemPageInfo } from '../../models/contentdm-item.model';

const iiifPrefix = "https://digital.tcl.sc.edu/digital/iiif";
const digitalApiPrefix = 'https://digital.tcl.sc.edu/digital';

export function getIIIFUrls(item: CONTENTdmItem): string[] {
    let urls = getPageInfoArray(item).filter(url => url.hasOwnProperty('pageptr')).map(url => `${iiifPrefix}/${this.collection}/${url.pageptr}/info.json`);
   
    if(urls.length === 0) {
      return [`${digitalApiPrefix}${item.iiifInfoUri}`];
    }
    return urls;
  }

export function getPageInfoArray(item: CONTENTdmItem): CONTENTdmItemNodePage[] {
    let pages = new Array<CONTENTdmItemNodePage>();
    if('page' in item.objectInfo) {
      if(Array.isArray(item.objectInfo.page)) {
        pages = pages.concat(item.objectInfo.page);
      }
      else {
        pages.push(item.objectInfo.page);
      }
    }
    if('node' in item.objectInfo) {
      for(let key in item.objectInfo) {        
        if(key === 'node') {
          if(Array.isArray(item.objectInfo[key])) {
            pages = pages.concat(getPageInfoArrayFromNodeArray(item.objectInfo[key] as CONTENTdmItemNode[]));
          }
          else {
            pages = pages.concat(getPageInfoArrayFromNode(item.objectInfo[key] as CONTENTdmItemNode));
          }
        }
      }
    }

    return pages;
  }

function getPageInfoArrayFromNodeArray(nodes: CONTENTdmItemNode[]): CONTENTdmItemNodePage[] {
    let pages = new Array<CONTENTdmItemNodePage>();
    nodes.forEach(childNode => {
      pages = pages.concat(getPageInfoArrayFromNode(childNode));
    });
    return pages;
  }

function getPageInfoArrayFromNode(node: CONTENTdmItemNode): CONTENTdmItemNodePage[]  {
    let pages = new Array<CONTENTdmItemNodePage>();
    if(node.hasOwnProperty('page')) {
      if(Array.isArray(node.page)) {
        pages = pages.concat(node.page);
      }
      else {
        pages.push(node.page);
      }      
    }
    if(node.hasOwnProperty('node')) {
      if(Array.isArray(node.node)) {
        pages = pages.concat(getPageInfoArrayFromNodeArray(node.node));
      }
      else {
        pages = pages.concat(getPageInfoArrayFromNode(node.node));
      }
    }
    return pages;
  }