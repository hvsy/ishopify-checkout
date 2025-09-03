export const ArrayHelper = {
    replace<T extends any[]>(items: T|undefined,index : number,value : any){
        const newItems = [...(items||[])];
        newItems[index] = value;
        return newItems;
    }
}
