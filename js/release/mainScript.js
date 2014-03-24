/// <reference path="jquery.min.js" />
;$(function () {

    //Variables to cache
    var STMBookingordered = 0;
    var selectedAllTickets = $('div.ticketChange');
    var eventToBookSelector = $('#eventName');
    var eventDetailSelector = $("#eventName");
    var eventDateSelector = $("#eventDate");
    var eventAdultCostSelector = $('#eventAdult');
    var eventChildCostSelector = $('#eventChild');
    var eventStaffCostSelector = $('#eventStaff');
    var totalCostAdult = eventAdultCostSelector.data('adultcost');
    var totalCostChild = eventChildCostSelector.data('childcost');
    var totalCostStaff = eventStaffCostSelector.data('staffcost');
    var confirm = $('#confirm');
    var fullNameSelector = $("#bookingFullName");
    var daughtersNameSelector = $("#bookingNameChild");
    var bookingNameSelector = $("#bookingName");
    var emailCheckSelector = $("#bookingNameCheck");
    var confirmSelectorEventUser = $('#confirm > .eventConfirmUser');
    var confirmSelectorEventName = $('#confirm > .eventConfirmName');
    var confirmSelectorEventDate = $('#confirm  > .eventConfirmDate');
    var confirmSelectorEventAdult = $('#confirm   > blockquote > p.adult');
    var confirmSelectorEventChild = $('#confirm   > blockquote > p.child');
    var confirmSelectorEventStaff = $('#confirm   > blockquote > p.staff');
    var confirmSelectorTotalCost = $('#confirm   > blockquote > p.totalCost');
    var confirmSelectorPayment = $('#confirm   > blockquote > p.payment');
    //

    //Function to check if email Regex
    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    }

    //Function to get encrypted quesrystring
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if (results == null)
            return "";
        else
            return (results[1].replace(/\+/g, " "));
    }



    ////Start
    var hub = $.connection.bookingHub;

    hub.client.ticketTotal = function (data, grouping, remaining, totalAvailable) {

        var nextGroup = (data % grouping) ? 1 : 0;
        var dataCalc = parseInt((data / grouping) + nextGroup, 10);

        if (selectedAllTickets.hasClass('ticketTaken')) {
            selectedAllTickets.removeClass('ticketTaken').addClass('ticket');
        }
        var selectedTaken = $('div.ticketChange:lt(' + dataCalc + ')');

        selectedTaken.addClass('ticketTaken').removeClass('ticket');


        $("span.actualTotal").html(remaining);


        //10% Low Message
        if (remaining < (10 / 100) * totalAvailable && remaining > 0) {
            $("<div />", {
                'class': 'messageBar10',
                text: "Less Than 10% Low Ticket Warning"
            }).hide().prependTo("body").delay(300).slideDown('slow').delay(7000).slideUp(function () { });

        }

        //25% Low Message
        if (remaining < (25 / 100) * totalAvailable && remaining > (10 / 100) * totalAvailable) {
            $("<div />", {
                'class': 'messageBar25',
                text: "Less Than 25% Low Ticket Warning"
            }).hide().prependTo("body").delay(300).slideDown('slow').delay(7000).slideUp(function () { });

        }

        //Sold Out Message
        if (remaining < 1) {
            $("<div />", {
                'class': 'messageBar0',
                text: "Sorry - This Event Is Sold Out"
            }).hide().prependTo("body").delay(300).slideUp('slow').slideDown(function () { });
            $('#bookTickets').prop('disabled', true);
        }
    };


    //Confirm ticket process
    $(document).on('click', '#confirmTickets', function () {
        var currentTotal = (parseInt($("span.actualTotal").html(), 10));
        var fullName = fullNameSelector.val();
        var daughtersName = daughtersNameSelector.val();
        var name = bookingNameSelector.val();
        var eventToBook = eventToBookSelector.data('eventid');
        var adults = $('#customDropdownAdults :selected').val();
        var children = $('#customDropdownChildren :selected').val();
        var staff = $('#customDropdownStaff :selected').val();
        var payment = $('#customDropdownPayment :selected').val();        
        var adultTicketsToOrderValidated = (adults > 0 && adults.length < 3) ? adults : 0;
        var childrenTicketsToOrderValidated = (children > 0 && children.length < 3) ? children : 0;
        var staffTicketsToOrderValidated = (staff > 0 && staff.length < 3) ? staff : 0;

        if (currentTotal - (parseInt(adultTicketsToOrderValidated, 10) + parseInt(childrenTicketsToOrderValidated, 10) + parseInt(staffTicketsToOrderValidated, 10)) >= 0) {           
            hub.server.ticketBooking(fullName, daughtersName, name, eventToBook, adultTicketsToOrderValidated, childrenTicketsToOrderValidated, staffTicketsToOrderValidated, payment);
        }
        else {
            alert("I'm sorry, there is an error with that order - you are trying to order too many tickets.");
            confirm.trigger('reveal:close');          
            $("<div />", {
                'class': 'messageBar0',
                text: "Order NOT Processed!"
            }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function () { });
            return;
        }
        STMBookingordered = 1;
        confirm.trigger('reveal:close');
    });

    $(document).on('click', '#cancelTickets', function () {
        confirm.trigger('reveal:close');
    });

    //Start Signalr
    $.connection.hub.start().done(function () {
        $(function () {
            var eventToBook = eventToBookSelector.data('eventid');
            hub.server.updateBooking(eventToBook).then(function updateBook() {
                $(document).on('click', '#bookTickets', function () {
                    var bookingForm = $("#bookingForm");
                    bookingForm.validate();
                    if (!bookingForm.valid()) {
                        return false;
                    }
                    //var confirm = $("#confirm");
                    var eventDetail = eventDetailSelector.text();
                    var eventDate = eventDateSelector.text();
                    var adults = $('#customDropdownAdults :selected').val();
                    var children = $('#customDropdownChildren :selected').val();
                    var staff = $('#customDropdownStaff :selected').val();
                    var payment = $('#customDropdownPayment :selected').val();
                    var emailCheck = emailCheckSelector.val();
                    var name = bookingNameSelector.val();
                    var fullname = fullNameSelector.val();
                    var daughtername = daughtersNameSelector.val();
                    var adultCost = totalCostAdult * adults;
                    var childCost = totalCostChild * children;
                    var staffCost = totalCostStaff * staff;
                    var totalCost = adultCost + childCost + staffCost;

                    //check that tickets have been selected
                    if (adults + children + staff < 1) {
                        alert("I'm sorry, there is an error with that order - you have not selected any tickets.");
                        confirm.trigger('reveal:close');
                        $("<div />", {
                            'class': 'messageBar0',
                            text: "Order NOT Processed!"
                        }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function () { });
                        return;
                    }


                    confirmSelectorEventUser.html("A confirmation email shall be sent to: <br/> <b>" + name + "</b>");
                    confirmSelectorEventName.html("For the event: " + eventDetail);
                    confirmSelectorEventDate.html(eventDate);
                    confirmSelectorEventAdult.html(adults + " Adult Tickets");
                    //confirmSelectorEventChild.html(children + " Child Tickets");
                    confirmSelectorEventStaff.html(staff + " Staff Tickets");
                    confirmSelectorTotalCost.html('Total Cost: £' + totalCost.toFixed(2));
                    //confirmSelectorPayment.html('Payment Method: ' + payment);

                    if (parseInt($("span.actualTotal").html(), 10) < 1) {
                        alert("Sorry - this event is sold out");
                        return false;
                    }

                    ////Check email is same in both boxes
                    //if (name != emailCheck) {
                    //    $("<div />", {
                    //        'class': 'messageBar0',
                    //        text: "Order NOT Processed - Please Check Your Email Address"
                    //    }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function() {});
                    //    bookingNameSelector.focus(); //focus on email field
                    //    alert("Sorry - there was an error with this order - please check your email address is valid");

                    //    return false;
                    //}

                    ////Check if email is correct format
                    //if (!isValidEmailAddress(name)) {
                    //    $("<div />", {
                    //        'class': 'messageBar0',
                    //        text: "Order NOT Processed - Please Check Your Email Address"
                    //    }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function() {});
                    //    bookingNameSelector.focus(); //focus on email field
                    //    alert("Sorry - there was an error with this order - please check your email address is valid");

                    //    return false;
                    //}


                    ////Check there is a fullname
                    //if (fullname =="") {
                    //    $("<div />", {
                    //        'class': 'messageBar0',
                    //        text: "Order NOT Processed - Please Check You Have Entered Your Name"
                    //    }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function () { });
                    //    fullNameSelector.focus(); //focus on email field
                    //    alert("Sorry - there was an error with this order - please check you have entered your name");

                    //    return false;
                    //}


                    ////Check there is a student name
                    //if (daughtername == "") {
                    //    $("<div />", {
                    //        'class': 'messageBar0',
                    //        text: "Order NOT Processed - Please Check You Have Entered Your Daughters Name"
                    //    }).hide().prependTo("body").delay(500).slideDown('slow').delay(7000).slideUp(function () { });
                    //    daughtersNameSelector.focus(); //focus on email field
                    //    alert("Sorry - there was an error with this order - please check you have entered your daughters name");

                    //    return false;
                    //}



                    confirm.reveal({
                        closed: function () {
                            if (STMBookingordered == 1) {
                                window.location = ("https://booking.st-marys-shaftesbury.co.uk/thanks/?e=" + getParameterByName('e'));
                            }
                        }
                    });
                });
            });
        });
    });
})