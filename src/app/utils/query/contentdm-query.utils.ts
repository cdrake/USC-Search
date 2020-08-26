// const digitalApiPrefix = 'https://digital.tcl.sc.edu/digital';
const searchApiPrefix = 'api/search';
const withDescription = 'fields/descri';
const fieldNameMap = {'any': 'title', 'date-period': 'date', 'filmed-by': 'contri', 'filmed-location': 'coveraa', 'film-title': 'title', 'production-unit': 'creato', 'silent-film': 'dateb', 'title': 'title', 'description': 'descri', 'subject': 'subjec'};

export function buildCONTENTdmSubQueryFromQueryMap(baseApiPrefix: string, sub: string, queryMap: Map<string, string>) {
        let subQueryMap = new Map([...queryMap]);
        let subjectSearchTerm = subQueryMap.get('any');
        subQueryMap.delete('any');
        subQueryMap.set(sub,subjectSearchTerm);
        
        return buildCONTENTdmBaseQueryFromMap(baseApiPrefix, subQueryMap);
      }
    
export function buildCONTENTdmBaseQueryFromMap(baseApiPrefix: string, queryMap: Map<string, string>): string {
    let queryMode = '';
    let querySearchTerm = '';
    let queryField = '';    
    let querySearchTerms = '';
    let queryFields = '';
    let queryModes = '';
    let queryOperators = '';
    console.log('queryMap for url:');
    console.log( queryMap);
    
    for(let fieldName of queryMap.keys()) {
        console.log(fieldName + ':' + queryMap.get(fieldName));
        if(fieldName in fieldNameMap)  {
            queryField = fieldNameMap[fieldName];
        }
        else {
            queryField = fieldName;
        }
        
        if(queryFields.length > 0) {
        queryFields += '!';
        }
        queryFields += queryField;

        queryMode = getCONTENTdmMode(queryMap, fieldName);
        if(queryModes.length > 0) {
        queryModes += '!';
        }
        queryModes += queryMode;

        if(queryOperators.length > 0) {
        queryOperators += '!';
        }
        queryOperators += 'and';

        querySearchTerm = queryMap.get(fieldName);
        // remove quotes if this is an exact match
        if(queryMode == 'exact') { 
        const regex = /["']/g;
        querySearchTerm = querySearchTerm.replace(regex, '');
        
        }
        if(querySearchTerms.length > 0) {
        querySearchTerms += '!';
        }      
        querySearchTerms += encodeURIComponent(querySearchTerm);    
    }

    return `${baseApiPrefix}/${searchApiPrefix}/${withDescription}/searchterm/${querySearchTerms}/field/${queryFields}/mode/${queryModes}/conn/${queryOperators}`;
}

export function getCONTENTdmMode(queryMap: Map<string, string>, fieldName: string): string {
    const searchTerm = queryMap.get(fieldName);
    const isExact = (searchTerm.startsWith('\'') ||  searchTerm.startsWith('"')) &&
                    (searchTerm.endsWith('\'') ||  searchTerm.endsWith('"')) &&
                    (searchTerm.match(/['"]/g) || []).length == 2;
    
    return isExact ? 'exact' : 'all';
}

export function buildCONTENTdmPagedQuery(baseQuery: string, page: number, maxRecords: number) {
    return `${baseQuery}/order/nosort/ad/asc/page/${page}/maxRecords/${maxRecords}/cosuppress/0`;
}

