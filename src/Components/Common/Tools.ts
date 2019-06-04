import { Status }from "./Status";
export class Tools
{
    /**
     * Status to string       
     */
    public static statusToString(status:Status):string
    {
        switch(status)
        {
            case Status.Draft : return "Kladd"; 
            case Status.Promoted : return "Promotert"; 
            case Status.Published : return "Publisert";
            case Status.Submitted : return "Sendt inn"; 
            case Status.Success : return "Suksess"; 

        }
    }

    public static convertStatus(status:string):Status
    {
        switch(status)
        {
            case "Sendt inn" : return Status.Submitted; 
            case "Publisert": return Status.Published; 
            case "Kladd" : return Status.Draft; 
            case "Suksess" : return Status.Success; 
            case "Promotert" : return Status.Promoted; 
        }
    }

    public static IsNull(str:string):boolean
    {
        return str == null || str == undefined; 
    }

    public static FormatDate(date:Date):string
    {
        return this.padZero(date.getDate()) + "." + 
                this.padZero(date.getMonth()+1) + "." +
                date.getFullYear(); 
    }

    public static IsLatLong(location:string):boolean
    {
        if(location == null || location.length <= 0)
            return false; 
            
        if(location.indexOf(",") == -1)
            return false; 

        var parts = location.split(',');
        if(parts.length != 2)
            return false; 

        if(isNaN(parseInt(parts[0]))|| isNaN(parseInt(parts[1])))
            return false; 

        var lat = parseInt(parts[0]); 
        var lon = parseInt(parts[1]); 
        if(lat < -90 || lat > 90)
            return false;
        
        if(lon < -180 || lon > 180)
            return false;

        return true;             
    }

    private static padZero(num:number):string
    {
        return (num < 10) ? "0" + num.toString() : num.toString();
    }

    public static getFileBuffer(file:any):JQueryPromise<any> {
        var df = $.Deferred()
        var reader = new FileReader();
        reader.onloadend = function (e:any) {
            df.resolve(e.target.result);
        }
        reader.onerror = function (e:any) {
            df.reject(e.target.error);
        }
        reader.readAsArrayBuffer(file);
        return df.promise();
    }    

    public static showPastText():boolean
    {
        return GetUrlKeyValue("type") === "p"; 
    }
}