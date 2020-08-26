export interface AppConfig {    
    envName: string;    
    dataSources: DataSource[];
}

export interface DataSource {
    key: string,
    name: string;
    url: string;
    searchPrefix: string;
    iiifPrefix: string;
    itemPrefix: string;
    type: string;
}