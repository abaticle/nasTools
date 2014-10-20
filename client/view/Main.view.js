jQuery.sap.declare("Application");
jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.jsview("view.Main", {

    getControllerName: function() {
        return "view.Main";
    },

    onBeforeShow: function(evt) {
        this.getController().onBeforeShow(evt);
    },

    createContent: function(ctrl) {

        this.page = new sap.m.Page("Main.Page", {

            //Header
            customHeader: new sap.m.Bar({
                contentLeft: [
                    new sap.m.Label({
                        text: {
                            path: "app>/date",
                            formatter: Formatter.currentDay
                        }
                    }).addStyleClass("extTitle").addStyleClass("extTextWhite")
                ],
                contentRight: [
                    new sap.m.Button({
                        icon: "sap-icon://navigation-left-arrow",
                        tap: [ctrl.onPreviousTap, ctrl]
                    }).addStyleClass("extTextWhite"),
                    new sap.m.Button({
                        icon: "sap-icon://navigation-right-arrow",
                        visible: {
                            path: "app>/date",
                            formatter: Formatter.nextDay
                        },
                        tap: [ctrl.onNextTap, ctrl]
                    }).addStyleClass("extTextWhite")
                ]
            }).addStyleClass("extBar").addStyleClass("extBackgroundBlue"),


            //Contenu
            content: [

                new sap.m.VBox("Main.List", {
                    items: {
                        path: "/",
                        template: new sap.m.Panel({
                            expanded: false,
                            expandable: true,
                            headerToolbar: new sap.m.Toolbar({
                                content: [
                                    new sap.m.Text({
                                        text: "{name}"
                                    }),
                                    new sap.m.ToolbarSpacer(),
                                    new sap.m.Button({
                                        icon: "sap-icon://complete",
                                        type: {
                                            path: "isCopied",
                                            formatter: Formatter.buttonType
                                        },
                                        enabled: {
                                            path: "isCopied",
                                            formatter: Formatter.buttonEnabled
                                        },
                                        tap: [ctrl.onCopyTap, ctrl]

                                    }),
                                    new sap.m.Button({
                                        icon: "sap-icon://post",
                                        type: {
                                            path: "hasSubtitles",
                                            formatter: Formatter.buttonType
                                        },
                                        enabled: {
                                            path: "hasSubtitles",
                                            formatter: Formatter.buttonEnabled
                                        },
                                        tap: [ctrl.onGetSubtitleTap, ctrl]
                                    })
                                ]
                            }),
                            content: [
                                new sap.m.ProgressIndicator({
                                    percentValue: 0,
                                    showValue: false
                                })
                            ]
                        }).addStyleClass("extMoviePanel")
                    }
                }).addStyleClass("extMovieVBox")
            ]
        }).addStyleClass("extPage");

        return this.page;
    }
});
