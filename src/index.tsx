import 'core-js/es6/map';
import 'core-js/es6/set';
import * as React from "react";
import * as ReactDOM from "react-dom";

import { NewSuggestion } from "./NewSuggestion";
import { Frontpage } from "./Frontpage";
import { ViewSuggestion } from "./ViewSuggestion";
import { SendTilKS } from "./SendTilKS/SendTilKS";
import { Vurdering } from './Components/Vurdering/Vurdering';
$.ajaxSetup({ headers: { "Accept": "application/json;odata=verbose" } })


function renderSuggestionForm(id: string) {
    ReactDOM.render(
        <NewSuggestion />,
        document.getElementById(id)
    );
}

function renderShowAllSuggestions(id: string) {
    ReactDOM.render(
        <Frontpage />,
        document.getElementById(id)
    );
}

function renderViewSuggestions(id: string) {
    ReactDOM.render(
        <ViewSuggestion />,
        document.getElementById(id)
    );
}



if (document.getElementById("vurdering") != null)
    ReactDOM.render(<Vurdering />, document.getElementById("vurdering"));


if (document.getElementById("form") != null)
    renderSuggestionForm("form");

if (document.getElementById("allsuggestions") != null)
    renderShowAllSuggestions("allsuggestions");

if (document.getElementById("forslag") != null)
    renderViewSuggestions("forslag");

if (document.getElementById("inductintegrasjon") != null) {
    ReactDOM.render(<SendTilKS />, document.getElementById("inductintegrasjon"));
}


