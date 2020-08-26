export interface CONTENTdmSearchResult {
    collectionAlias: string,
    itemId: string,
    thumbnailUri: string,
    itemLink: string,
    title: string,
    metadataFields: {
        field: string
        value: string
    }[]
}

export interface CONTENTdmSearchResults {
    totalResults: number,
    items: CONTENTdmSearchResult[]
}