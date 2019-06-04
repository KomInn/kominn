import * as $ from "jquery"; 
import { Promise } from "es6-promise"; 

$.ajaxSetup({ headers: { "Accept": "application/json;odata=verbose" } })
export  class Campaign 
{
    StartDate:string;
    EndDate:string;
    Text:string;
    CompRef:string; 
    Placement:number; 
    Type:string; 

    public static getAllCampaigns():Promise<Array<Campaign>>
    {
        return new Promise( (resolve, reject) => { 
        
        $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Kampanje')/Items").then( (s:any) => {             
            var campaigns = s.d.results.map( (i:any) => { 
                var campaign = new Campaign();
                campaign.CompRef = i.CompRef; 
                campaign.EndDate = i.EndDate; 
                campaign.Placement = i.Placement; 
                campaign.StartDate = i.StartDate; 
                campaign.Text = i.Text; 
                campaign.Type = i.Type; 

                return campaign; 
            })
            resolve(campaigns);

        })
    });
    }
}