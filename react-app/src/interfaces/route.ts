export default interface IRoute {
    path: string;
    name: string;
    component: React.ComponentType<any>;
    keywords?: { [keyword: string]: number };
    exact?: boolean;
    children?: IRoute[]; 
    props?: any;
}