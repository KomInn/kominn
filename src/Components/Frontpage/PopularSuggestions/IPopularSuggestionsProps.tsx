import * as moment from "moment";
export interface IPopularSuggestionsProps {
    title: string;
    emptyText: string;
    fromDate: moment.Moment;
    toDate: moment.Moment;
}
