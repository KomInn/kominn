import 'core-js/es6/map';
import 'core-js/es6/set';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { initializeIcons } from "@uifabric/icons";
import { Vurdering } from './Components/Vurdering';
import { NewSuggestion, Frontpage, ViewSuggestion, SendTilKS } from './Pages';

$.ajaxSetup({ headers: { "Accept": "application/json;odata=verbose" } })
initializeIcons(undefined, { disableWarnings: true });

if (document.getElementById("vurdering") != null)
    ReactDOM.render(<Vurdering />, document.getElementById("vurdering"));

if (document.getElementById("newsuggestion") != null)
    ReactDOM.render(<NewSuggestion />, document.getElementById("newsuggestion"));

if (document.getElementById("frontpage") != null)
    ReactDOM.render(<Frontpage />, document.getElementById("frontpage"));

if (document.getElementById("viewsuggestion") != null)
    ReactDOM.render(<ViewSuggestion />, document.getElementById("viewsuggestion"));

if (document.getElementById("sendtilks") != null) {
    ReactDOM.render(<SendTilKS />, document.getElementById("sendtilks"));
}


