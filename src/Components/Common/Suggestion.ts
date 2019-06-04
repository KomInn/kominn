/**
 * Data model for suggestions
 */
// TODO: Endre navn fra Person til Text 
import { Comment } from "./Comment";
import { Person } from "./Person";
import { Status } from "./Status";
import { Tools } from "./Tools";
import { SustainabilityGoal } from "./SustainabilityGoal";

export class Suggestion {
    public Id: number;  // List item ID
    public Title: string;
    public Summary: string;
    public Challenges: string;
    public SuggestedSolution: string;
    public InspiredBy: Array<Suggestion>;
    public Likes: number;
    public Image: string;
    public Location: string;
    public UsefulForOthers: string;
    public UsefulnessType: string;
    public Submitter: Person;
    public NumberOfComments: number;
    public Comments: Array<Comment>;
    public Tags: Array<string>;
    public Status: Status;
    public Created: Date;
    public MonthlyStartDate: Date;
    public MonthlyEndDate: Date;
    public IsPast: boolean
    public SendTilKS: boolean;
    public SustainabilityGoals: Array<SustainabilityGoal>;

    constructor() {
        this.Id = -1;
        this.Comments = new Array<Comment>();
        this.Likes = 0;
        this.Submitter = new Person();
        this.SustainabilityGoals = new Array<SustainabilityGoal>();
    }

    public get Url(): string {
        return _spPageContextInfo.webAbsoluteUrl + "/SitePages/Forslag.aspx?forslag=" + this.Id;
    }

    public get Validates(): boolean {
        if (this.Title == null || this.Title.length <= 0)
            return false;

        if (this.Summary == null || this.Title.length <= 0)
            return false;

        if (this.Challenges == null || this.Challenges.length <= 0)
            return false;

        if (this.SuggestedSolution == null || this.SuggestedSolution.length <= 0)
            return false;

        if (this.Submitter == null)
            return false;

        if (this.Submitter.Name == null || this.Submitter.Name.length <= 0)
            return false;

        return true;
    }

    public get CopyUrl(): string {
        return _spPageContextInfo.webAbsoluteUrl + "/SitePages/NyttForslag.aspx?kopier=" + this.Id;
    }

    public get MapUrl(): string {
        var mapsApiKey = "AIzaSyBEQC7aWXruMiVIMfR_ev-7AFFqs96xn2c";
        return "//www.google.com/maps/embed/v1/place?key=" + mapsApiKey + "&q=" + this.Location;
    }

    public get LocationLatLng(): google.maps.LatLng {
        if (this.Location == null)
            return null;

        if (!Tools.IsLatLong(this.Location))
            return null;

        var s = this.Location.split(',');
        return new google.maps.LatLng(parseFloat(s[0].trim()), parseFloat(s[1].trim()));
    }
}