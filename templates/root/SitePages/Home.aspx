<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <script type="text/javascript" src="../SiteAssets/js/jquery.min.js"></script>
  <script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/4.0/1/MicrosoftAjax.js"></script>
  <script type="text/javascript" src="../_layouts/15/sp.runtime.js"></script>
  <script type="text/javascript" src="../_layouts/15/sp.js"></script>
  <script type="text/javascript" src="../_layouts/15/sp.ui.controls.js"></script>
  <script type="text/javascript" src="../_layouts/15/sp.taxonomy.js"></script>
  <meta name="WebPartPageExpansion" content="full" />
  <link rel="stylesheet" type="text/css" charset="UTF-8"
    href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
  <link rel="stylesheet" type="text/css"
    href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
  <link rel="stylesheet" href="../SiteAssets/css/fabric.min.css" />
  <link rel="stylesheet" href="../SiteAssets/css/Main.css" />
  <script
    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBEQC7aWXruMiVIMfR_ev-7AFFqs96xn2c&libraries=place"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">

</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
  <div id="allsuggestions" style="overflow: hidden;"></div>
  <script type="text/javascript" src="../SiteAssets/js/bundle.js"></script>
</asp:Content>