export interface CONTENTdmItemField {
    key: string,
    label: string,
    value: string
}

export interface CONTENTdmItemNodePage {
    pagetitle: string,
    pagefile: string,
    pageptr: string,
}

export interface CONTENTdmItemNode {
    nodetitle: string,
    page: CONTENTdmItemNodePage,
    node: CONTENTdmItemNode[],
}

export interface CONTENTdmObjectInfo {
    code: string,
    message: string,
    node: CONTENTdmItemNode | CONTENTdmItemNode[],
    page: CONTENTdmItemNodePage, 
}

type CONTENTdmObjectInfoOptional = Partial<CONTENTdmObjectInfo>;

export interface CONTENTdmItemPageInfo {    
    filename: string,
    contentType: string,
    text: string,
    fields: CONTENTdmItemField[],
    thumbnailUri: string,
    imageUri: string,    
    parentId: string,
}

export interface CONTENTdmItem {
    title: string,
    fields: CONTENTdmItemField[],
    thumbnailUri: string,
    itemLink: string,
    url: string,
    objectInfo: CONTENTdmObjectInfoOptional,
    iiifInfoUri: string,
}