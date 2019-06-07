/**
 * SPDataAdapter 
 * 
 * Data transmission and retrieval functions for interfacing SharePoint on-prem or in the cloud
 */

$.ajaxSetup({ headers: { "Accept": "application/json;odata=verbose" } })
import { Suggestion } from "./Suggestion";
import { Person } from "./Person";
import { Comment } from "./Comment";
import { Status } from "./Status";
import { Tools } from "./Tools";
import { SustainabilityGoal } from "./SustainabilityGoal";
import { Promise } from "es6-promise";
import { Campaign } from "./Campaign";


interface UserProfileProperty {
    Key: string, Value: string, ValueType: string
}

interface SustainabilityGoalRestRequest { d: { results: [{ Id: number, Title: string, IkonId: number }] } }
interface SustainabilityIconRestRequest { d: { results: [SustainabilityIconObject] } }
interface SustainabilityIconObject { File: { ServerRelativeUrl: string }, Id: number }
export class SPDataAdapter {

    /**
     * Sustainabilitygoals
     * Returns: Array of sustainabilitygoals with id's
     */
    static getSustainabilityGoals(): Promise<Array<SustainabilityGoal>> {
        return new Promise((resolve, _reject) => {
            var icons = new Array<SustainabilityIconObject>();
            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Ikoner')/Items?$select=Id,File/ServerRelativeUrl&$expand=File").then(
                (result: SustainabilityIconRestRequest) => {
                    icons = result.d.results.map((s: SustainabilityIconObject) => s);

                    $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Baerekraftsmaal')/Items?$select=Title,Id,IkonId").then(
                        (result: SustainabilityGoalRestRequest) => {
                            var results = result.d.results.map((r) => {
                                var icon = icons.filter((i) => i.Id === r.IkonId);
                                return { Id: r.Id, Title: r.Title, ImageSrc: (icon.length > 0) ? icon[0].File.ServerRelativeUrl : "" } as SustainabilityGoal;
                            });
                            resolve(results);
                        }
                    );


                })

        }
        )
    }

    /**
   * Upload image
   * Returns: Uploaded image path
   */
    static uploadImage(buffer: any, filename: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Tools.getFileBuffer(buffer).then(() => {
                var url = _spPageContextInfo.webAbsoluteUrl +
                    "/_api/web/lists/getbytitle('Bilder')/rootfolder/files" +
                    "/add(url='" + filename + "', overwrite=true)";
                jQuery.ajax({
                    url: url,
                    type: "POST",
                    data: buffer,
                    processData: false,
                    success: () => resolve(),
                    error: () => reject(),
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "content-length": buffer.byteLength
                    }
                });
            });
        });

    }
    /**
     * Get all suggestions
     * Param: (optional) Status: Gets all with assigned status
     * Param: (optional) Count: Gets a set count
     * Returns: Array with all suggestions, sorted by date. 
     */
    static getAllSuggestions(type?: Status, top?: number, customFilter?: string, customSort?: string): Promise<Array<Suggestion>> {
        return new Promise((resolve, _reject) => {
            var numResults = (top == null) ? 100 : top;
            var query = (type == null) ? "" : "&$filter=KmiStatus ne 'Sendt inn' and KmiStatus eq '" + Tools.statusToString(type) + "'";
            var sortStr = "&$orderby=Created desc";
            if (customSort != null)
                sortStr = customSort;

            if (customFilter != null)
                query = customFilter;

            this.getSustainabilityGoals().then((susgoals: Array<SustainabilityGoal>) => {
                var suggestions = new Array<Suggestion>();
                $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Forslag')/Items?$select=*,Author/Id,KmiInspiredBy/Id,KmiInspiredBy/Title&$expand=KmiInspiredBy,Author&$top=" + numResults + sortStr + query).then((result: any) => {
                    suggestions = result.d.results.map((result: any) => {
                        var p = new Person();
                        var s = new Suggestion();
                        p.Name = result.KmiName;
                        p.Address = result.KmiAddress;
                        p.City = result.KmiCity;
                        p.CountyCode = result.KmiCountyCode;
                        p.Department = result.KmiDepartment;
                        p.MailAddress = result.KmiMailAddress;
                        p.Manager = result.KmiManagerId;
                        p.Telephone = result.KmiTelephone;
                        p.Zipcode = result.KmiZipcode;
                        s.Id = result.Id;
                        s.Challenges = result.KmiChallenges;
                        s.Image = Tools.IsNull(result.KmiImage) ? "" : result.KmiImage;
                        s.Likes = Tools.IsNull(result.KmiLikes) ? 0 : result.KmiLikes;
                        s.Location = result.KmiLocation;
                        s.NumberOfComments = Tools.IsNull(result.KmiNumberOfComments) ? 0 : result.KmiNumberOfComments;
                        s.Status = Tools.convertStatus(result.KmiStatus);
                        s.Submitter = p;
                        s.SuggestedSolution = result.KmiSuggestedSolution;
                        s.Summary = result.KmiSummary;
                        s.InspiredBy = (result.KmiInspiredBy != null) ? result.KmiInspiredBy.results : null;
                        if (result.KmiTags != null)
                            s.Tags = result.KmiTags.results;
                        s.Title = result.Title;
                        s.UsefulForOthers = result.KmiUsefulForOthers;
                        s.UsefulnessType = result.KmiUsefulnessType;
                        s.Created = new Date(result.Created);
                        s.SendTilKS = result.KmiSendToKS;
                        for (let goal of result.KmiSustainabilityGoalsId.results) {
                            s.SustainabilityGoals.push(susgoals.filter((s) => s.Id === goal)[0]);
                        }
                        return s;
                    });
                    resolve(suggestions);
                });

            })



        });
    }

    public static getMySuggestions(): Promise<Array<Suggestion>> {
        var userId = _spPageContextInfo.userId;
        return this.getAllSuggestions(null, null, "&$filter=Author/Id eq " + userId);
    }

    public static getSuggestionByTitle(title: string): Promise<Array<Suggestion>> {
        return this.getAllSuggestions(null, null, "&$filter=substringof('" + encodeURI(title) + "', Title) and KmiStatus ne 'Sendt inn'");
    }

    public static getMyUserProfile(): Promise<Person> {
        return new Promise((resolve, _reject) => {
            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties")
                .then((result: any) => {
                    var p = new Person();
                    p.Id = _spPageContextInfo.userId;
                    p.ProfileImageUrl = result.d.PictureUrl;
                    p.Name = result.d.DisplayName;
                    p.Address = this.getUserProfileProperty("Office", result.d.UserProfileProperties.results);
                    p.Department = this.getUserProfileProperty("SPS-JobTitle", result.d.UserProfileProperties.results);
                    p.MailAddress = result.d.Email;
                    p.Branch = this.getUserProfileProperty("Department", result.d.UserProfileProperties.results);
                    p.ManagerLoginName = this.getUserProfileProperty("Manager", result.d.UserProfileProperties.results);
                    p.Telephone = this.getUserProfileProperty("CellPhone", result.d.UserProfileProperties.results);

                    if (p.ManagerLoginName == null || p.ManagerLoginName.length <= 0) {
                        resolve(p);
                        return;
                    }
                    this.ensureUser(p.ManagerLoginName).then((result: any) => {
                        p.Manager = new Person();
                        p.Manager.Id = result.d.Id;
                        p.Manager.Name = result.d.Title;
                        resolve(p);
                        return;
                    });
                });
        })
    }

    /**
     * Returns the ID of a resolved user, or -1 if not found.  
     */
    private static ensureUser(loginName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            var payload = { 'logonName': loginName };
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/ensureuser",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(payload),
                headers: {
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "accept": "application/json;odata=verbose"
                }
            }).then((data: any) => { resolve(data); })
                .fail((err: any) => { reject(); });
        });
    }

    private static getUserProfileProperty(property: string, userProfileProperties: Array<UserProfileProperty>): string {
        for (let prop of userProfileProperties) {
            if (prop.Key == property) {
                return prop.Value;
            }
        }
        return "";

    }

    public static getAllCampaigns(): Promise<Array<Campaign>> {
        return new Promise((resolve, _reject) => {

            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Kampanje')/Items").then((s: any) => {
                var campaigns = s.d.results.map((i: any) => {
                    var campaign = new Campaign();
                    campaign.CompRef = i.KmiCampaignRef;
                    campaign.EndDate = i.KmiCampaignEndDate;
                    campaign.Placement = i.KmiCampaignPlacement;
                    campaign.StartDate = i.KmiCampaignStartDate;
                    campaign.Text = i.KmiCampaignText;
                    campaign.Type = i.KmiCampaignType;
                    return campaign;
                })
                resolve(campaigns);

            })
        });
    }

    /**
     * Submit suggestions
     * Returns: (Suggestion) The submitted suggestion
     */
    static submitSuggestion(suggestion: Suggestion): Promise<Suggestion> {
        return new Promise((resolve, reject) => {
            var s = suggestion;
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Forslag");
            var itemcreationinfo = new SP.ListItemCreationInformation();
            var item = list.addItem(itemcreationinfo);
            item.set_item("Title", s.Title);
            item.set_item("KmiSummary", s.Summary);
            item.set_item("KmiChallenges", s.Challenges);
            item.set_item("KmiSuggestedSolution", s.SuggestedSolution);
            item.set_item("KmiLocation", s.Location);
            item.set_item("KmiUsefulForOthers", s.UsefulForOthers);
            item.set_item("KmiUsefulnessType", s.UsefulnessType);
            item.set_item("KmiCountyCode", s.Submitter.CountyCode);
            item.set_item("KmiName", s.Submitter.Name);
            item.set_item("KmiAddress", s.Submitter.Address);
            item.set_item("KmiMailAddress", s.Submitter.MailAddress);
            item.set_item("KmiTelephone", s.Submitter.Telephone);
            item.set_item("KmiZipcode", s.Submitter.Zipcode);
            item.set_item("KmiCity", s.Submitter.City);
            item.set_item("KmiDepartment", s.Submitter.Department);
            item.set_item("KmiImage", s.Image);
            item.set_item("KmiStatus", Tools.statusToString(Status.Submitted));
            item.set_item("KmiCompRef", GetUrlKeyValue("ref"));
            item.set_item("KmiSendToKS", false);
            item.set_item("KmiIsPast", (GetUrlKeyValue("type") === "p"));

            if (s.Submitter.Manager != null && s.Submitter.Manager.Id != -1) {
                var manager = new SP.FieldUserValue();
                manager.set_lookupId(s.Submitter.Manager.Id);
                item.set_item("KmiManager", s.Submitter.Manager.Id);
            }
            if (s.InspiredBy != null) {
                var inspiredByField = new Array<SP.FieldLookupValue>();
                for (let v of s.InspiredBy) {
                    var lookup = new SP.FieldLookupValue();
                    lookup.set_lookupId(v.Id);
                    inspiredByField.push(lookup);
                }
                item.set_item("KmiInspiredBy", inspiredByField);
            }

            if (s.SustainabilityGoals.length > 0) {
                var sustainabilityGoalsField = new Array<SP.FieldLookupValue>();
                for (let v of s.SustainabilityGoals) {
                    var lookup = new SP.FieldLookupValue();
                    lookup.set_lookupId(v.Id);
                    sustainabilityGoalsField.push(lookup);
                }
                item.set_item("KmiSustainabilityGoals", sustainabilityGoalsField);
            }

            item.update();
            context.load(item);
            context.executeQueryAsync(
                () => {
                    resolve(s);
                },
                (_fail: any, error: any) => {
                    console.log(error.get_message());
                    reject(error.get_message());
                });

        });
    }

    /**
     * Get comments for suggestion 
     * Returns: The suggestion with comments loaded
     */
    static getCommentsForSuggestion(suggestion: Suggestion): Promise<Suggestion> {
        return new Promise((resolve, _reject) => {
            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Kommentarer')/Items?$orderby=Created desc&$filter=SuggestionId eq " + suggestion.Id + "").then(
                (result: any) => {
                    var c = new Array<Comment>();
                    for (let item of result.d.results) {
                        var comment = new Comment();
                        comment.Created = new Date(item.Created);
                        comment.CreatedBy = item.Title;
                        comment.Image = item.Image;
                        comment.SuggestionId = item.SuggestionId;
                        comment.Text = item.Text;
                        c.push(comment);
                    }
                    var s = new Suggestion();
                    s = suggestion;
                    s.Comments = c;
                    return resolve(s);

                })

        });
    }

    /**
     * Submit comment for suggestion
     * Returns: The suggestion with the added comment
     */
    static submitCommentForSuggestion(text: string, suggestion: Suggestion): Promise<any> {
        return new Promise((resolve, reject) => {
            var s = suggestion;
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Kommentarer");
            var itemcreationinfo = new SP.ListItemCreationInformation();
            var item = list.addItem(itemcreationinfo);
            this.getMyUserProfile().then((person: Person) => {
                item.set_item("Title", person.Name);
                item.set_item("Text", text);
                item.set_item("Image", person.ProfileImageUrl);
                item.set_item("SuggestionId", suggestion.Id);
                item.update();
                context.load(item);
                context.executeQueryAsync(
                    (success: any) => {
                        this.increaseCommentCount(context, s).then(() => {
                            resolve();
                        });
                    },
                    (fail: any, error: any) => {
                        reject(error.get_message());
                    });
            });
        });
    }

    static increaseCommentCount(ctx: SP.ClientContext, s: Suggestion): Promise<any> {
        return new Promise((resolve, reject) => {
            var list = ctx.get_web().get_lists().getByTitle("Forslag");
            var item = list.getItemById(s.Id);
            ctx.load(item);
            ctx.executeQueryAsync(() => {
                var vals = item.get_fieldValuesAsText();
                ctx.load(vals);
                ctx.executeQueryAsync(() => {
                    var val = vals.get_item("NumberOfComments");
                    var count = 0;
                    if (val.length <= 0 || val === "0")
                        count = 0;
                    else
                        count = parseInt(val);

                    count++;
                    item.set_item("NumberOfComments", count);
                    item.update();
                    list.update();
                    ctx.executeQueryAsync(() => {
                        resolve();
                    }, () => reject());
                });
            })
        });
    }

    /**
     * UpdateLike for suggestion
     * Returns: The suggestion with updated like count (Suggestion)
     */
    static updateLike(suggestion: Suggestion): Promise<Suggestion> {
        return new Promise((resolve, reject) => {
            // Get existing like 
            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Likes')/Items?$filter=(Forslag eq " + suggestion.Id + " and Author/Id eq " + _spPageContextInfo.userId + ")&$select=Id,Author/Id&$expand=Author").then(
                (result: any) => {
                    if (result.d.results.length <= 0) {
                        this.addLike(suggestion).then(
                            () => {
                                this.UpdateLikeCountInList(suggestion, 1).then(() => {
                                    //console.log("+1", suggestion);
                                    var s = suggestion;
                                    s.Likes++;
                                    resolve(s);
                                })
                            });
                        return;
                    }
                    this.removeLike(result.d.results[0].Id).then(
                        () => {
                            this.UpdateLikeCountInList(suggestion, -1).then(() => {
                                var s = suggestion;
                                s.Likes--;
                                resolve(s);
                            })
                        });
                });

        });
    }

    private static UpdateLikeCountInList(suggestion: Suggestion, count: number): Promise<{}> {
        return new Promise((resolve, reject) => {
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Forslag");
            var item = list.getItemById(suggestion.Id);
            item.refreshLoad();
            context.load(item, 'FieldValuesAsText');
            context.executeQueryAsync(() => {
                var current = item.get_fieldValuesAsText();
                var cnt = current.get_item("KmiLikes");

                var x = 0;
                if (cnt.length <= 0 || cnt === "0")
                    x = 1;
                else
                    x = Math.floor(parseInt(cnt)) + count;

                item.refreshLoad();

                item.set_item("KmiLikes", x);
                item.update();

                context.executeQueryAsync(() => {
                    resolve();
                },
                    (err: any, b: any) => {
                        console.log(b.get_message());
                        reject(err);
                    });
            });
        });
    }

    private static removeLike(id: number): Promise<Suggestion> {
        return new Promise((resolve, reject) => {
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Likes");
            var item = list.getItemById(id);
            item.deleteObject();
            context.executeQueryAsync(
                (_success: any) => {
                    resolve();
                },
                (_fail: any, error: any) => {
                    reject(error.get_message());
                });

        });
    }

    private static addLike(suggestion: Suggestion): Promise<Suggestion> {
        return new Promise((resolve, reject) => {
            var s = suggestion;
            var context = SP.ClientContext.get_current();
            var list = context.get_web().get_lists().getByTitle("Likes");
            var itemcreationinfo = new SP.ListItemCreationInformation();
            var item = list.addItem(itemcreationinfo);
            item.set_item("Forslag", suggestion.Id);
            item.update();
            context.load(item);
            context.executeQueryAsync(
                (_success: any) => {
                    resolve();
                },
                (_fail: any, error: any) => {
                    reject(error.get_message());
                });
        });
    }

    public static getCityAndCountryCode(person: Person): Promise<Person> {
        return new Promise((resolve, _reject) => {
            var p = person;
            $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Kommunenumre')/Items?$filter=Postnummer eq '" + person.Zipcode + "'&$select=Kommunenummer,Sted&$top=1").then(
                (result: any) => {
                    if (result.d.results.length <= 0) {
                        resolve(p);
                        return;
                    }
                    p.CountyCode = result.d.results[0].Kommunenummer;
                    p.City = result.d.results[0].Sted;
                    resolve(p);
                });

        });
    }

    /**
     * Submit to Induct
     * Submits the suggestion to Induct
     * @returns string with object ID from Induct  
     */

    public static submitToInduct(suggestion: Suggestion): Promise<string> {
        return new Promise((resolve, reject) => {
            if (suggestion.SendTilKS) {
                reject("Forslaget er allerede sendt til KS.");
                return;
            }
            var data = {
                title: suggestion.Title,
                description: this.suggestionAsHtml(suggestion)
            }
            // Get Client ID from configuration
            $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('InductKonfigurasjon')/Items",
                headers: { "Accept": "application/json;odata=verbose" },
            }).done((r: any) => {
                if (r.d.results.length <= 0) {
                    reject("Konfigurasjon mangler.");
                    return;
                }
                var clientID = r.d.results[0].KlientID;
                // Post to Induct API
                $.ajax({
                    url: "https://api.induct.no/v1/" + clientID + "/initiatives/ideas",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    type: "POST"
                }).done((s: any) => {
                    // Set "Send to KS" to true on the item.
                    var updObj = {
                        '__metadata': { 'type': 'SP.Data.ForslagItem' },
                        SendToKS: true
                    }

                    $.ajax({
                        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Forslag')/items(" + suggestion.Id + ")",
                        method: "POST",
                        contentType: "application/json;odata=verbose",
                        data: JSON.stringify(updObj),
                        headers: {
                            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                            "accept": "application/json;odata=verbose",
                            "IF-MATCH": "*",
                            "X-HTTP-Method": "MERGE"
                        }
                    }).then((_data) => { resolve(s.id) })
                        .fail((a, b) => { console.log(a, b.message); reject(); });
                });
            });
        });
    }



    private static suggestionAsHtml(s: Suggestion) {
        return `
        <b>Sammendrag</b>
        <p>${s.Summary}</p>
        <br/><br/>
        <b>Utfordringer</b>
        <p>${s.Challenges}</p>
        <br/><br/>
        <b>Løsningforslag</b>
        <p>${s.SuggestedSolution}</p>
        <br/><br/>
        <b>Nyttetype</b>
        <p>${s.UsefulnessType}</p>
        `;
    }
}
