sap.ui.define([
    "./baseController",
    // "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"


],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, Filter, FilterOperator, JSONModel) {
        "use strict";

        return Controller.extend("com.app.centrallibrary.controller.loginView", {
            onInit: function () {
                debugger
                // const oPage = this.getView().byId("idLoginObjectPage");
                // oPage.attachBrowserEvent("dblclick", this.onDoubleClick.bind(this));
                const oNewUserRegister = new JSONModel({
                    userName: "",
                    userid: "",
                    userpassword: ""
                })
                this.getView().setModel(oNewUserRegister, "oNewUserRegister")

            },

            onLoginPress: async function () {
                if (!this.oLoginDailogPopUp) {
                    this.oLoginDailogPopUp = await this.loadFragment("loginPopup")
                }
                this.oLoginDailogPopUp.open();

            },

            onCloseLoginDailog: function () {
                if (this.oLoginDailogPopUp.isOpen()) {
                    this.oLoginDailogPopUp.close()

                }
            },
            onUserLoginPress: function () {
                var oView = this.getView();

                var sUserID = oView.byId("idUserIDInput").getValue();
                var sPassword = oView.byId("idPasswordInput").getValue();

                if (!sUserID || !sPassword) {
                    MessageToast.show("please enter required Credentials");
                    return;
                }

                var oModel = this.getView().getModel();
                var oBinding = oModel.bindList("/UserLogin");

                oBinding.filter([
                    new Filter("userid", FilterOperator.EQ, sUserID),
                    new Filter("userpassword", FilterOperator.EQ, sPassword)
                ]);

                oBinding.requestContexts().then(function (aContexts) {  //requestContexts is called to get the contexts (matching records) from the backend.
                    debugger
                    if (aContexts.length > 0) {
                        var ID = aContexts[0].getObject().ID;
                        var userType = aContexts[0].getObject().typeOfUser;
                        var sUser = aContexts[0].getObject().userName;
                        if (userType === "Admin") {
                            MessageToast.show(sUser + " " + "Login Successful");
                            var oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteAdminView", { userId: ID });
                            var oView = this.getView()
                            oView.byId("idUserIDInput").setValue("");
                            oView.byId("idPasswordInput").setValue("");
                        }
                        else {
                            MessageToast.show("Login Successful");
                            var oRouter = this.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteUserView", { userId: ID });
                            var oView = this.getView()
                            oView.byId("idUserIDInput").setValue("");
                            oView.byId("idPasswordInput").setValue("");
                        }

                    } else {
                        MessageToast.show("Invalid username or password.");
                    }
                }.bind(this)).catch(function () {
                    MessageToast.show("An error occurred during login.");
                });
            },

            onSignUpPress: async function () {
                if (!this.oSignUpDialog) {
                    this.oSignUpDialog = await this.loadFragment("Signup")
                }
                this.oSignUpDialog.open()
            },
            onCreateAccount: function () {
                debugger
                const oNewUserName = this.getView().byId("idSignUpUserName").getValue(),
                    oNewUserId = this.getView().byId("idSignUpUserIdVal").getValue(),
                    oNewUserPassword = this.getView().byId("idSignUpUserPassword").getValue(),
                    oNewUserConfirmPassword = this.getView().byId("idSignUpUserConfirmPasswordval").getValue();


                if (oNewUserName && oNewUserId && oNewUserPassword) {
                    debugger
                    
                    const oContext = this.getView().getModel().bindList("/UserLogin")
                    var oNewUser = this.getView().getModel("oNewUserRegister").getData();
                    if (oNewUserPassword === oNewUserConfirmPassword) {
                        //last change here 
                        var oModel = this.getView().getModel();
                        var oBinding = oModel.bindList("/UserLogin");

                        oBinding.filter([
                            new Filter("userid", FilterOperator.EQ, oNewUserId),
                        ]);

                        oBinding.requestContexts().then(function (aContexts) {  //requestContexts is called to get the contexts (matching records) from the backend.
                            debugger
                            if (aContexts.length > 0) {
                                MessageToast.show("User ID already exists")
                            } else {
                                oContext.create(oNewUser)
                                MessageToast.show("Registration Successfull")
                                this.oSignUpDialog.close()

                               

                            }

                            
                        })

                    }
                    else {
                        MessageToast.show("password must match")
                    }
                } else {
                    MessageToast.show("Enter all required fields ");
                }
            },
            onSignUpCancel: function () {
                if (this.oSignUpDialog.isOpen()) {
                    this.oSignUpDialog.close()
                }

            }


        });
    });

