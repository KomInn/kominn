import 'core-js/es6/map';
import 'core-js/es6/set';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { initializeIcons } from "@uifabric/icons";
import { NewSuggestion } from "./NewSuggestion";
import { Frontpage } from "./Pages/Frontpage";
import { ViewSuggestion } from "./Pages/ViewSuggestion";
import { SendTilKS } from "./Pages/SendTilKS";
import { Vurdering } from './Components/Vurdering';

$.ajaxSetup({ headers: { "Accept": "application/json;odata=verbose" } })
initializeIcons(undefined, { disableWarnings: true });

if (document.getElementById("vurdering") != null)
    ReactDOM.render(<Vurdering />, document.getElementById("vurdering"));

if (document.getElementById("form") != null)
    ReactDOM.render(<NewSuggestion />, document.getElementById("form"));

if (document.getElementById("allsuggestions") != null)
    ReactDOM.render(<Frontpage />, document.getElementById("allsuggestions"));

if (document.getElementById("forslag") != null)
    ReactDOM.render(<ViewSuggestion />, document.getElementById("forslag"));

if (document.getElementById("inductintegrasjon") != null) {
    ReactDOM.render(<SendTilKS />, document.getElementById("inductintegrasjon"));
}


