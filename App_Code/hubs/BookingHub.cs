using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR.Hubs;
using WebMatrix.Data;
using System.Web.Helpers;
using Microsoft.AspNet.SignalR;


public class BookingHub : Hub
{

    public void UpdateBooking(int eventToBook)
    {

        var data = 0;
        var grouping = 0;
        var remaining = 0;
        var totalAvailable = 0;

        var db = Database.Open("Booking");


        var availabilitySQL = "select * from BookingSys_TicketsAvailable where eventID = @0";

        var available = db.Query(availabilitySQL, eventToBook);
        foreach (var a in available)
        {
            totalAvailable = a.totalAvailability;
            remaining = a.remaining;
            data = a.totalAvailability - a.remaining;
            grouping = a.grouping;
        }

        Clients.All.ticketTotal(data, grouping, remaining, totalAvailable);

    }

    public void TicketBooking(string fullName, string daughtersName, string name, int eventToBook, int adults, int children, int staff, string payment)
    {
        var db = Database.Open("Booking");
        var totalAvailable = 0;
        var grouping = 0;
        var newUpdatedData = 0;
        var remaining = 0;
        var totalToCheck = adults + children + staff;
        var eventNameForEmail = "";
        var eventDateForEmail = "";
        decimal eventCostForAdultEmail = 0;
        decimal eventCostForChildEmail = 0;
        decimal eventCostForStaffEmail = 0;
        var totalCost = 0.00;

        var availabilitySQL = "select * from BookingSys_TicketsAvailable where eventID = @0";
        var eventDetailsForEmailSQL = "select * from BookingSys_EventDetailsView where ID = @0";

        var insertSQL = "insert into BookingSys_Bookings (FullName, DaughtersName, Name, Eventid, Adultticket, Childticket, StaffTicket, Payment) values (@0,@1,@2,@3,@4,@5,@6,@7)";
        if (totalToCheck > 0 && totalToCheck < 100 && name.Length > 0)
        {
            db.Execute(insertSQL, fullName, daughtersName, name, eventToBook, adults, children, staff, payment);
        }


        var available = db.Query(availabilitySQL, eventToBook);
        foreach (var a in available)
        {
            totalAvailable = a.totalAvailability;
            remaining = a.remaining;
            newUpdatedData = a.totalAvailability - (a.remaining);
            grouping = a.grouping;
        } 

        Clients.All.ticketTotal(newUpdatedData, grouping, remaining, totalAvailable);

        var eventdetails = db.Query(eventDetailsForEmailSQL, eventToBook);
        foreach (var e in eventdetails)
        {
            eventNameForEmail = e.EventName;
            eventDateForEmail = e.DateStart.ToString("dddd dd MMMM yyyy");            
            eventCostForAdultEmail = e.EventAdultTicket;
            eventCostForChildEmail = e.EventChildTicket;
            eventCostForStaffEmail = e.EventStaffTicket;
            totalCost = (adults * Convert.ToDouble(eventCostForAdultEmail)) + (children * Convert.ToDouble(eventCostForChildEmail)) + (staff * Convert.ToDouble(eventCostForStaffEmail));         
        }   


        WebMail.Send(
            to: name,
            bcc:"boxofficeconfirmation@st-marys-shaftesbury.co.uk",
            from: "boxoffice@st-marys-shaftesbury.co.uk",
            subject: "Booking Confirmation",
            body: "Dear " + fullName + "<br/><br/>This email confirms that you have booked: <br/><br/> " + adults + ": adult tickets. <br/>" + children + ": children tickets. <br/>" + staff + ": staff tickets. <br/>For the " + eventNameForEmail + " performance.<br/>Date: " + eventDateForEmail + "<br/>Total Cost: £" + (string.Format("{0:f2}", totalCost)) + "<br/>Payment Method: " + payment + "<br/><br/>We hope you enjoy the show!<br/><br/>(please make cheques payable to 'St Mary’s School Shaftesbury Trust')<br/><br/><br/>IF YOU BELIEVE YOU HAVEN'T PLACED THIS BOOKING, THEN PLEASE COULD YOU CONTACT THE SCHOOL ASAP ON TEL: 44 (0)1747 852416."
        );

    }
}
