var Util = {


    getUrl: function(name) {
        return [
            "http://",
            config.webServerIP,
            ":",
            config.webServerPort,
            "/",
            config[name].url
        ].join("");
    },

    /*
     *   Shortcut..
     */
    byId: function(id) {
        return sap.ui.getCore().byId(id);
    },

    setGlobalModel: function(id, data) {
        var model = sap.ui.getCore().getModel(id);

        if (model === undefined) {
            model = new sap.ui.model.json.JSONModel();
        }

        model.setData(data);

        sap.ui.getCore().setModel(model, id);
    },

    getGlobalModel: function(id) {
        return sap.ui.getCore().getModel(id).getData();
    },

    message: function(message) {
        sap.m.MessageToast.show(message);
    },

    /*
     *  Récupere les données JSON
     */
    getData: function(dataName, param) {

        var url;

        if (config.localMode)
            url = config.localDomain + config[dataName].url;
        else
            url = config.SAPDomain + config[dataName].url;

        if (param != undefined) {
            url += param;
        }

        return jQuery.ajax(url, {
            dataType: "json",
            async: true
        });
    },

    /*
     *  Ouverture de la boîte de chargement
     */
    loadStart: function(title) {

        if (!title)
            title = "Chargement";


        var busyDialog = sap.ui.getCore().byId("BusyDialog");

        if (!busyDialog) {
            busyDialog = new sap.m.BusyDialog('BusyDialog', {
                text: title
            });
        }

        busyDialog.open();
    },


    /*
     *  Fermeture de la boîte de chargement
     */
    loadEnd: function() {
        var busyDialog = sap.ui.getCore().byId("BusyDialog");

        if (busyDialog) {
            busyDialog.close();
        }
    }

}
