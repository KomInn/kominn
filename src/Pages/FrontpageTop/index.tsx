import * as React from "react";
import { Searchbar } from "../../Components/Frontpage";

export class FrontpageTop extends React.Component<{}, {}>
{
    render() {
        return (
            <>
                <Searchbar placeholderText="Søk etter forslag..." />
            </>
        )
    }
}