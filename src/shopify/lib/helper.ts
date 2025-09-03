export function getBy(target : any,...paths : string[]){
    for(let i = 0;i<paths.length; ++i){
        const path = paths[i];
        if(target.hasOwnProperty(path)){
            return target[path];
        }
    }
    return null;
}

export function moneyFormat(data : any,display :  Intl.NumberFormatOptions['currencyDisplay'] = 'narrowSymbol'){
    if(!data || (data.amount === undefined) || (data.currencyCode === undefined)){
        return null;
    }
    return new Intl.NumberFormat(navigator.languages, {
        style: "currency", currency: data.currencyCode,
        // currencyDisplay : 'narrowSymbol',
        currencyDisplay : display
    }).format(data.amount,);
}
