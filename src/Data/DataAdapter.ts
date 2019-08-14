/**
 * Generic proxy data-SPDataAdapter 
 * Calls every function in the specific SPDataAdapter. All SPDataAdapters must implement all these functions. 
 */
import { SPDataAdapter } from "./SPDataAdapter";
import { Promise } from "es6-promise";
import { Status, Suggestion, SustainabilityGoal, Person, Campaign } from "../Models";

export class DataAdapter {

    /**
     * Upload image
     * Returns: Uploaded image path
     */
    uploadImage(buffer: any, filename: string): Promise<any> {
        return SPDataAdapter.uploadImage(buffer, filename);
    }
    /**
     * Get all suggestions
     * Param: (optional) SuggestionType 
     * Returns: Array with all suggestions, sorted by date. 
     */
    getAllSuggestions(type?: Status, top?: number, customQuery?: string, customSort?: string): Promise<Suggestion[]> {
        return SPDataAdapter.getAllSuggestions(type, top, customQuery, customSort);
    }


    /**
     *  Get sustainability-goals 
     */
    getSustainabilityGoals(): Promise<Array<SustainabilityGoal>> {
        return SPDataAdapter.getSustainabilityGoals();
    }

    /**
     * Get my suggestions
     * Gets all suggestions submitted by user 
     */
    getMySuggestions(): Promise<Suggestion[]> {
        return SPDataAdapter.getMySuggestions();
    }

    /**
     * Get suggestion by title (Search for suggestions)
     */
    getSuggestionByTitle(title: string) {
        return SPDataAdapter.getSuggestionByTitle(title);
    }

    /**
     * Get suggestion by id     
     */
    getSuggestionById(id: string) {
        return SPDataAdapter.getAllSuggestions(null, 1, `&$filter=Id eq ${id}`);
    }

    /**
     * Get user profile 
     * Retrieves any avilable fields for the Person-object. 
     */
    getMyUserProfile(): Promise<Person> {
        return SPDataAdapter.getMyUserProfile();
    }

    /**
     * Submit suggestions
     * Returns: (Suggestion) The submitted suggestion
     */
    submitSuggestion(suggestion: Suggestion): Promise<Suggestion> {
        return SPDataAdapter.submitSuggestion(suggestion);
    }

    /**
     * Get comments for suggestion 
     * Returns: The suggestion with comments loaded
     */
    getCommentsForSuggestion(suggestion: Suggestion): Promise<Suggestion> {
        return SPDataAdapter.getCommentsForSuggestion(suggestion);
    }

    /**
     * Submit comment for suggestion
     * Returns: The suggestion with the added comment
     */
    submitCommentForSuggestion(text: string, suggestion: Suggestion): Promise<Suggestion> {
        return SPDataAdapter.submitCommentForSuggestion(text, suggestion);
    }

    /**
     * UpdateLike for suggestion
     * Returns: The suggestion with updated like count (Suggestion)
     */
    updateLike(suggestion: Suggestion): Promise<Suggestion> {
        return SPDataAdapter.updateLike(suggestion);
    }

    /**
     * Get city and county code 
     * @return {Promise<Promise>} A person-object with City and CountyCode filled out
     */
    getCityAndCountryCode(person: Person): Promise<Person> {
        return SPDataAdapter.getCityAndCountryCode(person);
    }

    /**
     * Post to Induct API
     * @returns ID of item in Induct
     */
    submitToInduct(suggestion: Suggestion): Promise<string> {
        return SPDataAdapter.submitToInduct(suggestion);
    }

    getAllCampaigns(): Promise<Array<Campaign>> {
        return new Promise(resolve => {
            $.get(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('Kampanje')/Items`).then((s: any) => {
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

    doesUserHavePermission(kind: SP.PermissionKind) {
        return SPDataAdapter.doesUserHavePermission(kind);
    }

    /**
     * Get config
     */
    getConfig(): Promise<Object> {
        return SPDataAdapter.getConfig();
    }
}