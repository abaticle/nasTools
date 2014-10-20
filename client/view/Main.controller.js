sap.ui.controller("view.Main", {

    onBeforeShow: function(evt) {

    },

    onInit: function() {
        this._setLanguage();
        this._initAppModel();
        this._getMovies();
    },


    onCopyTap: function(evt) {
        var listModel = Util.byId("Main.List").getModel();
        var panel = evt.getSource().getParent().getParent();
        var download = panel.getContent()[0];
        var binding = evt.getSource().getBindingContext();
        var path = binding.getObject().path;
        var url = Util.getUrl("copyMovie");

        panel.setExpanded(true);

        app.socket.on("copy", function(copyData) {
            if (copyData.path == path)
                download.setPercentValue(copyData.percent);
        });

        url += "?path=" + path;

        jQuery.ajax(url, {
            type: "GET",
            dataType: "json",
            async: true,
            success: function(result) {
                Util.message(result.message);

                panel.setExpanded(false);

                listModel.setProperty(binding.getPath() + "/isCopied", true);

                download.setPercentValue(0);
            },
            error: function(jqXHR, exception) {
                Util.message("Erreur lors de la copie");
            }
        });

    },

    onGetSubtitleTap: function(evt) {

        var binding = evt.getSource().getBindingContext();
        var path = binding.getObject().path;
        var url = Util.getUrl("getSubtitle");

        url += "?path=" + path;

        Util.loadStart();

        jQuery.ajax(url, {
            type: "GET",
            dataType: "json",
            async: true,
            success: function(result) {
                var listModel;;

                console.log(result);
                Util.loadEnd();

                if (result.type === "error") {
                    Util.message("Impossible de trouver un sous titre");
                } else if (result.type === "success") {
                    Util.message("Sous titre téléchargé");

                    listModel = Util.byId("Main.List").getModel();
                    listModel.setProperty(binding.getPath() + "/hasSubtitles", true);
                }
            },
            error: function(jqXHR, exception) {
                Util.loadEnd();
                Util.message("Erreur lors de la récupération du sous titre");
            }
        });
    },

    onPreviousTap: function() {
        var app = Util.getGlobalModel("app");

        app.date++;

        Util.setGlobalModel("app", app);

        this._getMovies();
    },

    onNextTap: function() {
        var app = Util.getGlobalModel("app");

        app.date--;

        Util.setGlobalModel("app", app);

        this._getMovies();
    },


    _initAppModel: function() {
        Util.setGlobalModel("app", {
            date: 0
        })
    },

    _getMovies: function() {
        var app = Util.getGlobalModel("app");
        var url = Util.getUrl("getMovies");

        url += "?date=" + app.date;

        Util.loadStart();

        jQuery.ajax(url, {
            type: "GET",
            dataType: "json",
            async: true,
            success: function(result) {
                var model = new sap.ui.model.json.JSONModel();

                model.setData(result);

                Util.loadEnd();
                Util.byId("Main.List").setModel(model);

            },
            error: function(jqXHR, exception) {
                Util.loadEnd();

                sap.m.MessageToast.show("Erreur de chargement");
            }
        });
    },

    _setLanguage: function() {

        var lang = sap.ui.getCore().getConfiguration().getLanguage();

        //Set default language
        if (lang != "fr" && lang != "en")
            lang = "en";

        var model = new sap.ui.model.resource.ResourceModel({
            bundleName: "Language.language",
            bundleLocale: lang
        });

        sap.ui.getCore().setModel(model, "i18n");

    }
});
