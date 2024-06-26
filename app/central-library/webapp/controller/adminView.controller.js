sap.ui.define([
    "./baseController",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Token, Filter, FilterOperator, MessageToast, JSONModel) {
        "use strict";

        return Controller.extend("com.app.centrallibrary.controller.adminView", {
            onInit: function () {
                // welcome msg
                MessageToast.show("Welcome to the Central Library");

                const newBookModel = new JSONModel({
                    authorName: "",
                    title: "",
                    quantity: "",
                    availableQuantity: "",
                    ISBN: "",
                    genre: "",
                });
                const newLoanModel = new JSONModel({

                    borrowerName: "",
                    borrowerUserId: "",
                    borrowingBookName: "",
                    borrowingBookISBN: "",
                    dueOn: ""
                    
                });

                this.getView().setModel(newBookModel, "newBookModel");
                this.getView().setModel(newLoanModel, "newLoanModel");

                //  MultiInputs start
                const oAdminView = this.getView()
                const sAuthor = oAdminView.byId("idAuthorInputValue"),
                    sBookName = oAdminView.byId("idTitleInputValue"),
                    sBookISBN = oAdminView.byId("idISBNInputValue")
                const oMultiInputs = [sAuthor, sBookName,sBookISBN]

                oMultiInputs.forEach((inputs) => {
                    inputs.addValidator(function (args) {
                        if (true) {
                            var text = args.text;
                            return new Token({ key: text, text: text });
                        }
                    });

                });
               
                // route to specific ui
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.attachRoutePatternMatched(this.onCurrentUserDetails, this);

            },
            onCurrentUserDetails: function (oEvent) {
                const { userId } = oEvent.getParameter("arguments");
                this.ID = userId;
                const sRouterName = oEvent.getParameter("name");
                const oForm = this.getView().byId("idAdminDataPage");

                oForm.bindElement(`/UserLogin(${userId})`, {
                    expand: ''
                });
            },
            onLogoutPress: function () {
                const oRouter = this.getOwnerComponent().getRouter()
                MessageToast.show("Successfully Logged Out")
                oRouter.navTo("RouteloginView")

            },

            onFilterClick: function () {
                debugger
                const oAdminView = this.getView(),
                    sAuthor = oAdminView.byId("idAuthorInputValue").getTokens(),
                    sBookName = oAdminView.byId("idTitleInputValue").getTokens(),
                    sBookISBN = oAdminView.byId("idISBNInputValue").getTokens(),
                    oBooksTable = oAdminView.byId("idBooksTable"),
                    aFilters = [];

                

                var aInputsFields = [sAuthor, sBookName,sBookISBN];
                aInputsFields.forEach((inputs) => {
                    if (inputs) {
                        inputs.filter((ele) => {
                            sAuthor.length > 0 ? aFilters.push(new Filter("authorName", FilterOperator.EQ, ele.getKey())) : "";
                            sBookName.length > 0 ? aFilters.push(new Filter("title", FilterOperator.EQ, ele.getKey())) : "";
                            sBookISBN.length > 0 ? aFilters.push(new Filter("ISBN", FilterOperator.EQ, ele.getKey())) : "";
                        })
                    }

                })
                oBooksTable.getBinding("items").filter(aFilters);
            },
            onClear: function () {
                const oAdminView = this.getView(),
                    sAuthor = oAdminView.byId("idAuthorInputValue").destroyTokens(),
                    sBookName = oAdminView.byId("idTitleInputValue").destroyTokens();
                    sBookISBN = oAdminView.byId("idISBNInputValue").destroyTokens();
            },

            onRefresh: function () {
                debugger
                this.getView().byId("idBooksTable").getBinding("items").refresh()

            },
            onEditBook: async function () {
                debugger
                
                if (!this.oCreateBookPop) {
                    this.oCreateBookPop = await this.loadFragment("createBook")
                }

                var oSelected = this.byId("idBooksTable").getSelectedItem();
                if (oSelected) {
                    
                    var oAuthorName = oSelected.getBindingContext().getObject().authorName
                    var oBookname = oSelected.getBindingContext().getObject().title
                    var oStock = oSelected.getBindingContext().getObject().quantity
                    var oavailableStock = oSelected.getBindingContext().getObject().availableQuantity
                    var ogenre = oSelected.getBindingContext().getObject().genre
                    var oISBN = oSelected.getBindingContext().getObject().ISBN

                    const newBookModel = new JSONModel({
                        authorName: oAuthorName,
                        title: oBookname,
                        quantity: oStock,
                        availableQuantity: oavailableStock,
                        genre: ogenre,
                        ISBN: oISBN,
                    });
                    this.getView().setModel(newBookModel, "newBookModel");
                   
                    this.oCreateBookPop.open()
                }
                else {
                    MessageToast.show("Select an Item to Edit")
                }

            },
          
            onCreateBtnPress: async function () {
                debugger
                if (!this.oCreateBookPop) {
                    this.oCreateBookPop = await this.loadFragment("createBook")
                }
                this.oCreateBookPop.open()

            },

            onUpdateBook: function () {
                var oPayload = this.getView().getModel("newBookModel").getData()
                var oTable = this.getView().byId("idBooksTable");
                var oSelectedItem = oTable.getSelectedItem();
                var sBookName = oSelectedItem.getBindingContext().getObject().title
                var oModel = this.getView().getModel()

                var oBookBinding = oModel.bindList("/Books");
                oBookBinding.filter([
                    new Filter("title", FilterOperator.EQ, sBookName)
                ]);

                var oThis = this
                oBookBinding.requestContexts().then(function (aBookContexts) {
                    if (aBookContexts.length > 0) {
                        var oBookContext = aBookContexts[0];
                        var oBookData = oBookContext.getObject();
                        

                        oBookContext.setProperty("title", oPayload.title);
                        oBookContext.setProperty("authorName", oPayload.authorName);
                        oBookContext.setProperty("quantity", oPayload.quantity);
                        oBookContext.setProperty("availableQuantity", oPayload.availableQuantity);
                        oBookContext.setProperty("genre", oPayload.genre);

                        oBookContext.setProperty("ISBN", oPayload.ISBN);

                        const oAvalStock = parseInt(oPayload.availableQuantity)
                        const oStock = parseInt(oPayload.quantity)
                        if (oAvalStock <= oStock) {
                            // Submit the changes
                            oModel.submitBatch("updateGroup").then(function () {
                                oTable.getBinding("items").refresh();
                                oThis.oCreateBookPop.close();
                                MessageToast.show("Book Updated Successfully");
                            }).catch(function (oError) {
                                oThis.oCreateBookPop.close();
                                sap.m.MessageBox.error("Failed to update book: " + oError.message);
                            })
                        } else {
                            MessageToast.show("Avilable Stock should be lesser or equal to the Stock")
                        }

                    } else {
                        MessageToast.show("Book not found");
                    }
                });
            },
            onCreateBook: function () {
                debugger
                var oView = this.getView()
                var oModel = this.getView().getModel(),
                    oBinding = oModel.bindList("/Books")
                // var oContext = this.getView().byId("idBooksTable").getBinding("items")
                var oNewBook = this.getView().getModel("newBookModel").getData();
                oBinding.create(oNewBook, {
                    success: function () {
                        MessageToast.show("Book created successfully");

                    },
                    refresh: oView.byId("idBooksTable").getBinding("items").refresh(),
                    // setData:oView.getModel("newBookModel").setData(),
                    error: function () {
                        MessageToast.show("Error creating book");
                    }
                });
               
                this.oCreateBookPop.close()
                
            },
            onCloseCreateBookDailog: function () {

                if (this.oCreateBookPop.isOpen()) {
                    this.oCreateBookPop.close()
                }

            },

            onDeleteBooks: function (oEvent) {
                // debugger;
                var oSelected = this.byId("idBooksTable").getSelectedItem();
                if (oSelected) {
                    var oBookName = oSelected.getBindingContext().getObject().title;

                    oSelected.getBindingContext().delete("$auto").then(() => {

                        MessageToast.show(oBookName + " SuccessFully Deleted");

                    },
                        (oError) => {
                            MessageToast.show("Deletion Error: ", oError);
                        });
                    this.getView().byId("idBooksTable").getBinding("items").refresh();

                } else {
                    MessageToast.show("Please Select a Book to Delete");
                }
            },

            onActiveLoansClick: async function () {
                debugger
                if (!this.oActiveLoanPopUp) {
                    this.oActiveLoanPopUp = await this.loadFragment("ActiveLoans")
                    
                }
                this.oActiveLoanPopUp.open();
                this.getView().byId("idLoanTable").getBinding("items").refresh();

            },
            onCloseActiveLoans: function () {
                // debugger;
                
                if (this.oActiveLoanPopUp.isOpen()) {
                    this.oActiveLoanPopUp.close();
                }

            },
            onReservationsClick: async function () {
                debugger
                if (!this.oReservationsDialog) {
                    this.oReservationsDialog = await this.loadFragment("Reservations")
                    
                }
                this.getView().byId("idReservationsTable").getBinding("items").refresh();
                this.oReservationsDialog.open()
            },

            onIssueBookFromReservations: function () {
                debugger


                const oAdminView = this.getView(),
                    oSelected = oAdminView.byId("idReservationsTable").getSelectedItem()
                if (!oSelected) {
                    MessageToast.show("Please select a reservation to issue the book");
                }
                const oUserContext = oSelected.getBindingContext(),
                    oUserName = oSelected.getBindingContext().getObject().ReservedUserName,
                    oUserId = oSelected.getBindingContext().getObject().ReservedUserId,
                    oBookName = oSelected.getBindingContext().getObject().ReservedBook;

                let futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 15);
                var oYear = futureDate.getFullYear()
                var oMonth = futureDate.getMonth() + 1
                var oDay = futureDate.getDate()
                var oDateAfter15days = `${oYear}-${oMonth}-${oDay}`



                const oModel = this.getView().getModel(),
                    oBooksTable = this.getView().byId("idBooksTable");

                // Find the book in the books table and check the available quantity
                var oBookBinding = oModel.bindList("/Books");
                oBookBinding.filter([
                    new Filter("title", FilterOperator.EQ, oBookName)
                ]);

                oBookBinding.requestContexts().then(function (aBookContexts) {
                    if (aBookContexts.length > 0) {
                        var oBookContext = aBookContexts[0];
                        var oBookData = oBookContext.getObject();

                        if (oBookData.availableQuantity > 0) {
                            const oBindList = oModel.bindList("/Activeloans");
                            oBindList.create({
                                borrowerName: oUserName,
                                borrowerUserId: oUserId,
                                borrowingBookName: oBookName,
                                dueOn: oDateAfter15days
                            })
                            oUserContext.delete("$auto").then(function () {
                                MessageToast.show("Book Issued")
                            })
                            oBookData.availableQuantity -= 1; // Updating qty
                            oBookContext.setProperty("availableQuantity", oBookData.availableQuantity);
                            oModel.submitBatch("updateGroup");

                        } else {
                            MessageToast.show("Book not available yet")
                        }
                    } else {
                        MessageToast.show("Book not available to issue")
                    }
                });
            },

            onReservationsClose: function () {
                if (this.oReservationsDialog.isOpen()) {
                    this.oReservationsDialog.close();
                }
            },
            onAddNewLoanPress: async function () {
                debugger
                let futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 15);

                var oYear = futureDate.getFullYear()
                var oMonth = futureDate.getMonth() + 1
                var oDay = futureDate.getDate()
                var oDateAfter15days = `${oYear}-${oMonth}-${oDay}`


                if (!this.oNewLoanDailog) {
                  
                    this.oNewLoanDailog = await this.loadFragment("loanCreate")
                  


                    const newLoanModel = new JSONModel({
                        borrowerName: "",
                        borrowerUserId: "",
                        borrowingBookName: "",
                        borrowingBookISBN: "",
                        dueOn: oDateAfter15days
                    });
                    this.getView().setModel(newLoanModel, "newLoanModel");

                }
                this.oNewLoanDailog.open()
            },
            onNewLoanDailogClose: function () {
                if (this.oNewLoanDailog.isOpen()) {
                    this.oNewLoanDailog.close();
                }
            },
            onDateChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();

                // Regular expression to validate date format YYYY-MM-DD
                var regex = /^\d{4}-\d{2}-\d{2}$/;

                if (sValue.match(regex)) {
                    // Check current date
                    var enteredDate = new Date(sValue);
                    var currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);  // Set to midnight to only compare dates

                    if (enteredDate >= currentDate) {
                        oInput.setValueState("None");
                        MessageToast.show("Date is valid")
                        // const flag = true
                    } else {
                        oInput.setValueState("Error");
                        MessageToast.show("Date cannot be in the past date.");
                    }
                } else {
                    oInput.setValueState("Error");
                    MessageToast.show("Invalid date format. Please use YYYY-MM-DD.");
                }
            },
            onSaveNewLoan: function () {
                try {
                    debugger;
                    var oModel = this.getView().getModel(),
                        oBindList = oModel.bindList("/Activeloans");
                    var oNewLoan = this.getView().getModel("newLoanModel").getData();
                    var sEnteredUserId = oNewLoan.borrowerUserId;
                    var sEnteredUserName = oNewLoan.borrowerName;
                    var sEnteredBookISBN = oNewLoan.borrowingBookISBN;
                    var sBookName = oNewLoan.borrowingBookName;
                    var othis = this

                    if (sEnteredUserId) {
                        var oModel = this.getView().getModel();
                        var oUserBinding = oModel.bindList("/UserLogin");

                        oUserBinding.filter([
                            new Filter("userid", FilterOperator.EQ, sEnteredUserId),
                            new Filter("userName", FilterOperator.EQ, sEnteredUserName),
                        ]);

                        oUserBinding.requestContexts().then(function (aUserContexts) {
                            debugger;
                            if (aUserContexts.length > 0) {
                                // Find the book based on book name
                                var oBookBinding = oModel.bindList("/Books");
                                oBookBinding.filter([
                                    new Filter("title", FilterOperator.EQ, sBookName),
                                    new Filter("ISBN", FilterOperator.EQ, sEnteredBookISBN)
                                ]);

                                oBookBinding.requestContexts().then(function (aBookContexts) {
                                    if (aBookContexts.length > 0) {
                                        var oBookContext = aBookContexts[0];
                                        var oBookData = oBookContext.getObject();

                                        if (oBookData.availableQuantity > 0) {
                                            oBookData.availableQuantity -= 1; // Updating qty
                                            oBindList.create(oNewLoan); //newloan 
                                            oBookContext.setProperty("availableQuantity", oBookData.availableQuantity);
                                            oModel.submitBatch("updateGroup").then(function () {
                                                othis.oNewLoanDailog.close();
                                                MessageToast.show("Book issued")


                                            })
                                        } else {
                                            MessageToast.show("Book not available")
                                        }
                                    } else {
                                        MessageToast.show("Book data not found");
                                    }
                                });

                            } else {
                                MessageToast.show("User data not matching with existing records");
                            }
                        });
                        // this.oActiveLoanPopUp.close();
                    } else {
                        MessageToast.show("Enter correct user Data to Continue");
                    }
                } catch (error) {
                    MessageToast.show(error);
                }
            },
            
            onClearLoanButtonPress: function () {
                debugger;
                const oAdminView = this.getView(),
                    oSelected = oAdminView.byId("idLoanTable").getSelectedItem();

                if (oSelected) {
                    var oSelectedContext = oSelected.getBindingContext(),
                        oLoanData = oSelectedContext.getObject(),
                        sBookName = oLoanData.borrowingBookName, // Assume bookName is part of the loan data
                        oModel = this.getView().getModel(),
                        oUser = oLoanData.borrowerName;

                    // Delete the selected loan
                    oSelectedContext.delete("$auto").then(function () {
                        MessageToast.show(oUser + " Loan Closed");

                        // Increase the book quantity by one
                        var oBookBinding = oModel.bindList("/Books");
                        oBookBinding.filter([
                            new Filter("title", FilterOperator.EQ, sBookName)
                        ]);

                        oBookBinding.requestContexts().then(function (aBookContexts) {
                            if (aBookContexts.length > 0) {
                                var oBookContext = aBookContexts[0];
                                var oBookData = oBookContext.getObject();
                                var oQuan = oBookData.availableQuantity
                                var iQuan = parseInt(oQuan)
                                var ofinalQuan = iQuan + 1;

                                oBookContext.setProperty("availableQuantity", ofinalQuan);
                                oModel.submitBatch("updateGroup", {
                                    success: function () {
                                        MessageToast.show("Book quantity updated successfully");
                                    },
                                    error: function (oError) {
                                        MessageToast.show("Error updating book quantity: " + oError.message);
                                    }
                                });
                            } else {
                                MessageToast.show("Book not found");
                            }
                        });
                    },
                        function (oError) {
                            MessageToast.show("Deletion Error: " + oError.message);
                        });

                    this.getView().byId("idLoanTable").getBinding("items").refresh();
                } else {
                    MessageToast.show("Please Select a user to close the loan");
                }

                this.oDeleteCautionDailog.close();
            }



            

        });
    });

