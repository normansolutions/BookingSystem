<%@ Application Language="C#" %>

<%@ Import Namespace="System.Web.Routing" %>
<%@ Import Namespace="Microsoft.AspNet.SignalR.Hosting.AspNet" %>


<script runat="server">
    void Application_Start(object sender, EventArgs e) 
    {
        System.Web.Routing.RouteTable.Routes.MapHubs();   
    }
    void Application_End(object sender, EventArgs e) 
    {
    }
    void Application_Error(object sender, EventArgs e) 
    { 
    }
    void Session_Start(object sender, EventArgs e) 
    {
    }
    void Session_End(object sender, EventArgs e) 
    {
    }
</script>