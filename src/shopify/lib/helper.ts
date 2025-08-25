export function getBy(target : any,...paths : string[]){
    for(let i = 0;i<paths.length; ++i){
        const path = paths[i];
        if(target.hasOwnProperty(path)){
            return target[path];
        }
    }
    return null;
}
